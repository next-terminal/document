---
layout: doc
title: "安全网关配置文件 — Next Terminal"
description: "Next Terminal 堡垒机安全网关配置文件说明 — Agent 参数、隧道与转发选项。"
head:
  - - meta
    - name: keywords
      content: 安全网关配置, Agent网关, 堡垒机, Next Terminal
  - - meta
    - property: og:title
      content: "安全网关配置文件 — Next Terminal"
  - - meta
    - property: og:description
      content: "Next Terminal 堡垒机安全网关配置文件说明 — Agent 参数、隧道与转发选项。"
---

# 安全网关配置文件

安全网关（`nt-tunnel`）默认从以下位置读取 YAML 配置文件：

```text
~/.nt/agent.yaml
```

如果启动时指定了其他配置文件路径，则以指定路径为准。配置文件不存在时，程序会创建包含默认值的配置文件。

> 配置文件可能包含 API Key、代理账号和代理密码。请限制文件读取权限，不要将真实配置提交到 Git 仓库、工单或公开聊天中。

## 完整示例

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

字段可以按需省略。程序会先载入默认配置，再使用 YAML 中提供的值覆盖默认值。

## `server`：服务端连接

### `endpoint`

Next Terminal 服务端地址，例如：

```yaml
server:
  endpoint: https://next.example.com
```

默认值为 `http://localhost:8080`。建议生产环境使用 HTTPS。安全网关会根据该地址建立 WebSocket 连接：HTTP 对应 `ws`，HTTPS 对应 `wss`。

请填写服务端根地址，不要附加 `/api/agent/connect` 等 API 路径。程序在检查版本和下载更新时也会基于该根地址拼接请求路径。

### `api_key`

安全网关连接服务端时使用的 API Key：

```yaml
server:
  api_key: YOUR_AGENT_API_KEY
```

请使用在 Next Terminal 管理界面中为当前安全网关生成的值。不要在截图、日志或公开配置示例中暴露真实 API Key。

### `insecure_skip_verify`

是否跳过 TLS 证书验证：

```yaml
server:
  insecure_skip_verify: false
```

默认值为 `false`。仅在临时测试自签名证书时考虑设为 `true`。生产环境开启后会失去对服务端证书身份的验证，可能受到中间人攻击，因此不建议启用。

### `headers`

为服务端请求增加自定义 HTTP Header：

```yaml
server:
  headers:
    X-Site-ID: branch-office
    X-Proxy-Token: YOUR_PROXY_TOKEN
```

适合经过反向代理、零信任接入层或需要额外站点标识的环境。Header 名称和值均按字符串填写。敏感Header同样应按凭据保护。

### `proxy`

安全网关访问服务端时使用的代理URL，支持：

- `http://`
- `socks5://`
- `socks5h://`（解析后按 `socks5://` 处理）

HTTP代理示例：

```yaml
server:
  proxy: http://proxy-user:proxy-password@127.0.0.1:8080
```

SOCKS5代理示例：

```yaml
server:
  proxy: socks5://proxy-user:proxy-password@127.0.0.1:1080
```

代理地址必须包含主机和有效端口，端口范围为 `1` 到 `65535`。以下写法会校验失败：

```yaml
# 不支持的协议
proxy: https://127.0.0.1:8080

# 缺少端口
proxy: socks5://127.0.0.1
```

认证信息直接写在URL中。如用户名或密码包含 `@`、`:`、`/` 等保留字符，需要进行URL编码。HTTP代理由HTTP/WebSocket客户端处理；SOCKS5连接使用对应的代理拨号器。

## `agent`：网关标识

### `name`

安全网关名称：

```yaml
agent:
  name: branch-office-gateway
```

留空时默认使用主机名。建议名称能够反映所在区域、网络或用途，例如 `beijing-office`、`aws-prod-vpc`，以便在资产配置中准确选择。

## `collector`：状态采集

### `interval`

状态数据采集间隔，单位为秒：

```yaml
collector:
  interval: 5
```

默认值为 `5`。配置为 `0` 或负数时会回退到默认值。

### `heartbeat_interval`

心跳间隔，单位为秒：

