---
layout: doc
title: "系统资源配置指南 — Next Terminal 开源堡垒机"
description: "Next Terminal 开源堡垒机的系统资源配置与部署要求 — CPU/内存/磁盘与 PostgreSQL 选型，适合中小团队私有化堡垒机部署。"
head:
  - - meta
    - name: keywords
      content: 堡垒机部署, 系统资源, 配置要求, 开源堡垒机, Next Terminal, 跳板机
  - - meta
    - property: og:title
      content: "系统资源配置指南 — Next Terminal 开源堡垒机"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机的系统资源配置与部署要求 — CPU/内存/磁盘与 PostgreSQL 选型，适合中小团队私有化堡垒机部署。"
---

# 系统资源配置指南

## 性能配置参考

| 并发连接数 | CPU(核) | 内存(GB) |
|------------|---------|----------|
| 0-25       | 2       | 2        |
| 26-50      | 3       | 6        |
| 51-100     | 4       | 8        |
| 101-200    | 8       | 16       |
| 201-400    | 16      | 32       |

## 基础要求

### 最低配置
- **CPU**: 1 核
- **内存**: 0.5 GB
- **存储**: 40 GB

### 网络端口
- **必需端口**: 8088 (Web管理)
- **可选端口**:
    - 443 (Web资产HTTPS反向代理)
    - 80 (Web资产HTTP反向代理)
    - 2022 (SSH服务)