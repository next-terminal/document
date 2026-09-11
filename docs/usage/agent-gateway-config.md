---
layout: doc
title: "Security Gateway Config — Next Terminal"
description: "Security Gateway configuration file reference for Next Terminal bastion host — agent settings, tunnel and forwarding options."
head:
  - - meta
    - name: keywords
      content: security gateway config, agent gateway, bastion host, Next Terminal
  - - meta
    - property: og:title
      content: "Security Gateway Config — Next Terminal"
  - - meta
    - property: og:description
      content: "Security Gateway configuration file reference for Next Terminal bastion host — agent settings, tunnel and forwarding options."
---

# Security Gateway Configuration File

Security Gateway (`nt-tunnel`) reads its YAML configuration from this default path:

```text
~/.nt/agent.yaml
```

If a different path is specified at startup, that file is used instead. When the file does not exist, the agent creates a configuration file with default values.

> The file can contain an API key, proxy username, and proxy password. Restrict file access and never commit a real configuration to Git or paste it into public tickets or chats.

## Complete example

```yaml
server:
  endpoint: https://next.example.com
  api_key: YOUR_AGENT_API_KEY
  insecure_skip_verify: false
  headers:
    X-Site-ID: branch-office
    X-Proxy-Token: YOUR_PROXY_TOKEN
  proxy: socks5://proxy-user:proxy-password@127.0.0.1:1080

agent:
  name: branch-office-gateway

collector:
  interval: 5
  heartbeat_interval: 30
  network_include:
    - ^eth0$
    - ^ens.*
  network_exclude: []
  disk_include:
    - /
    - /data

auto_update:
  enabled: true
  check_interval: 10m
```

Fields may be omitted when they are not needed. The agent loads its defaults first and then applies values supplied in YAML.

## `server`: server connection

### `endpoint`

The Next Terminal server address:

```yaml
server:
  endpoint: https://next.example.com
```

The default is `http://localhost:8080`. Use HTTPS in production. The gateway derives its WebSocket connection from this address: HTTP uses `ws`, and HTTPS uses `wss`.

Enter the server root address without API paths such as `/api/agent/connect`. Version checks and update downloads also derive their request URLs from this root.

### `api_key`

The API key used to connect the gateway to the server:

```yaml
server:
  api_key: YOUR_AGENT_API_KEY
```

Use the value generated for this gateway in the Next Terminal administration interface. Never expose the real value in screenshots, logs, or public examples.

### `insecure_skip_verify`

Controls TLS certificate verification:

```yaml
server:
  insecure_skip_verify: false
```

The default is `false`. Set it to `true` only for temporary testing with a self-signed certificate. Enabling it in production removes server identity verification and can expose the connection to man-in-the-middle attacks.

### `headers`

Adds custom HTTP headers to server requests:

```yaml
server:
  headers:
    X-Site-ID: branch-office
    X-Proxy-Token: YOUR_PROXY_TOKEN
```

This is useful behind reverse proxies, zero-trust access layers, or infrastructure that requires a site identifier. Header names and values are strings. Treat sensitive header values as credentials.

### `proxy`

Configures the proxy used when the gateway connects to the server. Supported schemes are:

- `http://`
- `socks5://`
- `socks5h://` (normalized to `socks5://`)

HTTP proxy example:

```yaml
server:
  proxy: http://proxy-user:proxy-password@127.0.0.1:8080
```

SOCKS5 proxy example:

```yaml
server:
  proxy: socks5://proxy-user:proxy-password@127.0.0.1:1080
```

The proxy URL must contain a host and a valid port from `1` through `65535`. These examples fail validation:

```yaml
# Unsupported scheme
proxy: https://127.0.0.1:8080

# Missing port
proxy: socks5://127.0.0.1
```

Credentials are embedded directly in the URL. Percent-encode reserved characters such as `@`, `:`, and `/` when they occur in usernames or passwords. HTTP proxies are handled by the HTTP/WebSocket clients. SOCKS5 connections use the SOCKS5 proxy dialer.

## `agent`: gateway identity

### `name`

The gateway name:

```yaml
agent:
  name: branch-office-gateway
```

When empty, the hostname is used. Choose a name that identifies the location, network, or purpose, such as `beijing-office` or `aws-prod-vpc`, so administrators can select the correct gateway when configuring assets.

