---
layout: marketing
title: "隐私政策｜Next Terminal"
titleTemplate: false
description: "Next Terminal 隐私政策：我们如何收集、使用和保护您的个人信息。"
marketingLocale: zh
marketingPage: privacy
---

<script setup>
import Page from "../.vitepress/theme/marketing/components/LegalPage.vue"
import {legalContent} from "../.vitepress/theme/marketing/config/legal.js"

const content = {kind: 'privacy', ...legalContent.zh}
</script>

<Page :content="content" locale="zh" />
