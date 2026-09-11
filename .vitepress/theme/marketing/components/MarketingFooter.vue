<script setup>
import {computed} from 'vue'
import {pagePath} from '../runtime/paths.js'
import {SITE} from '../config/site.js'
import {navContent} from '../config/nav.js'

const props = defineProps({
    locale: {type: String, default: 'en'},
})

const dict = computed(() => navContent[props.locale] || navContent.en)
const f = SITE.filings
</script>

<template>
    <footer class="footer">
        <div class="wrap">
            <div class="footer-top">
                <div>
                    <strong>{{ SITE.brand }}</strong><br/>
                    {{ dict.footer.tagline }}
                </div>
                <nav class="footer-links">
                    <a :href="pagePath('pricing', locale)">{{ dict.footer.pricing }}</a>
                    <a :href="pagePath('cases', locale)">{{ dict.footer.cases }}</a>
                    <a :href="SITE.docs[locale]">{{ dict.footer.docs }}</a>
                    <a :href="SITE.licensePortal" target="_blank" rel="noopener noreferrer">{{ dict.footer.license }}</a>
                    <a :href="SITE.github">{{ dict.footer.github }}</a>
                    <a :href="pagePath('terms', locale)">{{ dict.footer.terms }}</a>
                    <a :href="pagePath('privacy', locale)">{{ dict.footer.privacy }}</a>
                    <a :href="SITE.termark">{{ dict.footer.termark }}</a>
                </nav>
            </div>
            <div class="filings">
                <span>{{ dict.footer.copyright }}</span>
                <a :href="f.icp.href" target="_blank" rel="noopener noreferrer">{{ f.icp.label }}</a>
                <a class="police-filing" :href="f.police.href" target="_blank" rel="noopener noreferrer">
                    <img :src="f.police.badge" alt="" width="14" height="14" loading="lazy"/>
                    {{ f.police.label }}
                </a>
            </div>
        </div>
    </footer>
</template>
