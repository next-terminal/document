---
layout: doc
title: "Employee Left, but Their SSH Key Still Lives on Dozens of Servers: Key Rotation and Access Revocation"
description: "SSH key rotation and access revocation are the easiest thing to drop in multi-user operations: authorized_keys lives independently on every server, so when someone leaves you have no idea how many keys of theirs are still live. This article explains why keys scatter, how to decide which layer to rotate and revoke at, and how a bastion host or jump server centralizes credential revocation."
head:
  - - meta
    - name: keywords
      content: ssh key rotation, revoke ssh access, remove ssh key, authorized_keys management, offboarding ssh key, jump server, bastion host, credential rotation, Next Terminal
  - - meta
    - property: og:title
      content: "Employee Left, but Their SSH Key Still Lives on Dozens of Servers: Key Rotation and Access Revocation"
  - - meta
    - property: og:description
      content: authorized_keys lives on every server, so offboarding leaves you unsure how many keys are still live. How to rotate and revoke SSH access at the right layer.
---

# Employee Left, but Their SSH Key Still Lives on Dozens of Servers: Key Rotation and Access Revocation

A teammate hands in their notice and the handoff checklist rolls in: accounts, documents, the password vault, domains, the cloud console. You check items off one by one, and at the end you always stall on something you can't quite name — SSH keys. Their public key may be sitting in the `~/.ssh/authorized_keys` of server after server, and how many machines those are, whether they ever appended a few extra lines along the way, you can't say for sure. Passwords you can rotate and disable; a key, once it leaks out, is hard to ever confirm "do they still have a way in?" This article isn't about configuring a service. It's about one thing: **why keys scatter, and how to decide at which layer you rotate and revoke, so that a departure stops leaving behind a backdoor inventory nobody can count.**

## Keys scatter because authorized_keys is decentralized by design

SSH passwordless login works by dropping a public key into a target machine's `~/.ssh/authorized_keys`. That file exists under **every** account on **every** server, and there is no master server anywhere that records "how many public keys the whole company has and who holds each one." The way you onboard a new teammate is usually appending the public key they just generated onto each server one line at a time:

```
ssh-keygen -t ed25519 -C "zhangsan@workstation"
ssh-copy-id -i ~/.ssh/id_ed25519.pub zhangsan@10.0.0.12
```

The first line generates a key pair on their own machine; the second writes their public key to the target. Across ten machines that's ten `ssh-copy-id` runs or ten manual pastes. At small scale this is fine, but it plants a structural trap: **public keys are distributed point-to-point into each machine, and no inventory records "who has a way into which machines."** The more your servers look like hand-raised "pets," the deeper the trap goes; only once machines become configuration-managed "cattle" does the public key start to live alongside a source list that gets versioned.

So the problem isn't "forgot to register" — the mechanism itself has no central registry. To revoke, you have to walk back to every machine and read its authorized_keys. That's the most counterintuitive pain of offboarding: you think you're closing one "account," and it turns out to be dozens of public-key lines scattered across dozens of machines.

## At offboarding you face a pile of keys that don't say whose they are

Open the `~/.ssh/authorized_keys` on any machine and you'll likely see something like this:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK3q9...zhang@..
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... ubuntu@backup
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIL7mZ... (no comment)
```

Each line is one public key, and that trailing `zhang@` — or the empty spot where a comment would go — is just the comment written at generation time, not any kind of identity verification. What SSH actually compares during authentication is only the long base64 blob in the middle; whether the comment is written, wrong, or absent changes nothing about whether the key can log in.

This is what makes the offboarding moment so uncomfortable: you stare at that base64 and try to judge "which line belongs to the person who left," relying on nothing better than guessing at the comment string. A comment holding a work email is recognizable; one holding `zhang@`, `macbook`, or nothing at all leaves you guessing "I've never seen this line before." Shared accounts make it worse — one server with a single `ubuntu` or `root`, five or six people's public keys all crammed into the same account, so "remove this one person" can't be done by deleting the account, only by picking their key out of the pile.

This reveals the core judgment: **authorized_keys tells you "which keys exist," but not "who each key belongs to, or whether it's still valid."** Identity and access entry are disconnected, and the cost of that disconnection lands all at once the moment someone leaves.

## Rotation and revocation are two different things

Many people treat "key rotation" as one action: delete the old, generate the new. Taken apart, offboarding actually asks you to do two things with different goals:

| Scenario | The problem you face | What to do |
| --- | --- | --- |
| Private key suspected leaked | The key itself may already be outside its holder's hands | Deactivate the key: revoke the public key, pull the private key out of circulation, as fast as possible |
| A person leaves | The key isn't broken, but the holder should no longer have a way in | Revoke access: make this person's public key invalid on every machine |

When a private key leaks, you worry that "the lock has already been re-keyed," so you have to find every door this public key opens and change every lock. When a person leaves, lock and key are both intact; what you need is "the key in this person's hand no longer opens any door." Both converge on the same action — removing or replacing the public key in authorized_keys — but because the motive differs, the urgency and the scope judgment are completely different.

The leak scenario hides one easy-to-miss detail: **deleting a public key only stops future logins with that private key; it does not knock out an already-established connection.** If someone is holding that SSH session right now, removing the public key won't drop it. To cut it off immediately you have to terminate the process, check for long-lived `tmux`/`screen`/`nohup` leftovers, and check whether they routed around via `authorized_keys2` or another account. Revoking access is never as clean as "delete a line."

## Deciding which layer to do it at

The real question isn't "which tool," but where you sit on this spectrum — it decides how much effort to spend and at what layer rotation and revocation should live:

- **Two or three people, three to five machines**: walking each authorized_keys by hand is perfectly fine. You remember every machine, the public keys fit on one hand, and offboarding is a checklist pass, cost acceptable.
- **Machines are now delivered by configuration management**: put the public-key list into config management (or the authorized file of a jump host), and when personnel change you edit that **source list** and push it down. Revocation stops being a per-machine battle and becomes "change one place, push everywhere."
- **You need auditability, attribution, and every login traceable**: authorization stops existing as "a public key written into a machine" and converges on a middle layer — users no longer hold a key that reaches machines directly, and logins all pass through one entry that authorizes by role. Offboarding becomes: disable their account or authorization at the entry, everything goes dark, and you can pull the record of what they ever touched.

This spectrum points to a plain conclusion: **the more you rely on "handing the key directly to each person," the higher the revocation cost at offboarding and the larger the chance of a miss; the earlier you converge access onto a few centrally revocable nodes, the less painful personnel changes become.** That has nothing to do with choosing a specific product — it's the direction of your ops structure itself.

## Putting it into practice

If your team has reached the point where you need "attributable, auditable, centrally revocable," a bastion host is a natural landing spot on this spectrum: server credentials live in the middle layer, users access assets through one authorization point, and authorization, logins, and operations all leave a record. Taking Next Terminal as one example, it registers assets centrally (see [Asset Management](/docs/usage/asset)), routes access through the [SSH Gateway](/docs/usage/ssh-gateway) or [SSH Proxy Server](/docs/usage/ssh-server), and the flow is much the same as any comparable product — swap in another and the same steps apply. What actually makes a departure lightweight isn't any particular piece of software; it's whether you've pulled scattered keys back into a place you can shut with one click — pairing second-factor auth (see [OTP](/docs/usage/otp)) with role-based authorization (see [Audit Logs](/docs/usage/audit)), so "someone leaves someday" degrades from a per-machine sweep into a single switch.