## `collector`: status collection

### `interval`

Status collection interval in seconds:

```yaml
collector:
  interval: 5
```

The default is `5`. A zero or negative value falls back to the default.

### `heartbeat_interval`

Heartbeat interval in seconds:

```yaml
collector:
  heartbeat_interval: 30
```

The default is `30`. A zero or negative value falls back to the default.

### `network_include`

An allowlist of network-interface names using Go regular expressions:

```yaml
collector:
  network_include:
    - ^eth0$
    - ^ens.*
```

When `network_include` contains any patterns, only matching interfaces are collected and `network_exclude` is ignored. Use `^` and `$` where you need exact boundaries.

### `network_exclude`

A denylist of network-interface names, also using Go regular expressions:

```yaml
collector:
  network_exclude:
    - ^docker.*
    - ^veth.*
    - ^br-.*
```

This setting applies only when `network_include` is empty. If no denylist is configured, the gateway uses built-in rules that exclude loopback and common virtual interfaces, including:

- Linux: loopback, Docker, veth, bridges, libvirt, Flannel, and CNI interfaces;
- macOS: loopback, AWDL, bridge, tunnel, VPN, virtual-machine, and packet-capture interfaces;
- Windows: Loopback and `vEthernet` virtual interfaces.

If a custom regular expression cannot be compiled, interface filtering falls back to a minimal loopback exclusion. Check logs and collection results after changing patterns.

### `disk_include`

An allowlist of mount points to collect:

```yaml
collector:
  disk_include:
    - /
    - /data
```

Only exact mount-point matches are collected. When the list is empty, the default is:

- Linux/macOS: `/`
- Windows: `C:`

Windows example:

```yaml
collector:
  disk_include:
    - "C:"
    - "D:"
```

## `auto_update`: automatic updates

### `enabled`

Enables automatic update checks:

```yaml
auto_update:
  enabled: true
```

It is enabled by default.

### `check_interval`

The update-check interval in Go duration syntax:

```yaml
auto_update:
  check_interval: 10m
```

Common values:

- `30s`: 30 seconds
- `10m`: 10 minutes
- `1h`: 1 hour

The default is `10m`. When automatic updates are enabled, an invalid duration falls back to the default.

## Minimal configuration

Most installations only need the server address and API key:

```yaml
server:
  endpoint: https://next.example.com
  api_key: YOUR_AGENT_API_KEY
```

All other settings use defaults.

## Apply changes and restart

Edit the default configuration:

```shell
vi ~/.nt/agent.yaml
```

Restart and inspect the Linux service:

```shell
sudo systemctl restart nt-tunnel
sudo systemctl status nt-tunnel
sudo journalctl -u nt-tunnel -n 100 --no-pager
```

If your installation writes logs to a file, inspect it with:

```shell
tail -n 100 /var/log/nt-tunnel.log
```

On macOS, reload the service according to your installation method and then inspect it:

```shell
sudo launchctl list nt-tunnel
tail -n 100 /var/log/nt-tunnel.{out,err}.log
```

## Troubleshooting

### Invalid proxy configuration

For an `invalid proxy configuration` error, check that:

1. the scheme is `http`, `socks5`, or `socks5h`;
2. the URL contains both a host and port;
3. the port is between `1` and `65535`;
4. reserved characters in the username or password are percent-encoded.

### Cannot connect to the server

Check these items in order:

1. `endpoint` uses the correct scheme and hostname;
2. the gateway host can reach the server Web port;
3. the proxy permits HTTP and WebSocket traffic;
4. the reverse proxy allows WebSocket upgrades;
5. the HTTPS certificate is valid and its chain is complete;
6. the API key belongs to this gateway.

### Expected interface is missing

If both `network_include` and `network_exclude` are set, the allowlist wins. First verify the interface name against the allowlist expressions:

```shell
ip link
```

On macOS:

```shell
ifconfig -l
```

### Expected disk is missing

`disk_include` uses exact mount-point matching, not device names or regular expressions. Inspect the actual mount point before adding it:

```shell
df -h
```

## Related documentation

- [Register and use Security Gateway](./agent-gateway)
- [Security Gateway service management](./agent-gateway#service-management)
