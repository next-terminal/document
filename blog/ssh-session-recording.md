---
layout: doc
title: "What Really Happened on That Server? SSH Session Recording and Audit"
description: "SSH is end-to-end encrypted, so a server keeps the results but not the process. This article explains how SSH session recording and audit works: why shell history and auditd fall short, what a recording actually captures, which layer to record at, and how to turn recordings into traceable, tamper-resistant evidence."
head:
  - - meta
    - name: keywords
      content: ssh session recording, ssh audit, session replay, ops audit, command audit, bastion host audit, ssh recording, Next Terminal
  - - meta
    - property: og:title
      content: What Really Happened on That Server? SSH Session Recording and Audit
  - - meta
    - property: og:description
      content: Why shell history and auditd are not enough, what a session recording actually captures, and how to retain it as tamper-resistant evidence.
---

# What Really Happened on That Server? SSH Session Recording and Audit

A disk gets wiped, a config change goes wrong, a database is dropped, or a machine suddenly runs a process nobody recognizes. After any incident, the first question is always the same: who was it, when, what did they type, and what did they see. SSH session recording and audit exist to answer exactly that — to reconstruct a remote operation from its result back into its process.

The hard part is that SSH is end-to-end encrypted. It promises confidentiality and integrity, not "operations are traceable." By default a server keeps only the *results* of commands — a pile of scattered logs — and not the screen or the context the operator actually saw. So when you try to answer "what happened," you find there is no complete record to read. This article walks through four questions: why per-host history and auditd are not enough, what a recording actually captures, which layer is trustworthy enough to record at, and how to turn recordings into tamper-resistant evidence.

## Why you cannot reconstruct the truth: history and logs only keep results

On a server with no audit hardening, these are roughly the only artifacts you can dig through afterward, and each one is missing a critical piece:

| Artifact | What it records | What is missing |
|----------|-----------------|-----------------|
| shell history | Commands typed in interactive shells | No default timestamps, one command wipes it, no output |
| auditd | Kernel-level syscalls like execve/open | A syscall stream, not a session — hard to reconstruct context |
| last / wtmp | Login and logout events | Only "who came," never "what they did" |

`~/.bash_history` is the file people trust first and are disappointed by first. It has no timestamps unless you explicitly set `HISTTIMEFORMAT`; it only records interactive shells, so a non-interactive `ssh host 'command'` never lands there. Most damning of all — it can be erased completely:

```bash
# history has no timestamps by default; add this line to enable them
export HISTTIMEFORMAT="%F %T "
# any of these wipes the record
history -c
> ~/.bash_history
unset HISTFILE
```

For a user with a shell, erasing their own traces takes one command. Bash history is also per-user, so root would have to go digging through someone else's home directory to see what they did. Using history for audit means handing the evidence to the very person being audited.

auditd takes a different path: it records system calls at the kernel level, so it can capture things like `execve("/bin/rm", ...)` and even non-interactive commands. But its output is a massive syscall stream — one `ls` produces hundreds of records — and reconstructing "what did this person do in this session" means joining records by session ID and parent process ID, which is noisy. Worse, auditd's rules are managed by root, so when the subject of the investigation *is* root, the record's credibility is in doubt.

`last` and `wtmp` only log login and logout events: who, when, from which IP. They prove "this person was here," not "this person did this." During an incident review, these three artifacts together usually produce the same weak judgment: "someone logged in, and then the system broke."

These mechanisms also share one ceiling: they all live on the managed server itself, where root can edit and delete them. "Server-side self-auditing" is, in essence, asking the audited party to keep their own diary. It is barely adequate for reconstructing ordinary mistakes, but the moment an incident involves deliberate sabotage or post-intrusion cleanup, its credibility drops to zero. To break through that ceiling, the record has to move off the managed machine.

## What a recording actually captures: the PTY byte stream, not commands

To understand session auditing, start with what a "session" technically is. On the server side, an SSH login roughly looks like this: sshd allocates a PTY for the connection and starts a login shell; every keystroke from the operator is written by sshd into the PTY master side, while the shell and its child programs read input from the slave side and write output back. A terminal session is, at its core, this PTY (pseudo-terminal) byte stream — keystrokes as input, program output as output, interleaved into one continuous stream. A session recording captures that stream, which is why playback shows not just the commands, but the output, the edits in vim, and the refreshing screen of `top`: everything the operator's eyes saw.

This is where a frequently confused distinction lives: **command logging** and **session recording** are two different things. Command logging parses the input stream to extract "what was typed," discarding output and interactive context — small and easy to search. Session recording keeps the full byte stream and is evidence-grade. A serious audit setup usually wants both: recordings for evidence and replay, command parsing for fast search and dangerous-command blocking.

Session recording is irreplaceable because it reconstructs what command logs never can: a command typed and then deleted, the sensitive output of a `cat`, the decisions made at an interactive prompt. Command logging records "the one that got Enter pressed"; recording captures "the whole process."

