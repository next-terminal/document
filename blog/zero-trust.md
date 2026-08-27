---
layout: doc
title: "From VPN to Zero Trust: A Unified Access Gateway with Next Terminal"
description: "A practical guide to replacing broad VPN access with a Next Terminal open source bastion host for SSH, RDP, VNC, databases, and web assets — a lightweight JumpServer alternative and Teleport alternative with operations audit."
head:
  - - meta
    - name: keywords
      content: zero trust,VPN alternative,unified access,bastion host zero trust,open source bastion host,JumpServer alternative,Teleport alternative,operations audit,Next Terminal
  - - meta
    - property: og:title
      content: "From VPN to Zero Trust: A Unified Access Gateway with Next Terminal"
  - - meta
    - property: og:description
      content: "Use Next Terminal as an open source bastion host to control access to internal assets without exposing an entire network through VPN."
---

# From VPN to Zero Trust: A Unified Access Gateway with Next Terminal

Teams searching for **zero trust** or a **VPN alternative** are not always trying to replace their entire network overnight. Usually, they want to solve a practical problem: employees, contractors, or on-call engineers need access to internal servers, Windows desktops, databases, and web systems, but they should not receive an entire subnet simply because they logged in. An **open source bastion host** changes “enter the network” into “access an authorized asset,” concentrating identity, permissions, connections, and operations audit at one gateway. This article stays within the current Next Terminal v3.7.2 documentation and describes a gradual migration path. It also provides a verification checklist for teams evaluating a **JumpServer alternative** or **Teleport alternative**.

## The Convenience and Limits of VPN

Traditional VPNs have an obvious strength: users connect to one entry point and can keep using familiar SSH, RDP, or browser tools. But network reachability is not the same as business authorization. A VPN answers “can this user reach the subnet?”; it does not necessarily answer “should this person reach this asset today?” When permissions change, a contractor leaves, a customer environment must remain isolated, or an auditor asks for evidence, a network-only model commonly creates three problems:

1. **The access range is too broad.** Once an account enters a network, it may be able to discover and connect to addresses that were never assigned to that user.
2. **Identity and activity are disconnected.** A VPN login proves that a user entered a network, but it does not always map cleanly to a specific asset and operation.
3. **Cross-network maintenance is complicated.** Multiple data centers, VPCs, and customer sites require repeated routing, port forwarding, or dedicated links.

This does not mean every VPN must be turned off immediately. A safer approach is to retain network-level access where it is genuinely needed, while gradually moving high-value assets to an identity- and asset-centered gateway. In this article, zero trust is not a slogan about “trusting nothing.” It is a verifiable access flow: confirm the identity, check authorization, connect only to the intended asset, and leave a searchable record.

## Define the Access Boundary First

Before changing the network, group assets by protocol, location, and risk. Do not begin by applying one policy to everything. Start with a small inventory:

| Asset category | Common protocol | Users | Main control |
| --- | --- | --- | --- |
| Linux and network devices | SSH | Operations and on-call staff | User/group authorization and command audit |
| Windows servers | RDP | Operations and desktop support | Asset authorization and session recording |
| Databases | Database protocol | DBAs and application teams | Dedicated credentials and SQL audit |
| Internal administration systems | HTTPS/Web | Employees and contractors | Web asset, MFA, and mTLS |
| Customer sites or VPCs | SSH/RDP/VNC | Assigned project members | Security gateway and least reachability |

Next Terminal’s [asset management](/usage/asset) documentation describes how to register connection information for different protocols and then decide access through authorization relationships. The important point is not to import every device at once. Select a representative group: one Linux host, one Windows host, one database or web system, and one target in an isolated network. This validates the complete path without putting every production service into the first experiment.

## Connect Isolated Networks with a Security Gateway

When the bastion service cannot directly reach a customer network or VPC, the traditional choices are to open a port for each asset or to give users VPN access to a larger subnet. Next Terminal’s [security gateway](/usage/agent-gateway) is an Agent deployed in the target network. It actively establishes WebSocket communication with the server; when an authorized user connects, the server forwards the request through that gateway to the internal target.

The implementation can be divided into three steps:

1. Prepare a host in the target network that can reach the server’s web port, then install and register the security gateway.
2. Confirm that the gateway is online in the server, add SSH, RDP, or VNC assets, and select that gateway for the assets.
3. Access the assets with an authorized account, then verify the connection, reconnect behavior, and audit output.

Copy the registration command from the management interface and use the [security gateway configuration](/usage/agent-gateway-config) documentation for the server endpoint, proxy, or automatic-update options. Do not put a gateway token in a public script or commit it to a repository. In production, make sure the server uses HTTPS: encrypted communication between the gateway and server depends on the server-side HTTPS configuration.

A security gateway is not an unrestricted network scanner. It should provide connectivity from the gateway host to registered target addresses and ports, while the asset remains protected by Next Terminal authorization. During a pilot, test the target port from the gateway host and check gateway status in the management interface. This separates three different failures: the gateway is not registered, the gateway cannot reach the target, or the user has no permission for the asset.

## Move from Network Rules to Asset Authorization

