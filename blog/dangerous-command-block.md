---
layout: doc
title: "How Does rm -rf / Actually Get Executed? Blocking Dangerous Commands and Auditing Operations"
description: "Accidental execution of dangerous commands is the most common source of ops incidents. How rm -rf / and drop database get typed by hand, how to grade and block risky command patterns, and how command auditing and operation auditing leave a trail you can trace — practical guidance for a dangerous-command blocking strategy."
head:
  - - meta
    - name: keywords
      content: dangerous command, rm -rf, command blocking, command audit, operation audit, ops audit, risky command, bastion host, command filtering, Next Terminal
  - - meta
    - property: og:title
      content: How Does rm -rf / Actually Get Executed? Blocking Dangerous Commands and Auditing Operations
  - - meta
    - property: og:description
      content: How dangerous commands get executed by accident, how to grade and block them, and how command and operation auditing leave a trail you can trace.
---

# How Does rm -rf / Actually Get Executed? Blocking Dangerous Commands and Auditing Operations

`rm -rf /` is probably the most famous command in the ops world. Most of the time it's a joke, but once in a while it actually gets run, the root filesystem gets wiped, and production goes dark. Because a dangerous command like `rm -rf /` usually has no confirmation buffer, there's basically no undo once it fires. This post isn't about "be more careful." It's about breaking the problem down: how do dangerous commands actually get typed, can a team stop them before they run, and when you can't stop one, does command auditing tell you who did it, when, and on which box.

## 1. Dangerous commands aren't "a slip of the finger"

Blame "carelessness" and you explain nothing — and you fix nothing. Dangerous commands usually come from a few specific, very common situations stacking up.

**Wrong directory, wrong glob.** `rm -rf ./*` is meant to clear the current directory. But if a previous `cd` landed somewhere it shouldn't, or the shell started in the wrong place, the wildcard matches files you never intended to touch. Scripts that hard-code relative paths are a hotbed for exactly this.

**A variable expanded to empty, or to the wrong value.** `rm -rf $DIR/*`, and if `$DIR` isn't set or a config file didn't load, the shell expands it into `rm -rf /*`. A misplaced quote changes `"$DIR/"` into a completely different match. These failures have almost nothing to do with carelessness; the environment did it.

**One character shy of disaster.** `drop database` vs `drop table`, a missing `--` between a flag and a path — they handle totally different objects. After a long day of typing commands, nobody reliably eyeballs the risky part of every line.

There's a quieter enabler too: **destructive commands are far too easy to run.** `rm -rf`, formats, and truncates are a few characters, executed on Enter, with no second confirmation and no hesitation. The more frictionless the habit, the higher the odds of an accidental trigger.

## 2. Why these operations can't be undone

It's not just "there's no recycle bin." At the filesystem level, a delete only drops the directory entry; the data blocks may still be on disk — until some process writes to that area and overwrites them, at which point recovery tools stop helping. Databases are more direct: without a real backup, a `drop` or `truncate` is simply gone.

And the time window is brutal. From Enter to an unusable box can be tens of seconds, with no time for anyone to react. By the time you notice and reach for a backup, a cold restore takes hours and the service has already been down half a day. So the right answer isn't "handle it fast after it happens"; it's "make it unable to happen."

Here's a quick risk table for common dangerous operations, so you can see where things stack up.

| Command / Action | Risk | If it fires | Suggested policy |
|------------------|------|-------------|------------------|
| `rm -rf /`, `rm -rf ./*` | Critical | Filesystem wiped, host unrecoverable | Block outright |
| `drop database` / `truncate table` | Critical | Entire dataset lost | Block or route to approval |
| `dd if=/dev/zero of=/dev/sda` | Critical | Disk overwritten, usually irreversible | Block |
| `mkfs.ext4 /dev/sdX` | High | Partition data erased | Block or approval |
| `shutdown -h now`, `reboot` | High | Service outage | Route to approval |
| `chmod -R 777 /`, `chown -R` | Medium-high | Permission model broken, security risk | Audit + alert |
| `iptables -F`, flush firewall | Medium | Security posture drops instantly | Route to approval |

## 3. First, ask: what counts as "dangerous"

Before writing blocking rules, decide what "dangerous" means in *your* team. It's not the same everywhere. A dev in a test environment and a DBA in production have very different tolerance for `rm -rf /`. So grading should look past the command itself and at where it runs, who runs it, and when.

