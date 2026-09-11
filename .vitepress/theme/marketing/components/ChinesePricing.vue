<script setup>
import PricingPage from './PricingPage.vue'
import {pricingContent} from '../config/zh.js'
</script>

<template>
    <PricingPage :content="pricingContent" locale="zh" />
</template>
