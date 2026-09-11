<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { frontmatter } = useData()
</script>

<template>
  <Content v-if="frontmatter.layout === 'marketing'" />
  <DefaultTheme.Layout v-else />
</template>
