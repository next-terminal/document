---
layout: marketing
title: "Terms of Service | Next Terminal"
titleTemplate: false
description: "Terms of service for the Next Terminal website."
marketingLocale: en
marketingPage: terms
---

<script setup>
import Page from "./.vitepress/theme/marketing/components/LegalPage.vue"
import {legalContent} from "./.vitepress/theme/marketing/config/legal.js"

const content = {kind: 'terms', ...legalContent.en}
</script>

<Page :content="content" locale="en" />
