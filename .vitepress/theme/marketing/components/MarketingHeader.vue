<script setup>
import {computed, ref} from 'vue'
import {altPath, pagePath} from '../runtime/paths.js'
import {SITE} from '../config/site.js'
import {navContent} from '../config/nav.js'

const props = defineProps({
    locale: {type: String, default: 'en'},
    page: {type: String, default: ''},
})

const dict = computed(() => navContent[props.locale] || navContent.en)
const docsURL = computed(() => SITE.docs[props.locale])
// 对齐原 Astro Header：pagePath(page, altLocale)（altLocale 为另一语言）
const altHref = computed(() => altPath(props.page, props.locale))

const navItems = computed(() => [
    {label: dict.value.nav.cases, href: pagePath('cases', props.locale), key: 'cases'},
    {label: dict.value.nav.freeEnterpriseLicense, href: pagePath('freeEnterpriseLicense', props.locale), key: 'freeEnterpriseLicense'},
    {label: dict.value.nav.pricing, href: pagePath('pricing', props.locale), key: 'pricing'},
    {label: dict.value.nav.changelog, href: pagePath('changelog', props.locale), key: 'changelog'},
    {label: dict.value.nav.docs, href: docsURL.value, external: true},
    {label: dict.value.nav.blog, href: SITE.blog[props.locale], external: true},
])

// 原 Astro 的高亮条件：item.key && item.key === page
const isCurrent = (item) => Boolean(item.key && item.key === props.page)

// 移动端菜单（原站点用原生 <details>，这里把开合状态交给 Vue ref，不直接操作 DOM）
const menuEl = ref(null)
const menuOpen = ref(false)
const onMenuToggle = (event) => {
    menuOpen.value = event.target.open
}
const closeMenu = () => {
    if (menuEl.value) menuEl.value.open = false
}
</script>

<template>
    <header class="nav">
        <div class="wrap nav-inner">
            <a class="brand" :href="pagePath('home', locale)"
            ><img src="/images/logo.png" :alt="`${SITE.brand} logo`"/>{{ SITE.brand }}</a
            >
            <div class="nav-right">
                <nav class="nav-links" :aria-label="dict.locale.primaryNav">
                    <template v-for="item in navItems" :key="item.label">
                        <a v-if="isCurrent(item)" :href="item.href" aria-current="page">
                            {{ item.label }}
                            <svg v-if="item.external" class="ext-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                        </a>
                        <a
                            v-else
                            :href="item.href"
                            :target="item.external ? '_blank' : undefined"
                            :rel="item.external ? 'noopener noreferrer' : undefined"
                        >
                            {{ item.label }}
                            <svg v-if="item.external" class="ext-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                        </a>
                    </template>
                </nav>
                <a class="nav-lang" :href="altHref" :aria-label="dict.locale.switchLabel">{{ dict.locale.switchText }}</a>
                <a class="nav-signin" :href="SITE.licensePortal" target="_blank" rel="noopener noreferrer" data-umami-event="nav-login-click" data-umami-event-location="header">{{ dict.nav.signIn }}</a>
            </div>
            <details ref="menuEl" class="mobile-menu" :open="menuOpen" @toggle="onMenuToggle">
                <summary :aria-label="dict.locale.openMenu">☰</summary>
                <nav>
                    <template v-for="item in navItems" :key="item.label">
                        <a
                            :href="item.href"
                            :target="item.external ? '_blank' : undefined"
                            :rel="item.external ? 'noopener noreferrer' : undefined"
                            @click="closeMenu"
                        >
                            {{ item.label }}
                            <svg v-if="item.external" class="ext-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                        </a>
                    </template>
                    <a :href="altHref" @click="closeMenu">{{ dict.locale.switchText }}</a>
                    <a :href="SITE.licensePortal" target="_blank" rel="noopener noreferrer" data-umami-event="nav-login-click" data-umami-event-location="mobile" class="mobile-signin" @click="closeMenu">{{ dict.nav.signIn }}</a>
                </nav>
            </details>
        </div>
    </header>
</template>
