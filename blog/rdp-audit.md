---
layout: doc
title: "RDP Session Audit and Replay for Compliance"
description: "How small and mid-size teams use Next Terminal open source bastion host for RDP session audit and replay to meet operations audit and compliance. Lightweight JumpServer/Teleport alternative with recordable, reviewable RDP."
head:
  - - meta
    - name: keywords
      content: RDP audit, session replay, session recording, operations audit, bastion host, open source bastion, Next Terminal, JumpServer alternative, Teleport alternative, compliance
  - - meta
    - property: og:title
      content: "RDP Session Audit and Replay for Compliance — Next Terminal"
  - - meta
    - property: og:description
      content: "Recordable, reviewable RDP with Next Terminal: proxy and web access, per-user authorization, S3 archiving, and an evidence chain for audits."
---

# RDP Session Audit and Replay for Compliance

For many small and mid-size teams, the hardest part of **bastion host** adoption is not connecting to Windows — it is proving what happened inside an RDP session. Shared `Administrator` accounts, direct port mappings, and no recording make it impossible to answer "who did what, when" during an incident or audit. This post shows how to close that loop with **RDP session audit and replay** in Next Terminal, a lightweight **open source bastion host**, and where it fits as a **JumpServer alternative / Teleport alternative**.

## Why Small Teams Need RDP Audit More Than Anyone

Compliance questionnaires (internal audit, customer security review, or formal frameworks) converge on three questions: who can access which machine, is every action attributable to a person, and is evidence retained. RDP is especially sensitive — graphical operations are hard to reconstruct from command logs, and clipboard plus drive redirection can exfiltrate data.

Common gaps:

- **Shared accounts**: several operators use the same local account; accountability is lost.
- **Direct exposure**: RDP ports mapped to the public internet or a flat VPN, with no per-user, per-asset authorization.
- **No recording**: only login events exist — no session recording or replay for investigators.

Next Terminal centralizes identity, authorization, and audit recording behind one gateway without changing how operators work. For deployment, see [Container Installation](/install/container-install); for the authorization model, see [Assets](/usage/asset).

## What Auditors Actually Check: 5 Control Families

The full mapping lives in [Compliance](/usage/compliance). The short version:

| Control | Auditor asks | Next Terminal answer |
| --- | --- | --- |
| Access control | Who can access which Windows asset, from where, when | Per-user/group asset authorization plus login policies |
| Authentication | How is identity verified before access | Passkey/TOTP/LDAP/OIDC, with mTLS at the reverse proxy |
| Traceability | Is every RDP action attributable | Sessions bound to user and asset, with operation logs |
| Evidence retention | Are recordings retained, tamper-resistant, retrievable | Online sessions + offline replay, S3 archiving for long retention |
| Least privilege | Are risky actions controlled | Per-asset isolation and policy-driven approval flows |

> Pragmatic starting point: make sessions attributable, replayable, and retained for at least 180 days. Then layer MFA and mTLS. Auditors care more about a demonstrable closed loop than about blocking everything on day one.

## How Next Terminal Records RDP

Two access paths share the same audit trail — pick the one that fits your workflow:

- **Web RDP**: open the desktop in the browser. No client, no extra port, ideal for ad-hoc access and locked-down endpoints.
- **RDP Proxy Server (native client)**: enable [RDP Proxy Server](/usage/rdp-server), then download a short-lived `.rdp` file for an authorized RDP asset and connect with Windows Remote Desktop or Microsoft Remote Desktop. The file carries a one-time `NTICKET` ticket (default 300 s, single use). The proxy validates the ticket, resolves the real asset, and connects with the stored credential — the operator never sees the Windows password.

Both paths create a session record that participates in audit and recording. Features such as clipboard, drive redirection (`drivestoredirect:s:*`), and RemoteApp are carried in the generated `.rdp` file when applicable.

For assets inside private networks or across clouds, place them behind a [Security Gateway](/usage/agent-gateway) so a single entry point can reach every VPC without per-site port mappings. Gateway config reference: [Security Gateway Configuration](/usage/agent-gateway-config).

