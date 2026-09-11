---
layout: doc
title: "SSH Connection Issues — Next Terminal"
description: "Troubleshoot SSH passwords, private keys, PuTTY keys, disconnects, terminal encoding and Backspace behavior in Next Terminal."
---

# SSH Connection Issues

See [SSH Assets](/docs/usage/ssh) for normal configuration. This page focuses on failures.

## `unable to authenticate` or `no supported methods remain`

The SSH service responded, but authentication did not complete. Verify the username, account type or selected credential, current password, private-key format and passphrase, installed `authorized_keys`, and the target server's allowed authentication methods.

## PuTTY key reports `ssh: no key found`

A `.ppk` file may not be directly parseable. Open it in PuTTYgen, export an OpenSSH private key, and use that key in the asset or credential. Do not upload the public key in place of the private key.

## Session disconnects after several seconds or a network device cannot accept input

Some RouterOS and switch implementations do not support the alive check. Edit the SSH asset, open **Terminal Settings**, turn off **Alive Check**, save and reconnect. Disable it only for affected assets because dead sessions can no longer be detected by that mechanism.

## Garbled non-ASCII text on macOS or Unix

Check available locales with `locale -a`, then add a supported value such as `LANG=zh_CN.UTF-8` under **Terminal Settings > Environment**. Reconnect after saving.

## Backspace produces `^H` or `^?`

Switch the asset's Backspace mode between `DEL` and `BS`, then reconnect.

## SSH proxy direct mode cannot find the asset

Use the asset alias, verify its syntax, confirm user authorization, ensure the protocol is SSH, and confirm that the proxy server is enabled. See [SSH Proxy Server](/docs/usage/ssh-server).

## Connection timeout

Test the complete path from Next Terminal through any gateway chain to the target port. Test from the final gateway network rather than only from the user's computer. Increase the connection timeout only for a genuinely slow target.
