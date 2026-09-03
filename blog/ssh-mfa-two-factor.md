---
layout: doc
title: "Is Key-Based SSH Login Enough? What Two-Factor Authentication Actually Adds"
description: "SSH two-factor authentication doesn't make login harder to guess — it makes a stolen credential insufficient on its own. How TOTP verifies offline, which attacks MFA can't stop, and whether to enforce it at sshd or at the bastion layer."
head:
  - - meta
    - name: keywords
      content: SSH MFA, SSH two-factor authentication, TOTP, bastion host, privileged access, PAM, second factor, Next Terminal
  - - meta
    - property: og:title
      content: Is Key-Based SSH Login Enough? What Two-Factor Authentication Actually Adds
  - - meta
    - property: og:description
      content: How TOTP verifies offline, which attacks MFA cannot stop, and where enforcement actually has teeth.
---

# Is Key-Based SSH Login Enough? What Two-Factor Authentication Actually Adds

A lot of people assume that switching SSH to key-based auth and disabling passwords means the security job is done. That's true at one layer — the server no longer gets brute-forced — but it misses a far more common failure path: the credential itself leaking. SSH two-factor authentication (MFA) closes exactly that gap. It doesn't make login harder to guess; it makes "I have the credential" no longer equal to "I can log in."

## The one class of attack key auth doesn't stop

Start with what key auth actually solves. Public-key authentication uses an asymmetric key pair; the private key is never transmitted during login, only a signature check is performed. That makes it effectively immune to remote brute force — the thousands of attempts in an SSH log are almost all aimed at password auth, and the noise disappears once you disable `PasswordAuthentication` and route access through a centralized SSH proxy (/usage/ssh-server).

But key auth has a trust boundary: **it trusts that whoever holds the private key is the authorized user.** That trust collapses the moment the key file is stolen, a backup drive leaks, a dev machine gets compromised, or the key circulates between several people. Once the private key is in someone else's hands, the server has no way to tell them apart from the real owner — because the credential is the key itself.

Password auth is worse in a different way: weak passwords, cross-site reuse, and credential stuffing all let an attacker "guess" their way in. A fail2ban rule in front of sshd doesn't help against someone who logs in once with a correct password.

In practice private keys leak through process gaps, not through cracking: a `.ssh` directory baked into a container image, a key pasted into a ticket or chat log, a backup with keys sitting on a shared NAS, a departed colleague's machine never wiped. Passwords leak through reuse — some forum gets breached, and the same password is tried against your email and your servers. The thread running through all of it: the attacker isn't getting "cracking ability," they're getting "a ready-made credential."

What these attacks share is simple: **the attacker has obtained something you know (a password) or something you have (a private key) and is impersonating you.** Single-factor auth can't see the impersonation — it only verifies that the credential is correct, not that the person holding it is the owner.

## What MFA actually adds

The point of two-factor authentication isn't "harder to guess." It's splitting identity proof into two independent assertions:

| Factor type | Examples | Common way it fails |
| --- | --- | --- |
| Something you know | Password, PIN | Credential stuffing, phishing, shoulder surfing |
| Something you have | TOTP on a phone, hardware token, Passkey | Device loss, SIM swap |
| Something you are | Fingerprint, face | Biometric leakage |

Real MFA requires a combination of **two different factor types** — say, a password plus a rotating code on your phone. "Password plus security-question answer" is still one factor and doesn't resist credential stuffing.

Why does the extra layer help? Because the routes an attacker uses to get your password — phishing, stuffing, leaked databases — usually don't reach your phone; and someone who steals your phone usually doesn't have your password. Two independent channels failing at once is far less likely than either one alone. That's the whole value of MFA; there's nothing more mystical behind it.

## How TOTP verifies without ever contacting the phone

The most common SSH-side MFA is TOTP (Time-based One-Time Password), the six digits that rotate every 30 seconds in an authenticator app. It has a counterintuitive property: **verification requires no communication between the server and the phone.**

The mechanism is a shared secret. At registration the server generates a random secret, encodes it into a QR code you scan into the app, and from then on both sides hold the same secret. On each tick, the phone hashes the "current time divided by 30 seconds" counter and truncates the result to six digits:

```
counter = floor(unix_time / 30)
digest  = HMAC_SHA1(secret, counter)
code    = dynamic_truncate(digest) % 1000000
```

The server takes the six digits you typed, runs the same algorithm with its copy of the secret, and accepts if they match. Because both sides rely on the shared secret and the clock rather than the network, the phone produces correct codes in airplane mode, and the server never has to push anything to it.

The same design explains TOTP's two known weaknesses. One is **clock drift**: if the phone and server disagree by too much, verification fails, which is why implementations usually allow a ±1 time-window tolerance. The other is **the secret can be copied**: if the registration QR code is screenshotted and leaked, an attacker can generate identical codes — which is exactly why real-time phishing proxies can relay TOTP, as below.

## SSH has no "second factor" field

