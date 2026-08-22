---
layout: doc
title: "从 1.x 升级到 2.x — Next Terminal FAQ"
description: "Next Terminal 开源堡垒机从 1.x 升级到 2.x 的指南 — 变更与迁移步骤。"
head:
  - - meta
    - name: keywords
      content: 升级, 迁移, 堡垒机升级, Next Terminal v2, 开源堡垒机
  - - meta
    - property: og:title
      content: "从 1.x 升级到 2.x — Next Terminal FAQ"
  - - meta
    - property: og:description
      content: "Next Terminal 开源堡垒机从 1.x 升级到 2.x 的指南 — 变更与迁移步骤。"
---

# 从 1.x 升级到 2.x 版本指南

## ⚠️ 重要提示
2.x 版本与 1.x 版本**不兼容**，升级前请务必注意！

## 升级步骤
1. 在 1.x 版本中使用**备份功能**导出数据
2. 安装 2.x 版本后，导入之前备份的数据

## 常见问题
### 导出时出现权限错误
如果在 1.x 导出时遇到错误：  

`{"code":403,"message":"permission denied"}`

解决方案：  

使用独立的[备份导出工具](https://github.com/dushixiang/next-terminal-export)
