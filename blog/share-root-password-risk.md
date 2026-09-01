---
layout: doc
title: "Still Sharing Root Passwords? Permissions and Auditing for Teams"
description: "Shared root passwords are a top security risk in multi-person operations. Next Terminal open source bastion host centralizes credentials, grants per-user/per-group access, blocks dangerous commands, and records sessions — a JumpServer and Teleport alternative for team permission management and ops auditing."
head:
  - - meta
    - name: keywords
      content: shared root password, ops auditing, permission management, bastion host, open source bastion, JumpServer alternative, Teleport alternative, Next Terminal
  - - meta
    - property: og:title
      content: Still Sharing Root Passwords? Permissions and Auditing for Teams
  - - meta
    - property: og:description
      content: Centralize credentials, grant per-user access, block dangerous commands, and record sessions to move past shared root passwords.
---

# Still Sharing Root Passwords? Permissions and Auditing for Teams

Sharing the root password is still common in many small and medium teams: one root account, one password, handed to whoever needs server access. The motivation is usually convenience, but once a team grows beyond two or three people, that convenience quickly turns into a serious problem for permission management and ops auditing — you cannot tell who ran that dangerous command, and you cannot trace an incident back to a specific person after the fact.

This article covers three things for multi-person operations: why sharing the root password has to stop, how to converge accounts and permissions into a "one account per person, grant on demand" model, and how to use an open source bastion host to turn every operation into an auditable record. It uses Next Terminal as the concrete example; the same thinking applies when evaluating JumpServer, Teleport, and similar alternatives.

## 1. Why sharing the root password has to stop

Let's start with the three real risks of a shared root password.

**First, you cannot tell who did what.** When one password is shared by many people, the logs only ever show the single identity `root`. If a database is dropped or a config is changed by mistake, you cannot answer "who did this" — you can only rely on memory and guesswork.

**Second, access cannot be revoked.** When an employee leaves or a contractor engagement ends, the password — and any screenshot or forwarded copy of it — remains valid unless you change it. Changing it is itself costly, because you have to notify everyone who still relies on it.

**Third, one leak compromises everything.** A shared root credential typically carries the highest privilege. Once leaked, an attacker can reach every host that uses the same password, with almost no resistance to lateral movement.

Imagine a typical incident: a core database gets hit by a stray `drop table` in the early hours, and the business starts failing the next day. The security team digs through the logs and finds only a single `root` operation record — they don't know which on-call engineer did it, nor whether it was human error or post-compromise abuse. That is the most dangerous part of shared credentials: they erase both "who" and "why", the two elements an audit depends on most.

These three problems share one root cause: **"identity" and "credential" are both collapsed into a single shared root**. The fix is correspondingly direct — give each person their own account, collect credentials into central management, and record every operation as evidence. This is exactly the problem a bastion host exists to solve.

## 2. One account per person, centralized credentials

The first step in multi-person operations is to let each operator sign in with their own account instead of a shared root. This requires two things working together:

- **Accounts belong to people**: everyone has an independent account in the bastion host, so every login maps precisely to a person.
- **Credentials are centralized**: the real accounts and passwords of target assets (servers, databases, network devices) are no longer handed out to individuals. They are stored as shared "credentials", and personal accounts use them indirectly through the bastion host — without ever seeing the plaintext.

In Next Terminal, this layer is implemented via shared credentials: you register an asset's account and password once, then select "credential" as the account type when adding an asset so it can be reused (see [Asset Management](/usage/asset)). Operators sign in only with their own bastion account, and the system decides — based on authorization — which assets they can reach and with what privilege, instead of everyone holding root.

Once this is done, the root password can stop being distributed at all, and can even be rotated on a schedule without disrupting daily work — because nobody depends on directly holding it anymore. Rotation and revocation happen centrally in the bastion host, and a single change takes effect across all related assets, which the "everyone holds the password" model can never do.

## 3. Least-privilege authorization by person, group, and asset

Giving each person an account is only the first step. The second is to make "who can access what" explicit — that is **least privilege**.

The principle of least privilege is that each person holds only the minimum scope needed to do their job. In practice you cut it along three dimensions:

| Dimension | Question it answers | Capability in Next Terminal |
|-----------|---------------------|-----------------------------|
| Person/group | Who is this account, and which team | Users and user groups; asset authorization can target a person |
| Asset | Which server/database can be reached | Asset groups and authorization scope ([Asset Management](/usage/asset)) |
| Privilege | Read, connect, or modify | Per-asset authorization + command filtering (below) |

Beyond per-person grants, user groups let you authorize a batch of same-role people at once instead of configuring each one; login policies can also constrain access time and source (for example, business hours only, office network only), further narrowing the exposure.

Privilege is no longer "root means everything". Each asset and each account can be configured separately. A new hire gets only the few machines they own; on transfer or departure, you simply revoke the corresponding authorization in the bastion host — no shared-password change, and no "we changed the password but forgot to tell someone" awkwardness. This "grant on demand, revoke instantly" model is the key to team permission management (see [Access Assets](/usage/access) for details).

