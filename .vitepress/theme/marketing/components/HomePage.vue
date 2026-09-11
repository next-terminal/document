<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {SITE} from '../config/site.js'

// 逐字移植自 website/src/components/pages/HomePage.astro（含其 import 的 SectionHeading.astro
// ——该子组件只有 heading/sub 两个 prop，这里按其原始 DOM 结构内联，保持 class 不变）。
const props = defineProps({
    content: {type: Object, required: true},
    locale: {type: String, default: 'en'},
})

const home = computed(() => props.content.home)
const deployHref = computed(() => (props.locale === 'zh' ? SITE.deployGuide : SITE.docs.en))

// hero 的微信群二维码气泡：原 Astro 用原生 DOM 事件（鼠标进入/离开/点击/ESC/点击外部），
// 这里改为 Vue 的 ref + document 事件监听，交互行为保持一致。
const wechatOpen = ref(false)
const wechatWrap = ref(null)
const showWechat = () => {
    wechatOpen.value = true
}
const hideWechat = () => {
    wechatOpen.value = false
}
const toggleWechat = () => (wechatOpen.value ? hideWechat() : showWechat())
const isDesktop = () => window.matchMedia('(hover: hover)').matches
const onWechatEnter = () => {
    if (isDesktop()) showWechat()
}
const onWechatLeave = () => {
    if (isDesktop()) hideWechat()
}
const onDocumentClick = (event) => {
    if (!wechatWrap.value?.contains(event.target)) hideWechat()
}
const onDocumentKeydown = (event) => {
    if (event.key === 'Escape') hideWechat()
}

