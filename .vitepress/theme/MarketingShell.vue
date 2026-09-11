<script setup>
import {onMounted} from 'vue'
import MarketingHeader from './marketing/components/MarketingHeader.vue'
import MarketingFooter from './marketing/components/MarketingFooter.vue'
import {SITE} from './marketing/config/site.js'

defineProps({
    locale: {type: String, default: 'en'},
    page: {type: String, default: ''}
})

// 与原 Astro 站保持一致：营销页挂载 Umami（域名限定 www.next-terminal.com）。
onMounted(() => {
    if (document.getElementById('umami-script')) return
    const script = document.createElement('script')
    script.id = 'umami-script'
    script.defer = true
    script.src = SITE.umami.src
    script.dataset.websiteId = SITE.umami.websiteId
    script.dataset.domains = SITE.umami.domains
    document.body.appendChild(script)
})
</script>

<template>
    <div class="marketing-shell">
        <MarketingHeader :locale="locale" :page="page"/>
        <main>
            <slot/>
        </main>
        <MarketingFooter :locale="locale"/>
    </div>
</template>
