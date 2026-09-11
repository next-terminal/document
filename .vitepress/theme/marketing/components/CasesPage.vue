<script setup>
import {onMounted, ref} from 'vue'
import {SITE} from '../config/site.js'

const props = defineProps({
    content: {type: Object, required: true},
    locale: {type: String, default: 'en'},
})

const c = props.content.cases
const dateLocale = props.locale === 'zh' ? 'zh-CN' : 'en-US'
const casesApi = `${SITE.licenseApiBase}/api/cases`

const tbodyEl = ref(null)
const statusEl = ref(null)

onMounted(() => {
    const tbody = tbodyEl.value
    const status = statusEl.value
    if (!tbody || !status) return

    const labels = {
        loading: c.loading,
        loadFailed: c.loadFailed,
        retry: c.retry,
        none: c.none,
        noneDesc: c.noneDesc,
        empty: c.empty,
    }

    const showStatus = (text, {error = false, retry = false} = {}) => {
        tbody.hidden = true
        status.hidden = false
        status.className = error ? 'cases-status error' : 'cases-status'
        status.textContent = ''
        status.append(text)
        if (retry) {
            const btn = document.createElement('a')
            btn.className = 'retry'
            btn.href = '#reload-cases'
            btn.textContent = labels.retry
            btn.addEventListener('click', (event) => {
                event.preventDefault()
                load()
            })
            status.append(document.createElement('br'), btn)
        }
    }

    const renderCases = (cases) => {
        if (!Array.isArray(cases) || cases.length === 0) {
            showStatus(labels.none + '\u3000' + labels.noneDesc)
            return
        }
        tbody.replaceChildren()
        for (const item of cases) {
            const tr = document.createElement('tr')
            const company = document.createElement('td')
            company.className = 'company'
            company.textContent = item.companyName || '-'
            const useCase = document.createElement('td')
            useCase.className = 'text'
            useCase.textContent = item.useCase || '-'
            const favorite = document.createElement('td')
            favorite.className = 'text'
            favorite.textContent = item.favoriteFeature || '-'
            const date = document.createElement('td')
            date.className = 'date'
            if (item.createdAt) {
                date.textContent = new Date(item.createdAt).toLocaleDateString(dateLocale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })
            } else {
                date.textContent = '-'
            }
            tr.append(company, useCase, favorite, date)
            tbody.append(tr)
        }
        status.hidden = true
    }

    const skeletonHTML = tbody.innerHTML

    const load = () => {
        status.hidden = true
        tbody.hidden = false
        tbody.innerHTML = skeletonHTML
        fetch(casesApi)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                return response.json()
            })
            .then(renderCases)
            .catch(() => showStatus(labels.loadFailed, {error: true, retry: true}))
    }

    load()
})
</script>

<template>
    <section class="page-head tight">
        <div class="wrap">
            <h1>{{ c.title }}</h1>
            <p class="lead">{{ c.lead }}</p>
        </div>
    </section>

    <section class="section" style="padding-top: 0;">
        <div class="wrap">
            <div class="cases-panel">
                <table class="cases-table">
                    <thead>
                        <tr>
                            <th>{{ c.company }}</th>
                            <th>{{ c.useCase }}</th>
                            <th>{{ c.favoriteFeature }}</th>
                            <th>{{ c.submitted }}</th>
                        </tr>
                    </thead>
                    <tbody id="cases-body" ref="tbodyEl">
                        <tr>
                            <td><div class="skeleton-row" style="width:120px;height:14px;"></div></td>
                            <td><div class="skeleton-row" style="width:90%;height:14px;"></div></td>
                            <td><div class="skeleton-row" style="width:70%;height:14px;"></div></td>
                            <td><div class="skeleton-row" style="width:90px;height:14px;"></div></td>
                        </tr>
                    </tbody>
                </table>
                <div id="cases-status" class="cases-status" hidden ref="statusEl"></div>
            </div>

        </div>
    </section>
</template>
