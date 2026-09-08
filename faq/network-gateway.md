---
layout: doc
title: "Network and Gateway Issues — Next Terminal"
description: "Troubleshoot offline assets, Security and SSH Gateways, IPv6, gateway chains and Wake-on-LAN in Next Terminal."
---

# Network and Gateway Issues

## Asset appears offline

Status checking primarily tests TCP reachability through the actual connection path; it does not prove authentication. Verify address, port, final-gateway reachability, DNS, service, firewall and the scheduled asset-status task. Test from the relevant network with `nc -vz <host> <port>`.

## Security Gateway is online but the asset fails

Online status proves only the gateway-to-Next-Terminal connection. Verify target DNS and port from the gateway host, selected gateway/group, firewall, multi-interface routing and gateway logs.

## Security Gateway or SSH Gateway?

Use a Security Gateway for VPCs, office networks, multiple sites and reverse connectivity. Use an SSH Gateway when an existing SSH jump host should forward traffic. See [Asset Overview](/usage/asset#choose-a-network-path).

## How do I reach an IPv6 asset?

Connect directly only when the server, container network and path all support IPv6. Otherwise deploy a Security Gateway or SSH Gateway on a dual-stack host. Prefer this scoped bridge over broad Docker-network changes.

## WOL cannot wake a LAN device

Verify target firmware/NIC settings, MAC and broadcast address, and that the sender is in a network where the broadcast reaches the target. Prefer a Security Gateway in the target broadcast domain. Docker `network_mode: host` changes port exposure and network isolation and can cause host conflicts; use it only on Linux when its impact is understood.

## Which address should a gateway-chain asset use?

Enter the address reachable from the final gateway. Test from that network, since the user computer, server and final gateway may see different addresses.
