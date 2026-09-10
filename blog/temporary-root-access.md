---
layout: doc
title: "Root for a One-Off Fix: Least Privilege and Just-in-Time Privileged Access"
description: "Hand out root for a one-off fix or not? How to implement least privilege and just-in-time privileged access: deny by default, grant on demand, auto-expire, and audit every action — with an open source bastion host as a JumpServer/Teleport alternative."
head:
  - - meta
    - name: keywords
      content: just-in-time access, least privilege, temporary elevation, privileged access management, PAM, root access, jump server, bastion host, open source bastion, JumpServer alternative, Teleport alternative, Next Terminal
  - - meta
    - property: og:title
      content: "Root for a One-Off Fix: Least Privilege and Just-in-Time Privileged Access"
  - - meta
    - property: og:description
      content: "Deny by default, grant on demand, auto-expire, audit everything — replacing permanent root with just-in-time privileged access."
---

# Root for a One-Off Fix: Least Privilege and Just-in-Time Privileged Access

"Give me root, I'll run one command and give it back." A DBA messages: "I need root to check a slow query." A contractor emails: "Production access, just two days." Every operator has handled these requests. Grant it and the privilege lands in someone else's hands — and rarely walks away on its own. Refuse and the escalation and delivery queue stall on you. The real problem is treating a temporary need and a permanent grant as the same thing: either you grant it forever, or you give nothing. Least privilege and just-in-time (JIT) privileged access exist to answer exactly this question — let the right person hold just enough privilege for just as long as they need it, then take it back automatically.

## Why Permanent Root Always Becomes a Liability

The principle of least privilege states the obvious: an account should hold only the minimum privilege required for the task at hand, and only for as long as it is needed. Handing out root permanently breaks three things at once.

**Scope is unbounded.** root means every command, every file, every network path, every syscall. A slow-query investigation needs a fraction of a percent of that, yet the grant hands over all of it. The larger the privilege, the larger the blast radius of a typo or an escalation.

**Time is unbounded.** Every grant starts as "just for a minute," but the privilege has no expiry. Six months later it is still there, because no one remembered to revoke it. Revocation that depends on human memory will inevitably leak.

**Identity is indistinguishable.** When many actions run as root, the logs collapse into a single identity. When something breaks, you cannot tell whether that `drop` was a legitimate investigation or an attacker acting on a compromised account.

A single sudoers line shows how bad the scope problem gets:

```bash
# One line that hands the entire machine to a single account
devops  ALL=(ALL) NOPASSWD: ALL
```

`NOPASSWD: ALL` means that account can run any command without a password, and `sudo -i` or `sudo su -` both drop it straight into an interactive root shell — functionally identical to handing over the root password. Worse, these lines tend to hide in some corner of `/etc/sudoers.d/`, and after a while nobody remembers who added them or why.

Permanent root tends to detonate in three moments: someone leaves or transfers and the grant is forgotten; the password is phished or brute-forced and the attacker inherits top privilege; a stray `rm -rf` or a dropped table detonates with no guardrail because the account held everything. These are not edge cases — they are combinations that become near-certain given enough time.

## Least Privilege, Broken Into Four Moves

Least privilege is not a slogan. It is four moves: deny by default, grant on demand, revoke when done, and log everything.

| Move | Meaning | The mistake that breaks it |
| --- | --- | --- |
| Deny by default | New accounts and new sources start with no access | A single broad grant opened for everyone to save effort |
| Grant on demand | Grant only the slice this task needs | "Just give them root" to skip the evaluation |
| Revoke when done | Privilege carries an expiry and dies on its own | Revocation left to memory, so nobody revokes |
| Log everything | Every action inside the grant maps to a person and a time | Grant without audit, so incidents cannot be traced |

Most teams manage the first two. It is the last two — especially "revoke when done" — that get skipped. And revocation and audit are precisely what decide whether the scheme is real or just paperwork.

## Can sudo Do Just-in-Time Access on Its Own?

A common counter-argument: "I don't hand out root, I just give sudo — isn't that enough?" sudo is genuinely better than handing over root, but it cannot actually deliver "auto-expiring access."

sudo's `timestamp_timeout` controls **authentication caching** — how long after entering your password you can run sudo again without re-entering it (15 minutes by default). Many people mistake this for "authorization expiry," but they are two different things: when the cache expires, the user simply re-enters their own password and keeps going. The grant itself has no expiry at all.