An easy fact to overlook: the SSH protocol never reserved a slot for a "second verification step." In the standard flow, the client presents a username and one authentication method — password, public-key signature, or keyboard-interactive — and the server answers success or failure. One round, done.

So MFA is never as simple as "add a parameter to SSH." It's an extra layer wrapped around it:

- **At PAM.** sshd calls PAM and, after the public key checks out, demands an OTP; only when both pass does it admit you. The drawback, as above, is per-machine config.
- **Keyboard-interactive.** The interactive prompt carries the OTP, but compatibility and configuration overhead are both non-trivial.
- **At the gateway / bastion layer.** The client connects to the bastion first, completes "password-or-key + OTP" there, and the bastion then connects onward on your behalf. This is the least painful path today, because verification logic is fully decoupled from the backend servers.

Once you see this, the gap between "hand-rolled MFA scattered on sshd" and "MFA enforced at one bastion entry" is obvious: the former wraps the layer around every machine by hand, the latter turns it into a single door.

## The attacks MFA doesn't stop

MFA isn't a universal shield. Knowing its edges is what tells you where to spend effort next:

- **Already-established sessions.** MFA only applies at the login moment. If an attacker obtains a live session — a stolen terminal, an authorized SSH connection — MFA does nothing.
- **Adversary-in-the-middle phishing (AiTM).** The attacker hosts a fake login page and forwards your username, password, and TOTP code to the real server in real time. The code you enter is "fresh," the server accepts it, and the proxy hijacks the session. Classic TOTP can't stop this; WebAuthn-based passkeys (/usage/passkey), which bind to the browser and origin, raise the bar substantially.
- **A compromised device.** If the phone is backdoored, or your authenticator cloud-sync account is taken over, the "something you have" factor no longer belongs to you.

So the honest framing is: MFA drives down the success rate of credential-theft attacks, but it solves neither the session layer nor the endpoint. Expecting one toggle to reduce security risk to zero is itself unrealistic.

## Where you enforce MFA changes everything

Once you've decided to adopt MFA, the next question is **which door verifies it**. Same extra layer, very different outcomes depending on placement:

- **Directly at sshd (PAM).** Every server needs its own config; key distribution, policy consistency, and login triage are all yours to assemble. Maintenance cost grows linearly with machine count.
- **At an access gateway / bastion layer.** All SSH traffic converges on one entry point that verifies MFA, then forwards to backend assets per authorization. The policy lives in one place, and login behavior is auditable by construction.

For teams with many servers, members, and roles, the second option wins decisively. Enforced MFA only has teeth when it's centralized at the entry point — scattered across individual machines, something always slips through: one box never configured, one old sshd that doesn't support the method you need.

That's why bastion hosts exist in the "privileged access management (PAM)" sense: they collapse authentication, authorization, and auditing from N machines down to one point. Open-source Next Terminal, for instance, lets you attach OTP second-factor auth (/usage/otp) and passkeys (/usage/passkey) at login, applying the second factor uniformly to asset access (/usage/access) while mapping logins and operations to the audit records that compliance reviews expect (/usage/compliance). The "centralized verification at the entry point" pattern is the same across comparable products — you can reproduce it with any bastion host.

## Three costs to think through before rolling out

MFA's benefit is clear, but it's bought with cost. A few pits to sort out before go-live:

1. **Lockout and recovery.** TOTP depends on your phone. Lose it, swap it, or drift the clock and you're locked out. You need a recovery path — backup codes, an admin reset, a recovery key — or MFA flips from a control into an incident of its own making.
2. **What about automation?** CI/CD, scripts, and backup jobs log in non-interactively with keys. Forcing interactive MFA on them breaks the pipeline. The usual split is to distinguish "people" from "machines": humans get MFA, machines get source-IP restrictions plus short-lived credentials — not a one-size-fits-all rule.
3. **User friction.** Reaching for your phone every login annoys high-frequency operators, and annoyed operators find workarounds — pasting codes into scripts, or disabling MFA outright. Sensible design is "low-risk actions rarely prompted, high-risk actions re-verified," not friction spread evenly over every step.

Get these three sorted and MFA moves from a compliance checkbox into something people actually use.

## When MFA is genuinely a requirement

To close on something you can act on: if any one of the following is true, MFA belongs near the top of the list.

- Members can log in from the **public internet**, not just the office network.
- Passwords or keys are **shared or circulated**, even "just for a moment."
- The servers hold **production, customer, or payment-related** assets.
- There are **compliance / audit** requirements that demand proof "the login was performed by the person it claims."

Conversely, a few lab machines on a home LAN with fixed, non-internet-reachable sources won't justify MFA's friction.

The real question isn't the binary "MFA or not." It's recognizing where your trust boundary actually collapses: credentials leaking often, add a second factor; sessions leaking, fix the session and endpoint side; no auditing at all, start by making every login traceable. Name the problem correctly and the tool lands where it belongs.
