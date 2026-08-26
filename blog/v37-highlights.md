---
layout: doc
title: "Next Terminal v3.7 Highlights: Agent Proxy, RDP Cursor, and MFA"
description: "A practical upgrade guide to Next Terminal v3.7.2: Agent security-gateway proxying, RDP mouse-pointer recording fixes, multi-factor authentication, and one-time tickets for teams evaluating a JumpServer or Teleport alternative."
head:
  - - meta
    - name: keywords
      content: Next Terminal v3.7, Next Terminal v3.7.2, open source bastion host, bastion host upgrade, Agent proxy, RDP mouse pointer, MFA, JumpServer alternative, Teleport alternative
  - - meta
    - property: og:title
      content: "Next Terminal v3.7 Highlights: Agent Proxy, RDP Cursor, and MFA"
  - - meta
    - property: og:description
      content: "Evaluate v3.7.2 through four operational paths: identity, network access, RDP recording, and day-to-day operations."
---

# Next Terminal v3.7 Highlights: Agent Proxy, RDP Cursor, and MFA

When you maintain an **open source bastion host**, deciding whether to upgrade should not be a matter of counting buttons. The useful questions are whether the release closes breaks in identity, network access, and session audit; whether the change can be tested safely; and whether the improvement is measurable in your workflow. Next Terminal’s current public release is **v3.7.2**. Its release notes group the changes since v3.5.2 around Agent proxy connectivity, multi-factor authentication and one-time tickets for SSH/RDP, RDP recording fixes including mouse-pointer capture, and fixes for authorization, the web terminal, and file uploads.

Rather than turning release notes into a feature list, this article evaluates v3.7.2 along one access path: a user authenticates, reaches an asset in an isolated network through a security gateway, and leaves a replayable record. For teams evaluating a **JumpServer alternative** or **Teleport alternative**, whether these four stages form a closed loop is more useful than a raw feature-count comparison.

## Short answer: who should test the upgrade first

v3.7.2 is primarily a cumulative update that completes the access path, not a release that requires every deployment to change architecture immediately. Three groups are most likely to benefit directly:

1. **Teams with assets across offices, VPCs, or customer sites**: a security-gateway Agent can run in the target network and connect to the server over WebSocket, reducing the need to map public ports for every asset.
2. **Teams that rely on RDP recordings for troubleshooting or operations audit**: fixes for compressed-bitmap crashes, traditional-bitmap white screens, and pointer capture affect whether replay material faithfully shows what happened.
3. **Teams that want separate controls for “sign in to the bastion” and “access a sensitive asset”**: asset-access MFA and one-time SSH/RDP tickets reduce reliance on long-lived credentials and an unrestricted post-login session.

If you manage only a few SSH hosts in one private network, have no RDP audit requirement, and your current release is stable, do not upgrade merely because the version number is newer. Back up the database and `data` directory, reproduce the main connection paths in a test environment, and schedule a maintenance window. The value of an upgrade comes from resolving a concrete risk, not from chasing a label.

## v3.7.2 is one access chain, not three isolated features

The relationship becomes clearer when the release is mapped to the access flow:

| Access stage | Related v3.7.2 capability | Problem addressed | Verification |
| --- | --- | --- | --- |
| Identity and authorization | Asset-access MFA, one-time tickets, authorization retry fix | Reused sessions, long-lived tickets, inconsistent authorization | Test authorized and unauthorized assets with a normal user |
| Network access | Security-gateway Agent, proxy connection methods | Unreachable segments and excessive edge ports | Reach SSH/RDP assets from an isolated segment |
| Session interaction | Terminal settings, lrzsz, SFTP follow, upload progress | Disconnected terminal and file workflows | Run normal terminal and transfer tasks |
| Audit replay | RDP bitmap and pointer-capture fixes | White screens, crashes, and unclear clicks | Record and replay a complete RDP session |

This is a safer way to evaluate a bastion upgrade: ask whether identity, network, interaction, and audit form a closed loop rather than asking how many features were added.

## Agent proxying: fewer inbound ports for a bastion

Next Terminal’s security gateway is an Agent. It runs in the target network and communicates with the server over WebSocket. When adding SSH, RDP, or VNC assets, you select the corresponding gateway; later traffic is forwarded through that gateway. See the [Security Gateway documentation](/usage/agent-gateway) for registration and service management. Proxy, custom-header, network-include, and update parameters are described in the [Security Gateway Configuration File](/usage/agent-gateway-config).

The value is not the word “Agent” by itself; it is the change in network responsibility. A traditional design may require the central bastion to route directly to every site or require several inbound edge ports. A security gateway needs outbound access from the target network to the Next Terminal Web address. That is often easier to fit into firewall rules for NATed branches, separate VPCs, and customer sites.

A minimal topology looks like this:

```text
Operator -> Next Terminal Web/proxy entry
                    |
                    | WebSocket
                    v
             Security-gateway Agent
                    |
                SSH / RDP / VNC
                    v
                Private asset
```

“Do not open a public port for every asset” does not mean that the network is automatically secure. Use HTTPS in production, protect the gateway registration token, restrict the Agent host’s reachable networks and ports, and monitor service status and logs. When a gateway is offline, its associated asset paths are affected. For multi-site deployments, plan fault domains rather than making one Agent responsible for every network.

## MFA and one-time tickets: separate sign-in from asset access