A sudoers rule cannot express "this grant dies on a specific date" either. To revoke, you edit the config or delete the rule — and nothing ever reminds you that it is time to. In other words, sudo solves "grant a little less, leave some trace," but it does not solve "take it back automatically." That is exactly why temporary elevation needs a dedicated mechanism rather than hand-maintained sudoers files: the accumulated `NOPASSWD: ALL` lines in your sudoers are, in effect, an unmaintained list of permanent root.

## JIT Versus "Permanent" and "Shared Root"

Placed next to the two other common patterns, just-in-time access stands out clearly:

| Pattern | Revocation | Trace granularity | Escalation risk |
| --- | --- | --- | --- |
| Permanent root / sudo | Left to memory | Down to the account | High |
| Shared root | Change the password, notify everyone | Cannot distinguish people | Very high |
| Just-in-time access | Expires automatically | Down to person + action | Low |

The core of JIT is converting a grant from "held forever" into "requested — granted — auto-expired": privilege appears briefly when needed, vanishes when the task ends or the timer runs out, and every step in between is logged. It does not aim to make everyone powerless; it separates "whether you have access" from "when you should have access" into two controllable dimensions.

## When to Use Temporary Access, and When to Keep Standing Access

JIT is not a blanket rule — applied in the wrong place it just slows people down. There is a single test: is this privilege something this task needs and no longer needs once the task ends?

Temporary access fits: one-off troubleshooting (reading a log, changing one config), emergency changes, short-term vendor or contractor onboarding, and high-risk operations where audit demands "use it and hand it back." Standing access fits: stable, repeated privileges that are part of a role, such as a read-only query for an on-call engineer — but even these should be reviewed periodically rather than granted once and forgotten.

A short mapping of common requests to recommended handling settles arguments faster than any debate:

| Common request | Recommended handling |
| --- | --- |
| Dev wants root to run one command | Temporary access with an expiry that auto-revokes |
| On-call wants read-only log access | Standing read-only access, reviewed periodically |
| Vendor or contractor short-term onboarding | Temporary access with an explicit end date |
| Vendor wants sudo to install an agent | Temporary access + command filtering + full audit |

Writing this test into the request entry point beats any manual: every request must answer "what am I doing, and until when?" A request that cannot answer both is rejected by default.

## Three Walls to Climb Before JIT Actually Works

**The flow must stay light.** If elevation requires three forms and a two-day approval, people will route around it and ask for root directly, and the mechanism becomes decorative. Request, approval, and grant should close in minutes; heavyweight approval belongs only on the most sensitive assets.

**Revocation must be automatic.** "Revoke it when you're done" is not revocation. A grant must carry an explicit expiry that the system enforces — not a reminder to "please remember to revoke." The single test for whether you are really doing JIT is whether the revocation step is executed by code or by conscience.

**Everything inside the window must be logged.** Temporary access is not a free pass on auditing. The higher the privilege and the shorter the window, the more the actions must be replayable and attributable. Otherwise "a one-time root grant" becomes the hardest-to-investigate gap in your audit trail.

There is one more trap that is easy to miss: temporary grants quietly become permanent through repeated renewal. The same contractor requests the same privilege week after week, the approver gets tired, and eventually flips it to standing access — and the JIT scheme slides back into permanent root. The fix is to make the approval screen explicitly show "this grant has been renewed N times," forcing every decision to make a grant permanent to happen deliberately, in the open, rather than slipping through on fatigue.

Before building any of this, take stock of the debt you already carry — find which accounts currently hold permanent root/sudo:

```bash
# Inventory which accounts and groups currently hold sudo (your standing-privilege debt)
sudo grep -RhE '^[^#[:space:]].*' /etc/sudoers /etc/sudoers.d/ 2>/dev/null
getent group sudo wheel 2>/dev/null

# Cross-reference with login records to see which privileged accounts are still active
last -n 20
```

That second command matters: an account that has not logged in for six months but still holds sudo is the clearest evidence that revocation has failed.

## Turning JIT Into a System, Not a Promise

Implementing JIT requires three pieces: an authorization model that can grant and revoke by person, asset, and time; an expiry that enforces itself; and an audit trail that maps every action back to a person. As one example, the open source bastion host Next Terminal lets its [resource authorization](/usage/authorization) carry an explicit expiry — temporary operations, vendors, and incident handling get a grant with a deadline that dies on its own, with no one left to remember to revoke it — while [command filtering](/usage/ssh-server) and [session audit](/usage/audit) record who did what inside that window. The flow is much the same with JumpServer, Teleport, or any comparable product; only the UI and naming differ.

The hard part was never the technology. It is turning "temporary" from a verbal promise into an expiry timestamp in a system — so that privilege stops being "granted and stays" and becomes "granted and goes away," and least privilege finally lands.
