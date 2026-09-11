<script setup>
import PricingPage from './PricingPage.vue'
import {pricingContent} from '../config/en.js'
</script>

<template>
    <PricingPage :content="pricingContent" locale="en" />
</template>
