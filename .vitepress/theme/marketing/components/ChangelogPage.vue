<script setup>
import {onMounted, ref} from 'vue'
import {SITE} from '../config/site.js'
import {normalizeVersions, renderVersionsHTML, versionsSignature} from '../runtime/changelog.js'
import changelogSnapshot from '../config/changelog-snapshot.json'

const props = defineProps({
    content: {type: Object, required: true},
    locale: {type: String, default: 'en'},
})

const c = props.content.changelog
const api = `${SITE.licenseApiBase}/api/versions?lang=${props.locale === 'en' ? 'en-US' : 'zh-CN'}`
const labels = {loading: c.loading, loadFailed: c.loadFailed, empty: c.empty}

// 构建期预渲染结果（scripts/refresh-changelog.mjs 写出）；拉不到时为 null，退回客户端加载
const snapshot = changelogSnapshot?.[props.locale] ?? null
const prerendered = Boolean(snapshot?.signature)
const initialHTML = snapshot?.html ?? ''

const listEl = ref(null)

onMounted(() => {
    const list = listEl.value
    if (!list) return

    const parsed = JSON.parse(list.dataset.labels ?? '{}')
    // 构建时是否成功预渲染：决定失败时静默保留还是显示错误
    const prerendered = list.hasAttribute('data-signature')

    fetch(list.dataset.api ?? '')
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.json()
        })
        .then((data) => {
            const versions = normalizeVersions(data)
            if (prerendered && versionsSignature(versions) === list.dataset.signature) {
                return
            }
            if (versions.length === 0) {
                const status = document.createElement('div')
                status.className = 'changelog-status'
                status.textContent = parsed.empty ?? ''
                list.replaceChildren(status)
                return
            }
            list.innerHTML = renderVersionsHTML(versions)
        })
        .catch(() => {
            if (!prerendered) {
                const status = document.createElement('div')
                status.className = 'changelog-status'
                status.textContent = parsed.loadFailed ?? ''
                list.replaceChildren(status)
            }
        })
})
</script>

<template>
    <section class="page-head tight">
        <div class="wrap legal-col">
            <h1>{{ c.title }}</h1>
            <p class="lead">{{ c.lead }}</p>
        </div>
    </section>

    <section class="section" style="padding-top: 0;">
        <div class="wrap legal-col">
            <div
                class="changelog-list"
                id="changelog-list"
                ref="listEl"
                :data-api="api"
                :data-labels="JSON.stringify(labels)"
                :data-signature="prerendered ? snapshot.signature : undefined"
            >
                <div v-if="!prerendered || !initialHTML" class="changelog-status">{{ prerendered ? c.empty : c.loading }}</div>
                <div v-else v-html="initialHTML"></div>
            </div>
        </div>
    </section>
</template>