Many bastion hosts authenticate only at the login page. If a browser session is shared, left behind, or hijacked, an attacker may be able to use that existing session to reach assets. The v3.7.2 cumulative notes include multi-factor authentication and one-time tickets for SSH/RDP, as well as an asset-authorization retry fix. The system property list also includes `access-require-mfa` and `access-mfa-expires-at`, which require MFA before asset access and control how long the verification remains valid.

Next Terminal supports TOTP. Users can bind Google Authenticator, Microsoft Authenticator, Authy, or 1Password in their personal center; the [OTP documentation](/usage/otp) describes the process. The goal is not to force a code entry on every click, but to set re-authentication boundaries according to risk: administrators, privileged assets, and external access can be stricter, while lower-risk read-only assets can use a reasonable validity period.

The one-time ticket in an RDP proxy solves a different problem. When a native RDP client connects, the `.rdp` file does not contain the target Windows password. It uses a short-lived identity such as:

```text
username:s:NTICKET:<ticketId>:<secret>
```

The ticket is valid for 300 seconds by default, becomes invalid after successful parsing, and is bound to the user and target asset. Next Terminal checks authorization on the server, then uses the credential stored with the asset to connect to the real host. The [RDP Proxy Server documentation](/usage/rdp-server) covers port mapping, the external address, and the client flow. This does not replace password rotation, least privilege, or endpoint security, but it avoids distributing the real Windows credential across personal machines and chat history.

## RDP cursor capture: making recordings more useful as evidence

An RDP recording that plays is not necessarily sufficient to explain an operation. Without a mouse pointer, a reviewer may see a window change but not which control was clicked. If a compressed bitmap causes a crash, or a traditional-bitmap path renders white, a critical interval may not be reconstructable. The v3.7.2 cumulative notes explicitly mention compressed-bitmap codec crashes, mouse-pointer capture, a GDI fallback note, and traditional-bitmap white-screen fixes.

After upgrading, acceptance testing should go beyond “RDP connects.” Record a session containing these actions:

1. Move the pointer and click several controls.
2. Drag a window, scroll, and change display conditions.
3. Open an image or graphical administration tool to create substantial visual changes.
4. Disconnect normally and replay the recording from start to finish.
5. Check pointer position, visual continuity, and consistent start/end times.

The current documentation states that RDP proxy sessions record session state and can participate in recording and audit policies, but do not currently support live monitoring or manually disconnecting the session from the Web interface. Design the workflow around that boundary; do not turn a recording fix into a claim about real-time intervention.

## Day-to-day improvements: value depends on your workflow

The v3.7.2 summary also includes completed terminal settings, lrzsz over the web terminal, automatic SFTP follow, asset-tree parameters, refactored upload tasks and progress, and a custom-header fix for Web sites. Individually, these are small changes, but they affect repetitive work performed many times a day.

Convenience still needs policy. Clearer upload progress does not mean every asset should permit uploads; more transfer options in a web terminal do not mean file operations can bypass audit. Start with [Asset Management](/usage/asset) to define protocol, credentials, and gateway, then grant the smallest useful scope to users or groups. Capability and authorization must be tested together.

## A practical upgrade and acceptance checklist

Before upgrading, do not check only whether the container image can be pulled:

- **Back up**: back up PostgreSQL and the persistent `data` directory, and confirm the backup is readable.
- **Record the baseline**: note the current version, reverse proxy, port mappings, object storage, and gateway configuration.
- **Test first**: rehearse with the same database version and key settings used in production.
- **Verify installation**: use the current image and Compose structure in the [Container Installation guide](/install/container-install), not commands from an unknown source.
- **Regress by protocol**: test Web SSH, SSH proxy, Web RDP, RDP proxy, VNC, and the Web or database assets you actually use.
- **Verify the security chain**: an ordinary user cannot reach an unauthorized asset; MFA triggers at the intended boundary; an old ticket cannot be reused.
- **Verify the gateway chain**: disconnect and restore the Agent, then check asset availability and logs.
- **Verify audit**: inspect session records, RDP pointer capture, visual continuity, and recording retention.
- **Prepare rollback**: retain the old image identifier, configuration, and backup. Until recovery is rehearsed, a backup is not the same as rollback capability.

## What this means when evaluating a JumpServer or Teleport alternative

v3.7.2 shows a clear product direction: cover traditional SSH/RDP/VNC assets with a relatively lightweight deployment, use a security-gateway Agent for isolated networks, and keep browser access, native proxies, MFA, and session recording in one management chain. That is relevant to teams with traditional servers and desktops, private-deployment requirements, and limited appetite for a heavier platform.

Selection should still return to actual requirements. If your organization depends on Kubernetes-native identity, complex cloud resources, or larger-scale governance, validate those items explicitly rather than migrating because of an “alternative” keyword. If the main need is a unified SSH/RDP entry point, cross-network connectivity, and replayable audit for a small or medium environment, v3.7.2 provides a concrete basis for testing.

## Conclusion: upgrade when you can verify the loop

The most important change in v3.7.2 is not a single prominent screen. It is a more complete access chain: Agent proxying extends connectivity into isolated networks; MFA and one-time tickets strengthen the asset boundary; RDP pointer and bitmap fixes make recordings more interpretable; and terminal and file-operation improvements reduce daily friction.

If these are real production pain points, put the release through a test and change process. If they are not, stay on the stable release until backups and regression checks are ready. Either way, decide from real protocol tests and replay results, not from release notes alone.

To check whether the workflow fits your team, visit the [Next Terminal online demo](https://demo.next-terminal.com). To review the available editions, see [Next Terminal pricing](https://www.next-terminal.com/pricing).
