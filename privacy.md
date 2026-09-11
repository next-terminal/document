---
layout: marketing
title: "Privacy Policy | Next Terminal"
titleTemplate: false
description: "Next Terminal privacy policy: how we collect, use, and protect your personal information."
marketingLocale: en
marketingPage: privacy
---

<script setup>
import Page from "./.vitepress/theme/marketing/components/LegalPage.vue"
import {legalContent} from "./.vitepress/theme/marketing/config/legal.js"

const content = {kind: 'privacy', ...legalContent.en}
</script>

<Page :content="content" locale="en" />