// 演示账号复制按钮：搬运原 copy-btn 逻辑（clipboard → execCommand 回退，1.6s 后还原文案）。
const copiedIndex = ref(-1)
const copyText = async (text) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return true
    }
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.append(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
}
const copyCredential = (text, index) => {
    copyText(text).then((ok) => {
        if (!ok) return
        copiedIndex.value = index
        setTimeout(() => {
            if (copiedIndex.value === index) copiedIndex.value = -1
        }, 1600)
    })
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onDocumentKeydown)
})
onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
    <!-- hero：整行标题 + 左文案右截图 -->
    <section class="hero">
        <div class="wrap">
            <div class="hero-head">
                <span class="eyebrow">{{ home.eyebrow }}</span>
                <h1 class="hero-title">{{ home.title }}</h1>
            </div>
            <div class="hero-grid">
                <div class="hero-copy">
                    <p class="lead">{{ home.lead }}</p>
                    <div class="actions">
                        <a class="btn primary" :href="deployHref">{{ home.deployGuide }}</a>
                        <a class="btn" :href="SITE.usageDocs">{{ home.readDocs }}</a>
                        <a class="btn" :href="SITE.github">{{ home.github }}</a>
                    </div>
                    <div class="community-row" :aria-label="locale === 'zh' ? '加入社群' : 'Join community'">
                        <div id="wechat-wrap" ref="wechatWrap" class="wechat-wrap" @mouseenter="onWechatEnter" @mouseleave="onWechatLeave">
                            <button
                                type="button"
                                id="wechat-btn"
                                class="community-pill"
                                aria-haspopup="dialog"
                                :aria-expanded="wechatOpen ? 'true' : 'false'"
                                aria-controls="wechat-popover"
                                data-umami-event="wechat-group-click"
                                data-umami-event-location="hero"
                                @click.stop="toggleWechat"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.7 14.2c-2.8 0-5-1.7-5-3.8 0-1.2.7-2.3 1.8-3a6 6 0 0 1 3.2-1c2.8 0 5 1.7 5 3.8 0 2.1-2.2 3.8-5 3.8Zm7.3-.2c-.4 0-.8 0-1.2-.2.5-.5.8-1.1.8-1.8 0-1.7-1.8-3-4.1-3.3 1-.6 2.3-.9 3.5-.9 2.4 0 4.3 1.4 4.3 3.2 0 1.7-1.9 3-4.3 3Z"/><circle cx="6.8" cy="10.3" r="1"/><circle cx="8.7" cy="10.3" r="1"/><circle cx="10.6" cy="10.3" r="1"/><circle cx="14.5" cy="11" r=".9"/><circle cx="16.2" cy="11" r=".9"/></svg>
                                <span>{{ home.community.wechat }}</span>
                                <span class="community-pill-hint">{{ home.community.wechatScan }}</span>
                            </button>
                            <div
                                id="wechat-popover"
                                role="dialog"
                                :aria-label="home.community.wechat"
                                class="wechat-popover"
                                :class="{open: wechatOpen}"
                            >
                                <div class="wechat-popover-card">
                                    <img src="/images/wechat-qr.jpg" alt="Next Terminal WeChat group QR code" loading="lazy" />
                                </div>
                                <span class="wechat-popover-hint">{{ home.community.wechatHint }}</span>
                                <div class="wechat-popover-arrow" aria-hidden="true"></div>
                            </div>
                        </div>
                    </div>
                    <div class="protocols" :aria-label="home.protocolsLabel">
                        <span v-for="protocol in home.protocols" :key="protocol">{{ protocol }}</span>
                    </div>
                </div>
                <div class="product-preview">
                    <div class="preview-frame">
                        <div class="preview-media">
                            <img
                                src="/images/website-light.png"
                                width="1732"
                                height="1083"
                                :alt="home.previewAlt"
                                fetchpriority="high"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 信任条 -->
    <section class="proof">
        <div class="wrap">
            <div v-for="item in home.proof" :key="item.title">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
            </div>
        </div>
    </section>

    <!-- capabilities -->
    <section class="section" id="capabilities">
        <div class="wrap">
            <div class="section-heading">
                <h2>{{ home.capabilities.heading }}</h2>
                <p v-if="home.capabilities.sub">{{ home.capabilities.sub }}</p>
            </div>
            <div class="grid three">
                <article v-for="item in home.capabilities.items" :key="item.icon" class="card">
                    <div class="icon">{{ item.icon }}</div>
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.desc }}</p>
                    <a v-if="item.icon === '02'" :href="SITE.assetDocs">{{ item.linkText }}</a>
                    <a v-if="item.icon === '06'" :href="SITE.passkeyDocs">{{ item.linkText }}</a>
                </article>
            </div>
        </div>
    </section>

    <!-- steps -->
    <section class="section alt">
        <div class="wrap">
            <div class="section-heading">
                <h2>{{ home.steps.heading }}</h2>
                <p v-if="home.steps.sub">{{ home.steps.sub }}</p>
            </div>
            <div class="steps">
                <article v-for="step in home.steps.items" :key="step.title" class="step">
                    <div>
                        <h3>{{ step.title }}</h3>
                        <p>{{ step.desc }}</p>
                    </div>
                </article>
            </div>
        </div>
    </section>

    <!-- demo -->
    <section class="section" id="demo">
        <div class="wrap">
            <div class="section-heading">
                <h2>{{ home.demo.heading }}</h2>
                <p :class="locale === 'zh' ? 'demo-lead-nowrap' : undefined">{{ home.demo.sub }}</p>
            </div>
            <div class="demo-panel">
                <div class="demo-actions">
                    <a class="btn primary" :href="SITE.demoLogin" target="_blank" rel="noopener noreferrer">{{ home.demo.open }}</a>
                </div>
                <div class="demo-accounts" :aria-label="home.demo.accountsLabel">
                    <div class="demo-account">
                        <div>
                            <span class="demo-role">{{ home.demo.adminLabel }}</span>
                            <code class="demo-credential">manager / manager</code>
                        </div>
                        <button
                            class="copy-btn"
                            type="button"
                            data-copy="manager / manager"
                            :class="{copied: copiedIndex === 0}"
                            @click="copyCredential('manager / manager', 0)"
                        >{{ copiedIndex === 0 ? home.demo.copied : home.demo.copy }}</button>
                    </div>
                    <div class="demo-account">
                        <div>
                            <span class="demo-role">{{ home.demo.userLabel }}</span>
                            <code class="demo-credential">test / test</code>
                        </div>
                        <button
                            class="copy-btn"
                            type="button"
                            data-copy="test / test"
                            :class="{copied: copiedIndex === 1}"
                            @click="copyCredential('test / test', 1)"
                        >{{ copiedIndex === 1 ? home.demo.copied : home.demo.copy }}</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
