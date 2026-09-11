---
layout: doc
title: "Authentication Issues — Next Terminal"
description: "Troubleshoot Next Terminal login locks, secondary verification for credentials, TOTP and Passkey issues."
---

# Authentication Issues

## Why is secondary verification required to view a password or private key?

Target credentials are highly sensitive. Even an authenticated administrator must verify again before viewing a saved password, key or passphrase. Bind [TOTP](/docs/usage/otp) or a [Passkey](/docs/usage/passkey), then retry.

## How do I unlock an account or IP after failed sign-ins?

Wait for expiration or remove the entry under **Identity > Login Locks**. If the UI is unavailable:

```shell
docker compose exec next-terminal nt sec list
docker compose exec next-terminal nt sec delete <lock-record-id>
```

See the [CLI Reference](/docs/usage/cli). Verify that the attempts are legitimate before removing a lock.

## The user signed in but sees no assets

Check the user's department and authorization, selected asset or group, expiration, and whether the current entry supports the protocol. See [Resource Authorization](/docs/usage/authorization).

## How do I recover after losing a TOTP device?

After verifying the user's identity, clear TOTP in user administration or run:

```shell
docker compose exec next-terminal nt user otpclr <user-id>
```

Require the user to enroll a new factor promptly.

## Passkey does not work

Verify that the current hostname matches the configured Passkey domain, HTTPS is in use, the credential exists on the current authenticator, and a domain change has not invalidated the registration. See [Passkey](/docs/usage/passkey).

If the user has lost every registered authenticator, verify the user's identity and clear all registered Passkeys from the CLI:

```shell
docker compose exec next-terminal nt user passkeyclr <user-id>
```

This operation deletes all Passkeys for that user. Require the user to register a new Passkey promptly, and review relevant administrative and sign-in logs after recovery. See the [CLI Reference](/docs/usage/cli#clear-all-user-passkeys).