```yaml
collector:
  heartbeat_interval: 30
```

默认值为 `30`。配置为 `0` 或负数时会回退到默认值。

### `network_include`

网卡采集白名单，支持Go正则表达式：

```yaml
collector:
  network_include:
    - ^eth0$
    - ^ens.*
```

只要配置了 `network_include`，就只采集匹配白名单的网卡，并忽略 `network_exclude`。正则表达式会匹配网卡名称，建议使用 `^` 和 `$` 明确边界。

### `network_exclude`

网卡采集黑名单，同样支持Go正则表达式：

```yaml
collector:
  network_exclude:
    - ^docker.*
    - ^veth.*
    - ^br-.*
```

仅当 `network_include` 为空时生效。未配置黑名单时会使用默认排除规则，忽略回环和常见虚拟网卡，包括：

- Linux：`lo`、Docker、veth、网桥、libvirt、Flannel、CNI等；
- macOS：`lo0`、AWDL、桥接、隧道、VPN、虚拟机和抓包接口等；
- Windows：Loopback和`vEthernet`等虚拟接口。

如果自定义正则表达式无效，网卡判断会退回到最低限度的回环接口排除逻辑。建议修改后检查日志并确认采集结果。

### `disk_include`

需要采集的挂载点白名单：

```yaml
collector:
  disk_include:
    - /
    - /data
```

只有列表中完全匹配的挂载点会被采集。留空时的默认值为：

- Linux/macOS：`/`
- Windows：`C:`

Windows YAML 示例：

```yaml
collector:
  disk_include:
    - "C:"
    - "D:"
```

## `auto_update`：自动更新

### `enabled`

是否启用自动更新检查：

```yaml
auto_update:
  enabled: true
```

默认启用。

### `check_interval`

检查更新的时间间隔，使用Go duration格式：

```yaml
auto_update:
  check_interval: 10m
```

常见写法：

- `30s`：30秒
- `10m`：10分钟
- `1h`：1小时

默认值为 `10m`。启用自动更新后，如果该值无法解析，会回退到默认值。

## 最小配置

通常只需要填写服务端地址和API Key：

```yaml
server:
  endpoint: https://next.example.com
  api_key: YOUR_AGENT_API_KEY
```

其他字段将使用默认值。

## 修改配置并重启

编辑默认配置文件：

```shell
vi ~/.nt/agent.yaml
```

Linux服务重启与日志检查：

```shell
sudo systemctl restart nt-tunnel
sudo systemctl status nt-tunnel
sudo journalctl -u nt-tunnel -n 100 --no-pager
```

如果现有安装将日志写入文件，也可以检查：

```shell
tail -n 100 /var/log/nt-tunnel.log
```

macOS服务可按安装方式使用`launchctl`重新加载，然后检查：

```shell
sudo launchctl list nt-tunnel
tail -n 100 /var/log/nt-tunnel.{out,err}.log
```

## 常见错误

### 代理配置无效

如果出现 `invalid proxy configuration`，请检查：

1. 协议是否为 `http`、`socks5`或`socks5h`；
2. 地址是否包含主机和端口；
3. 端口是否在`1–65535`范围内；
4. 用户名或密码中的保留字符是否已进行URL编码。

### 无法连接服务端

依次确认：

1. `endpoint`是否使用正确协议和域名；
2. 安全网关所在主机是否能够访问服务端Web端口；
3. 代理是否允许HTTP和WebSocket流量；
4. 反向代理是否允许WebSocket升级；
5. HTTPS证书是否有效且证书链完整；
6. API Key是否对应当前安全网关。

### 没有采集到预期网卡

如果同时设置了`network_include`和`network_exclude`，白名单优先生效。先检查网卡名称是否匹配白名单正则表达式：

```shell
ip link
```

macOS可使用：

```shell
ifconfig -l
```

### 没有采集到预期磁盘

`disk_include`使用挂载点精确匹配，而不是设备名称或正则表达式。先查看实际挂载点，再写入配置：

```shell
df -h
```

## 相关文档

- [安全网关注册与使用](./agent-gateway)
- [安全网关服务管理](./agent-gateway#服务管理)
