---
layout: marketing
marketingLocale: zh
marketingPage: home
title: 'Next Terminal 开源堡垒机｜轻量跳板机与运维审计 | JumpServer/Teleport 替代'
titleTemplate: false
description: 'Next Terminal 是面向中小团队的开源堡垒机与跳板机，支持 SSH/RDP/VNC/SFTP/Telnet/HTTP 统一接入、资产授权、会话审计与录像、命令拦截、Passkey/TOTP/LDAP/OIDC 多因素认证，私有化部署，JumpServer 与 Teleport 的轻量替代。'
head:
  - - script
    - type: application/ld+json
    - '{"@context":"https://schema.org","@graph":[{"@type":"WebSite","name":"Next Terminal","url":"https://www.next-terminal.com/zh/","inLanguage":"zh-CN","description":"Next Terminal 是面向中小团队的开源堡垒机与跳板机，支持 SSH/RDP/VNC/SFTP/Telnet/HTTP 统一接入、资产授权、会话审计与录像、命令拦截、Passkey/TOTP/LDAP/OIDC 多因素认证，私有化部署，JumpServer 与 Teleport 的轻量替代。"},{"@type":"SoftwareApplication","name":"Next Terminal","applicationCategory":"SecurityApplication","applicationSubCategory":"Bastion Host","operatingSystem":"Linux","url":"https://www.next-terminal.com/zh/","image":"https://www.next-terminal.com/images/website-light.png","description":"支持多协议远程访问、资产授权、会话审计和安全认证的开源堡垒机与跳板机，JumpServer/Teleport 的轻量替代。","featureList":["多协议统一访问","资产与凭证管理","权限与访问策略","会话审计与回放","危险命令拦截","企业身份与强认证"],"publisher":{"@type":"Organization","name":"Next Terminal","url":"https://www.next-terminal.com/zh/"},"keywords":"开源堡垒机,堡垒机,跳板机,JumpServer替代,Teleport替代,运维审计,Next Terminal,PAM"}]}'
---

<script setup>
import Page from "../.vitepress/theme/marketing/components/HomePage.vue"
import {homeContent} from "../.vitepress/theme/marketing/config/home.js"
</script>

<Page :content="homeContent.zh" locale="zh" />