The second change in a zero-trust gateway is expressing permission as a checkable relationship instead of relying only on firewall rules. Use a user or group to asset or asset-group authorization model, and separate accounts by responsibility. For example, on-call staff may receive only read-oriented production assets, DBAs may receive database access, and contractors may receive only the assets for their project. When a permission changes, update the authorization relationship rather than redesigning VPN routes for an entire network.

Before access, verify the details that matter: has the user completed authentication, are the target credentials valid, is the asset associated with the correct security gateway, and does this access require additional MFA? Next Terminal provides Passkey and TOTP identity enhancements; see the [Passkey](/usage/passkey) and [2FA (TOTP)](/usage/otp) documentation. For public entry points or high-risk assets, make strong authentication part of the asset access policy rather than treating it as a one-time check at the initial login page.

Use this simplified flow to review an access request:

```text
User login -> additional identity verification -> user/asset authorization
          -> select an available security gateway -> connect to protocol and port
          -> record access event -> create protocol-specific audit evidence
```

Every stage should be observable during the pilot. Do not verify only that “it connects.” Also verify that an unauthorized user cannot connect, that an unavailable gateway produces a diagnosable error, and that revoking authorization prevents the old entry point from continuing to provide access.

## A Unified Control Plane Does Not Mean Browser Only

The goal of zero-trust access is a unified control plane, not forcing every operator into one client. A temporary maintenance task can use the web terminal. Engineers who rely on scripts, jump-host conventions, or local tools can use the local-client paths described in [asset access](/usage/access) and the SSH proxy documentation. Windows operators can separately validate the RDP proxy with their native client. The unified gateway handles authentication, authorization, and audit; the local tool provides a familiar operating experience. These goals are compatible.

Web assets belong inside the same boundary. An internal Grafana dashboard, monitoring panel, or administration console does not need to hand an entire internal network to a user through VPN. Register it as a web asset and combine HTTPS with mTLS where appropriate. Databases should be registered as dedicated assets with dedicated credentials, rather than exposing a database port as a generic TCP path. This gives SSH, RDP, database, and web permissions one management model, while auditors can search users, assets, and times from one system.

## What Operations Audit Must Prove

**Operations audit** is not complete merely because a log page exists. During a pilot, prepare four reproducible actions: a normal login, a successful SSH or RDP operation, a file or database operation where applicable, and an access attempt after authorization has been revoked. Check the following outcomes:

- Is each event associated with a clear user rather than only a shared account or an ambiguous IP?
- Can you search by asset, protocol, start time, and end time?
- Can a graphical session be replayed, and does the replay explain what the operator did?
- Are SSH commands, file operations, or database sessions recorded according to the actual capabilities of the deployed version?
- Do the storage location, retention period, backup method, and recovery procedure match the team’s policy?

For a fuller mapping of controls, consult [compliance and audit](/usage/compliance). Do not claim that a product automatically satisfies every regulatory framework. Classified-protection, ISO 27001, SOC 2, and internal audit programs have different scopes; the responsible team must validate the final result against its own policy. Next Terminal can provide technical control points, but the audit conclusion remains an organizational decision.

## A Controlled Migration Route

A staged route is easier to verify and roll back than a big-bang VPN replacement.

### Stage One: Establish a Baseline

Record current VPN users, subnets, assets, common protocols, and audit gaps. Select low-risk test assets and confirm that backups, rollback, and the existing emergency path remain available.

### Stage Two: Onboard Core Assets

Import a small number of SSH and RDP assets by user group and asset group. Configure credentials and authorization. Keep existing network rules unchanged at first and compare connection success, operator time, and troubleshooting paths in parallel.

### Stage Three: Cover an Isolated Network

Deploy a security gateway in one VPC or customer site. Test both links: server to gateway and gateway to asset. Prepare an alert and manual procedure for a gateway outage rather than assuming the tunnel is permanently available.

### Stage Four: Tighten the Entry Point

After authorization and audit are stable, reduce direct VPN access for ordinary users and retain network-level access only where it is necessary. Add MFA to high-risk assets and give contractor accounts a clear asset scope and end date.

### Stage Five: Review Continuously

Each month, review departed accounts, unused authorizations, failed access attempts, recording storage, and recovery exercises. Zero trust is not a one-time launch: identities, assets, and responsibilities continue to change.

## Conclusion

Moving from VPN to zero trust is not replacing one label with another. It means changing access control from “enter this network” to “this identity may access this authorized asset under these conditions.” As a lightweight **open source bastion host**, Next Terminal can provide one control plane for SSH, RDP, VNC, database, and web assets, while its security gateway connects isolated networks. For SMB teams evaluating a **JumpServer alternative** or **Teleport alternative**, the most important test is whether this chain closes reliably under their own assets, identities, and audit policy.

Start with a controlled set of real assets and use authorization boundaries, gateway stability, operator experience, and audit evidence to decide the next step. Do not promise a one-time replacement of every VPN route before the pilot produces evidence. For evaluation, see [Next Terminal pricing](https://www.next-terminal.com/pricing), try the unified entry point through the [live demo](https://demo.next-terminal.com), and begin a formal deployment with the [container installation](/install/container-install) guide.
