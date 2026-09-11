<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import MarketingShell from './MarketingShell.vue'

const { frontmatter } = useData()
</script>

<template>
  <MarketingShell
    v-if="frontmatter.layout === 'marketing'"
    :locale="frontmatter.marketingLocale || 'en'"
    :page="frontmatter.marketingPage || ''"
  >
    <Content />
  </MarketingShell>
  <DefaultTheme.Layout v-else />
</template>