## 4. Strong authentication: from "know the password" to "prove it's you"

Once accounts belong to people, the next concern is preventing account takeover. With a shared password, the only authentication factor is "knowing the password". Moving into a bastion host lets you layer stronger authentication, raising the bar from "know the password" to "prove it's you":

- **TOTP / 2FA**: require a one-time code at login (see [2FA (TOTP)](/usage/otp)).
- **Passkey / WebAuthn**: passwordless sign-in using a device-bound passkey.
- **Enterprise IdP**: integrate the company's existing identity system over OIDC.
- **mTLS client certificate**: verify the client certificate at the reverse proxy before forwarding.

With these in place, even if an account password is phished or leaked, an attacker without the second factor or the matching device/certificate cannot get in. Combined with login policies that constrain time and source network, this forms a multi-part check of "who you are + where you are + whether you should be logging in now" — a sharp contrast to the "one password rules them all" world of shared root.

## 5. Dangerous commands: block beforehand, not after the fact

The ideal state of permission management is to stop a dangerous action before it happens. Under a shared root, root can run any command, so a mistake like `rm -rf /` has no buffer. A bastion host can add a gate at the command level.

Next Terminal provides command filtering through its SSH proxy server: high-risk commands are blocked or routed to approval, and only exempted/approved commands go through. A common tiered policy looks like this:

| Command example | Risk | Suggested policy |
|-----------------|------|------------------|
| `rm -rf /` | Deletes the root filesystem, unrecoverable | Block outright |
| `drop database ...` | Deletes an entire database | Block or require approval |
| `shutdown -h now` | Downtime affecting the business | Require approval |
| `chmod 777 /etc` | Overly permissive file modes | Audit alert |

Operators still use their familiar SSH client — no dedicated client software is required:

```bash
# Direct mode: connect straight to an authorized asset
ssh username:asset-name@host -p 2022
```

Paired with SQL auditing for databases (see [Database Audit](/usage/database)), even high-risk operations against a directly-connected database fall within the audit scope. This tiered-blocking approach is fundamentally a balance between security and efficiency: nobody gets arbitrary root-level execution, yet daily deploys and troubleshooting aren't slowed down. Command filtering moves "traceable after the fact" forward to "preventable before the fact". For configuration and the two connection modes, see [SSH Proxy Server](/usage/ssh-server).

## 6. Traceability for every step: session recording and audit

Permissions and blocking answer "who is allowed to do what"; auditing answers "who did what, and what evidence remains". This is the final piece of multi-person ops auditing — and the one most frequently checked by external audits (e.g. compliance and internal review).

Next Terminal's auditing capabilities include:

- **Session audit and recording**: SSH/RDP sessions can be recorded and replayed, covering both text and graphical sessions (see [Compliance & Audit](/usage/compliance)).
- **File operation logs**: SFTP uploads/downloads and other file operations are logged.
- **SQL auditing**: database operations are attributed to a person ([Database Audit](/usage/database)).
- **Access log analysis**: aggregated analysis of access behavior to surface anomalies (enhanced edition).

Evidence retention matters just as much: session recordings and operation logs can be stored locally or in object storage (such as S3) for long-term keeping, and with a defined retention period they satisfy internal and compliance requirements on evidence preservation.

With these in place, an incident can be traced from a single command back to "who, when, from which address, against which asset" — instead of staring at a screen full of `root` with nowhere to start.

## 7. A checklist for migrating off shared root

Pulling the steps together, a typical team can migrate from shared root to a bastion host like this:

1. Deploy the bastion host and wire up identity (see [Container Install](/install/container-install)), and open a unified entry point for SSH/database assets ([Agent Gateway](/usage/agent-gateway)).
2. Collect real asset credentials into shared credentials, build per-person/per-group authorization, and stop distributing the root password.
3. Add TOTP/Passkey or mTLS to high-risk assets.
4. Configure command filtering to block dangerous commands and route sensitive ones to approval.
5. Enable session recording and database auditing, and review access logs regularly.
6. Set up rotation and revocation: rotate credentials on a schedule, and revoke authorization on the day of departure or transfer.

The migration doesn't have to be big-bang; start with the most sensitive production servers and expand from there.

## 8. Two common migration mistakes

**Mistake one: assuming that taking back the root password equals compliance.** Moving the password into a credential store only changes "direct holding" into "indirect use"; if everyone still has maximum privilege and nothing is logged, the problem remains. The audit loop — recording, logs, replay — is what makes compliance real.

**Mistake two: blocking every command in one sweep.** Overly strict command filtering paralyzes operations and pushes people to route around it. A better approach is tiered: block dangerous commands outright, route sensitive ones to approval, and let routine commands run while being fully audited. This holds the line without sacrificing speed.

## Conclusion

A shared root password is the most expensive form of "convenience" in multi-person operations. Returning accounts to individuals, centralizing credentials, enforcing least privilege, blocking dangerous commands before they run, and auditing every step after — this combination is the core value of an open source bastion host. Next Terminal, as an open source bastion host and an alternative to JumpServer and Teleport, lets you deploy this mechanism privately in your own environment.