## Hands-On: 3 Steps to Recordable RDP

### Step 1: Assets and authorization

1. Create an asset with protocol `RDP` and fill in address, port, and credential.
2. Authorize it to specific users or groups — avoid shared accounts.
3. If the asset is internal, attach it to the relevant security gateway.

> Authorization comes first — without a user-to-asset binding, replay cannot be attributed. See [Assets](/usage/asset).

### Step 2: Enable RDP Proxy if you need native clients

Browser-only access needs no extra port. For native clients, map the proxy port and enable the service:

```yaml
services:
  next-terminal:
    ports:
      - "8088:8088"
      - "3390:3390"  # RDP proxy, default 3390
```

In System Settings > RDP Proxy Server, enable the service, set the listen address (default `0.0.0.0:3390`), the public address clients actually reach (e.g. `rdp.example.com:3390`), and ticket TTL (60–3600 s, default 300 s). Then recreate the container:

```bash
docker compose up -d --force-recreate next-terminal
```

Certificates are auto-generated at `data/rdp-proxy/server.crt` and `server.key`; a self-signed warning on first connect is expected.

### Step 3: Verify audit and replay

1. Log in as an authorized user, download the `.rdp` file for an RDP asset, and connect.
2. Check the session list for the online session; after disconnect, confirm offline recording is available.
3. Pick one recording and replay it end-to-end.

If download or connect fails, work through the checklist in [RDP Proxy Server](/usage/rdp-server) — authorization, ticket expiry, port mapping, and public address are the usual culprits.

## Where Recordings Live: Local Disk vs S3

Local `data` storage is fine for single-node or evaluation. For production, archive to S3 with versioning and object lock for long-term retention and tamper resistance. In HA, multiple instances share recordings via shared storage or S3; see [Primary/Standby HA Deployment](/install/ha-primary-standby-guide) and the [Production HA Checklist](/install/ha-production-checklist) for the migration path off local `data` sharing.

Recommended retention:

- **Duration**: at least 180 days, or per customer/industry policy.
- **Tiering**: hot recordings locally, cold archive in S3; rehearse restore regularly.
- **Integrity**: transcode and verify offline recordings; cross-check access logs against replay.

## What to Show an Auditor: Evidence Chain

Prepare these artifacts — each can be exported or demonstrated directly in Next Terminal:

1. **User-to-asset matrix**: who is authorized for which RDP asset and when.
2. **Session sample**: start/end time, source IP, user, and asset for one RDP session.
3. **Replay**: one complete replay proving the session is reconstructable.
4. **Access and file operation logs**: corroborating evidence alongside the recording.
5. **Identity and gateway config**: MFA/mTLS/IdP settings and gateway topology.
6. **Backup and HA drill records**: proof that retention and availability are exercised.

This set satisfies most operations-audit interviews without introducing a heavyweight platform. Details: [Compliance](/usage/compliance).

## Pitfalls

- **Leaving public address empty** behind NAT/reverse proxy/container mapping — auto-derived addresses may be unreachable. Always set an explicit reachable address.
- **Reusing tickets**: `.rdp` tickets are single use; re-download after expiry or after a successful connect.
- **Unmapped port or blocked security group**: if `3390` is not mapped or not allowed, native clients cannot connect — verify with `telnet rdp.example.com 3390`.
- **Still sharing accounts**: after moving authorization to named users in the bastion, align Windows-side accounts so audits trace to a person.

## Closing

For small teams, **RDP session audit and replay** is about provability, not feature count. Next Terminal delivers it with light deployment, a unified entry point, and replayable sessions — a practical **JumpServer alternative / Teleport alternative** for teams of 5–50 managing up to a few hundred assets.

Try the live demo at [https://demo.next-terminal.com](https://demo.next-terminal.com) and compare plans at [https://www.next-terminal.com/pricing](https://www.next-terminal.com/pricing). Issues and questions: [GitHub](https://github.com/next-terminal/next-terminal).
