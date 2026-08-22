---
layout: doc
title: "System Requirements — Resource Sizing for Next Terminal"
description: "Resource sizing and system requirements for Next Terminal open source bastion host deployment — CPU, memory, disk and PostgreSQL planning for self-hosted jump server."
head:
  - - meta
    - name: keywords
      content: bastion host deployment, system requirements, resource sizing, open source bastion, Next Terminal, jump server
  - - meta
    - property: og:title
      content: "System Requirements — Resource Sizing for Next Terminal"
  - - meta
    - property: og:description
      content: "Resource sizing and system requirements for Next Terminal open source bastion host deployment — CPU, memory, disk and PostgreSQL planning for self-hosted jump server."
---

# System Resource Sizing Guide

## Performance Reference

| Concurrent Connections | CPU Cores | Memory (GB) |
|------------------------|-----------|-------------|
| 0-25                   | 2         | 2           |
| 26-50                  | 3         | 6           |
| 51-100                 | 4         | 8           |
| 101-200                | 8         | 16          |
| 201-400                | 16        | 32          |

## Baseline Requirements

### Minimum
- **CPU**: 1 core
- **Memory**: 0.5 GB
- **Storage**: 40 GB

### Network Ports
- **Required**: 8088 (Web admin)
- **Optional**:
  - 443 (HTTPS reverse proxy for Web Assets)
  - 80 (HTTP reverse proxy for Web Assets)
  - 2022 (SSH server)
