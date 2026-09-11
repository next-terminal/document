---
layout: marketing
title: "服务条款｜Next Terminal"
titleTemplate: false
description: "Next Terminal 网站服务条款。"
marketingLocale: zh
marketingPage: terms
---

<script setup>
import Page from "../.vitepress/theme/marketing/components/LegalPage.vue"
import {legalContent} from "../.vitepress/theme/marketing/config/legal.js"

const content = {kind: 'terms', ...legalContent.zh}
</script>

<Page :content="content" locale="zh" />
