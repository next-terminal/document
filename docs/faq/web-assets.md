---
layout: doc
title: "Web Asset Issues — Next Terminal"
description: "Troubleshoot Web asset domains, origins, login redirects, WebSockets, Grafana Origin checks and HTTPS certificates in Next Terminal."
---

# Web Asset Issues

See [Web Assets](/docs/usage/website) for normal publishing and field descriptions.

## The Web asset domain is unreachable

Check browser-to-DNS-to-Next-Terminal reachability, then any Security Gateway and the origin. The asset domain must resolve to Next Terminal, must not collide with `SelfDomain` or another asset, and the origin must be reachable from the actual proxy path.

## Sign-in redirects loop

Verify the public management address, `Root`, `SelfDomain`, proxy protocol/Host forwarding, cookies and that the Web asset does not reuse the management domain.

## Grafana reports `origin not allowed` or WebSocket fails

Use the current **Origin Host** setting: follow the service hostname when Grafana should see the public asset domain, or follow/specify the origin hostname when Grafana requires its internal name. Ensure every proxy layer supports WebSocket Upgrade and verify Grafana `root_url`, `domain` and Origin settings. The old “Custom Header > Retain hostname” wording maps to the current Origin Host behavior.

## Static resources or APIs still use an internal address

Prefer fixing the application's public/Base URL. Use response modification only when the origin cannot be changed, and retest after application upgrades.

## HTTPS certificate mismatch

Verify certificate hostname coverage, wildcard depth, issuance and expiration, asset binding, and the certificate actually returned by any external TLS proxy.

## The signed-in user is still unauthorized

Web assets use separate Web-asset authorization. Server asset authorization does not grant website access.

## Gateway is online but the Web asset returns 502/504

Online status proves only the gateway-to-Next-Terminal control connection. Test origin address, DNS, port, TLS and timeout from the gateway network.
