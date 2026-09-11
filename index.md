---
layout: marketing
marketingLocale: en
marketingPage: home
title: 'Next Terminal Open Source Bastion Host | Lightweight Jump Server & PAM | JumpServer/Teleport Alternative'
titleTemplate: false
description: 'Next Terminal is an open source bastion host and jump server for teams. Unified SSH/RDP/VNC/SFTP/Telnet/HTTP access, asset authorization, session audit and recording, command interception, and Passkey/TOTP/LDAP/OIDC MFA. Self-hosted JumpServer and Teleport alternative.'
head:
  - - script
    - type: application/ld+json
    - '{"@context":"https://schema.org","@graph":[{"@type":"WebSite","name":"Next Terminal","url":"https://www.next-terminal.com/","inLanguage":"en","description":"Next Terminal is an open source bastion host and jump server for teams. Unified SSH/RDP/VNC/SFTP/Telnet/HTTP access, asset authorization, session audit and recording, command interception, and Passkey/TOTP/LDAP/OIDC MFA. Self-hosted JumpServer and Teleport alternative."},{"@type":"SoftwareApplication","name":"Next Terminal","applicationCategory":"SecurityApplication","applicationSubCategory":"Bastion Host","operatingSystem":"Linux","url":"https://www.next-terminal.com/","image":"https://www.next-terminal.com/images/website-light.png","description":"Open source bastion host and jump server with multi-protocol remote access, asset authorization, session auditing and recording, and strong authentication. A lightweight JumpServer/Teleport alternative.","featureList":["Multi-protocol access","Assets and credentials","Permissions and policies","Session audit and replay","Risky command interception","Enterprise identity and strong auth"],"publisher":{"@type":"Organization","name":"Next Terminal","url":"https://www.next-terminal.com/"},"keywords":"open source bastion host,bastion host,jump server,JumpServer alternative,Teleport alternative,PAM,operations audit,Next Terminal"}]}'
---

<script setup>
import Page from "./.vitepress/theme/marketing/components/HomePage.vue"
import {homeContent} from "./.vitepress/theme/marketing/config/home.js"
</script>

<Page :content="homeContent.en" locale="en" />
