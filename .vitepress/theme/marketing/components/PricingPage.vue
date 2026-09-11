<script setup>
import {ref} from 'vue'
import snapshot from '../config/pricing-snapshot.json'
import {SITE} from '../config/site.js'
import {BILLING_CYCLES, formatPrice, isBuyable, planPrice} from '../runtime/pricing-plans.js'

const props = defineProps({
    content: {type: Object, required: true},
    locale: {type: String, default: 'en'},
})

const p = props.content.pricing
const pricing = snapshot
const dialogEl = ref(null)

const cellsFor = (planKey) =>
    BILLING_CYCLES.map((cycle) => {
        const price = planPrice(pricing, planKey, cycle)
        if (!price) return {cycle, empty: true}
        const buyable = isBuyable(pricing, price)
        return {
            cycle,
            empty: false,
            buyable,
            text: price.amount !== null ? formatPrice(price.amount, props.locale) : '--',
            suffix: p.suffixes[cycle],
            hint: buyable ? p.buy : p.syncing,
            checkoutURL: price.checkoutURL,
        }
    })

const openAddon = () => {
    try {
        dialogEl.value?.showModal()
    } catch {
        /* dialog 不可用时静默降级 */
    }
}
const closeAddon = () => dialogEl.value?.close()
const onDialogClick = (event) => {
    const rect = dialogEl.value?.getBoundingClientRect()
    if (!rect) return
    const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
    if (!inside) closeAddon()
}
</script>

<template>
    <div class="mk-page">
        <section class="page-head tight">
            <div class="wrap">
                <div class="page-head-row">
                    <h1>{{ p.title }}</h1>
                    <div class="free-note">
                        <div>
                            <strong>{{ p.freeEdition }}</strong>
                            <span>{{ p.freeEditionDesc }}</span>
                        </div>
                        <a class="btn sm" :href="SITE.github" target="_blank" rel="noopener noreferrer">{{ p.freeEditionCta }}</a>
                    </div>
                </div>
                <p class="lead">{{ p.lead }}</p>
            </div>
        </section>

        <section class="section" style="padding-top: 0">
            <div class="wrap">
                <div v-if="!pricing.ok" class="sync-warning">{{ p.syncWarning }}</div>

                <div class="price-panel">
                    <div class="price-head">
                        <h2>{{ p.tableTitle }}</h2>
                        <span class="currency">{{ p.currencyUnit }}</span>
                    </div>
                    <table class="price-table">
                        <thead>
                            <tr>
                                <th>{{ p.tier }}</th>
                                <th v-for="cycle in BILLING_CYCLES" :key="cycle" class="c">{{ p.cycles[cycle] }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="plan in p.plans" :key="plan.key">
                                <td>
                                    <span class="plan-name">
                                        {{ plan.label }}
                                        <button
                                            v-if="plan.addon"
                                            type="button"
                                            class="plan-addon-btn"
                                            :aria-label="p.addon.cta"
                                            @click="openAddon"
                                        >
                                            <span class="plan-badge">{{ p.addon.cta }}</span>
                                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2" />
                                                <path d="M8 7.2v4M8 5.6h.01" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                                            </svg>
                                        </button>
                                    </span>
                                </td>
                                <td v-for="cell in cellsFor(plan.key)" :key="cell.cycle" class="c">
                                    <span v-if="cell.empty" class="price-buy" aria-disabled="true">
                                        <span class="hint">—</span>
                                    </span>
                                    <a
                                        v-else-if="cell.buyable"
                                        class="price-buy"
                                        :href="cell.checkoutURL"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span class="amount">
                                            <span class="currency-sign">¥</span>
                                            <span class="value">{{ cell.text }}</span>
                                            <span class="suffix">{{ cell.suffix }}</span>
                                        </span>
                                        <span class="hint">{{ cell.hint }}</span>
                                    </a>
                                    <span v-else class="price-buy" aria-disabled="true">
                                        <span class="amount">
                                            <span class="currency-sign">¥</span>
                                            <span class="value">{{ cell.text }}</span>
                                            <span class="suffix">{{ cell.suffix }}</span>
                                        </span>
                                        <span class="hint">{{ cell.hint }}</span>
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="feature-cols">
                        <div class="feature-group">
                            <h3>{{ p.coreTitle }}</h3>
                            <ul>
                                <li v-for="feature in p.coreFeatures" :key="feature">{{ feature }}</li>
                            </ul>
                        </div>
                        <div v-for="group in p.enhancedGroups" :key="group.title" class="feature-group">
                            <h3>{{ group.title }}</h3>
                            <ul>
                                <li v-for="feature in group.items" :key="feature">{{ feature }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <dialog ref="dialogEl" class="addon-dialog" aria-labelledby="addon-dialog-title" @click="onDialogClick">
            <div class="addon-dialog-head">
                <h2 id="addon-dialog-title">{{ p.addon.title }}</h2>
                <button type="button" class="addon-dialog-close" aria-label="Close" @click="closeAddon">×</button>
            </div>
            <p class="addon-dialog-desc">{{ p.addon.desc }}</p>
            <table class="addon-table">
                <thead>
                    <tr>
                        <th>{{ p.addon.thItem }}</th>
                        <th>{{ p.addon.thDelta }}</th>
                        <th class="c">{{ p.addon.thYearly }}</th>
                        <th class="c">{{ p.addon.thLifetime }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{ p.addon.rowUserItem }}</td>
                        <td>{{ p.addon.rowUserDelta }}</td>
                        <td class="c">¥50</td>
                        <td class="c">¥100</td>
                    </tr>
                    <tr>
                        <td>{{ p.addon.rowAssetItem }}</td>
                        <td>{{ p.addon.rowAssetDelta }}</td>
                        <td class="c">¥50</td>
                        <td class="c">¥100</td>
                    </tr>
                </tbody>
            </table>
            <p class="addon-hint">{{ p.addon.hint }}</p>
        </dialog>
    </div>
</template>