A few lines to grade against:

- **Irreversibility**: deleted, overwritten, formatted — gone forever. That's highest priority.
- **Blast radius**: affecting one box is contained; affecting a cluster or the whole database bumps it up.
- **Environment**: production stricter than staging; core assets stricter than edge ones.
- **Actor**: new hires, contractors, and 3am responders can be given more conservative policies.

Combine these and you get a workable graded policy instead of a blunt "deny list vs allow list." A lot of tools only support "ban this exact command," so `rm -rf` gets fully banned — which looks safe but actually stalls legitimate deploys and pushes engineers to work around the protection. Working around security is the more dangerous outcome.

## 4. Block beforehand: turn "traceable after" into "impossible before"

Habits can only do so much; self-discipline always leaks. To actually stop a dangerous command before Enter, you need something that wedges itself between the keystroke and execution. Two common shapes:

**Literal blocking.** A command in the rule set is refused outright, or forced through a confirm/approval step. This suits commands that are critical and have almost no legitimate use — `rm -rf /` is the textbook case.

**Graded release with approval.** Mid-risk commands are allowed, but logged and routed to approval; they only run once approved. A change request, a restart, a cleanup. The approval step is itself a buffer that makes the operator confirm once more.

If a deny list is "forbid," approval is "make it slow on purpose." A durable scheme needs both: critical ones blocked, sensitive ones approved before they run.

There's another point worth making: **almost any command-level scheme depends on commands actually landing on a channel you control.** If every engineer has a direct SSH account on the target, commands never cross your proxy, and whatever blocking rules you configured at the proxy are dead air. That's why this kind of scheme usually travels with access consolidation and a single entry point — blocking only works when the entry point is controlled.

## 5. When you can't block, command auditing is the floor

No rule set stops 100% of attacks and slips, and some rules misfire. So the second line of defense is command auditing — whether or not a command is allowed, every command during an operation leaves a record that lets you trace it to a person, a time, and an asset.

The job of command auditing is to answer "can we reconstruct what happened later": who ran this command, in which session, from what source address, and what did they do right before and after. Ideally you go from one command back to a full sequence of operations, not just a log line saying "someone deleted a file."

Beyond individual commands, session- and asset-level records are common too: session recordings replay what was on the screen, database operations can be logged by statement and by person ([database auditing](/usage/database)), and the whole set can be archived to satisfy internal-audit and compliance retention requirements ([compliance & auditing](/usage/compliance)). Auditing's endpoint isn't "we have logs"; it's "when something happens, we can produce an account."

## 6. One way to wire it: command filtering and auditing on a bastion host

By now we have a clean capability list: graded command blocking, approval-gated release, session recording, and operation and database auditing. Instead of assembling a pile of single-purpose tools, a single bastion host can act as proxy, blocker, and auditor at once ([secure gateway](/usage/agent-gateway)).

With Next Terminal, an open-source bastion host, it works roughly like this: an admin configures command filtering rules, sets `rm -rf /` and similar to block outright, and routes restarts and cleanups to approval; operators still connect with a standard SSH client ([SSH proxy server](/usage/ssh-server)). A command that hits a block rule is rejected on the spot; one that needs approval is pushed to an admin and only runs once approved. Every session keeps a recording and a command log, and with per-user, per-asset authorization layered on top ([asset management](/usage/asset)), you get the full loop: controlled entry, pre-execution blocking, and post-hoc audit. None of this requires installing a special client on every operator's machine — the proxy layer handles it.

## 7. Outside the tools, the stuff that still matters

Tools block commands; they don't replace a healthy respect for writing them. Three things that cost nothing, and often take effect before any tool does:

- **Make destructive operations awkward.** Give `rm`/`mv` an alias or a confirm habit — like defaulting `rm` to `rm -i` — so destruction gets an extra step and "freight-train muscle memory" tripping is less likely.
- **Absolute paths and validated variables in scripts.** Pin the target path in deletion scripts, `set -u` so an undefined variable can't expand to empty, and before touching a database, check that the environment variables point at the right instance.
- **Backup first.** Before any destructive change, confirm a restorable backup exists and check "can we recover, and how long does it take" as a pre-flight item — not just a "backed up, moving on."

Command auditing tells you who did it. Backups let you come back when it's broken. Blocking lets you not do it at all. Keep all three, and `rm -rf /` stays where it belongs — in the jokes.