Recordings also come in two forms, online and offline. An *online* session lets an administrator watch a live connection in real time — useful for immediate intervention when someone is on call. An *offline* recording is the on-disk replay and the primary subject of post-incident forensics. Most setups genuinely depend on the latter: live watching can stop a mistake as it happens, but what is retained and admissible as evidence is always the offline recording.

At the single-machine level, the simplest recording tool is `script` from util-linux:

```bash
script -q --timing=session.timing session.log
# ... do your work ...
exit
# later, replay with timing
scriptreplay -t session.timing session.log
```

`script` works by inserting a PTY between the operator and the shell and copying the traffic in both directions to disk. `asciinema` and `ttyrec` are the same idea in different implementations. But they share a crippling weakness: they all require the operator to launch them voluntarily. They are client-side, manual, per-session — an attacker who simply doesn't run them leaves nothing behind, so they can never serve as non-repudiable evidence.

## Which layer to record at: server, client, or the middle

Recording can happen at three places, and their credibility is not equal.

**The client side** is the weakest. It only records what the operator's own tool saw; if nothing is recorded, there is nothing, and it is useless for forensics.

**The server side** works on each machine. Using the `command=` option in `authorized_keys` or sshd's `ForceCommand`, you can force every login into a recording wrapper, transparent to the client. The problems: it must be configured on every machine and every key, and it spirals out of control as the fleet grows. More fatally, the recording file sits on the server itself, where root can edit or delete it — which destroys the point of "evidence." The very incidents you want to prove are often committed by whoever holds the highest privilege. There is also a hidden blind spot: a login-shell recording does not capture traffic that bypasses the shell. `scp` transfers, `sftp` sessions, and `ssh -N` port forwarding never go through the login shell, so wrapping only the login shell leaves these operations unrecorded.

**The middle layer** — a proxy or gateway — is the only place that scales. Route all SSH access through one node, and that node sees the plaintext byte stream in between, so centralized recording and unified storage come naturally; it also avoids instrumenting every program, because it copies the stream wholesale as it passes. The cost is twofold. First, that middle layer must become the *only* way in, or it records only a fraction of the traffic and the audit has holes. Second, you have to face the trust point it introduces: since the middle layer sees all plaintext, "who operates this middle layer" itself becomes an extremely privileged role, and the operator-to-middle-layer leg still needs two-factor authentication — don't let the entry point you added for auditing become the new weak link.

## Recording is not the finish line: tamper resistance and retention make it evidence

Many people treat "we can record" as the end of the audit story, but recording is only the beginning. A recording file stored on a machine the operator can reach is worth nothing — its forensic value comes from being impossible for the involved party to rewrite afterward. Session auditing that actually holds up needs three things:

- Recordings stored where operators cannot reach them: object storage with versioning or object lock, not on the managed server itself;
- A defined retention period, such as no less than 180 days, set by policy or compliance requirements;
- "Delete recordings" as a permission separate from "operate on servers" — an ordinary admin with root should still be unable to remove them.

The relationship between command logs and recordings shows up here too: recordings handle "evidence and replay," while command parsing handles "fast search and dangerous-command blocking." With only command logs, you can find the `rm -rf`, but not the `cd` that preceded it or the prompt the operator saw before running it. With only recordings and no parsing, hundreds of machines pile up into mountains of footage, and finding the key frames during an incident takes forever.

Two practical issues also tend to be overlooked. One is storage cost: full byte-stream recordings become substantial at scale, and the retention period directly determines the bill, so compression and transcoding — turning the raw stream into a compact, replayable format — must be considered from day one. The other is that graphical sessions (RDP and similar) produce far heavier recordings than plain-text SSH; replay and storage are not on the same order of magnitude, and retention policy often has to treat protocols separately.

## Landing it at a single entry point: a bastion host is that middle layer

When all SSH access is funneled through one entry point, session recording stops being "configure every machine separately" and becomes "obtained for free at the gate." The open-source bastion host Next Terminal does exactly this: sessions are [recorded and replayed](/usage/access) as they pass through, with [command filtering](/usage/ssh-server) to block dangerous commands, [database auditing](/usage/database) to log SQL and file operations, and [asset management](/usage/asset) to tighten "who can touch which host," while recordings are retained locally or in object storage — provided, again, that all access flows through it so nothing is missed. From a compliance standpoint, frameworks like Multi-Level Protection (等保), ISO 27001, and SOC 2 tend to demand two layers of "operational traceability": pinning actions to a person *and* retaining evidence — command-level logs are often insufficient for forensics, which is why session recording becomes a hard requirement rather than an option. The mapping of these capabilities to compliance and internal-audit controls is covered under [compliance and audit](/usage/compliance).

When choosing, the trade-offs come down to two questions: do you only need "who typed which command" (command logging is enough — cheap and searchable), or "what did they actually see" (full session recording); and where do the recordings live, and who can delete them. Session auditing only means something once you've thought through "recordings must be beyond the operator's reach" — otherwise it is just a pile of large files that will eventually be cleaned up.
