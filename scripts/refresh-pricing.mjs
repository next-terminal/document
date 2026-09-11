import {writeSnapshotIfChanged} from './write-snapshot.mjs'
import {pathToFileURL} from 'node:url'

const licenseApiBase = process.env.LICENSE_API_BASE ?? 'https://license.next-terminal.com'
const defaultStoreBase = (process.env.STORE_BASE_URL ?? 'https://store.next-terminal.com').replace(/\/+$/, '')
const defaultSlug = process.env.STORE_PRODUCT_SLUG ?? 'next-terminal'

/** 套餐 SKU 映射，与 website/src/lib/pricing.ts（授权系统定价页）保持一致。 */
export const PLAN_SKUS = {
    'personal-enhanced-100': {
        yearly: 'assets-personal-100-12m',
        lifetime: 'assets-personal-100-lifetime',
    },
    'assets-200': {
        monthly: 'assets-200-1m',
        yearly: 'assets-200-12m',
    },
    'assets-500': {
        monthly: 'assets-500-1m',
        yearly: 'assets-500-12m',
    },
    'assets-1000': {
        monthly: 'assets-1000-1m',
        yearly: 'assets-1000-12m',
    },
}

export const BILLING_CYCLES = ['monthly', 'yearly', 'lifetime']

async function fetchJSON(url, timeoutMs = 15000) {
    const response = await fetch(url, {signal: AbortSignal.timeout(timeoutMs)})
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
    return await response.json()
}

/**
 * 构建期刷新价格快照：授权后端给出商城地址 → 商城给出真实 CNY 价格。
 * 任何一步失败都重试 3 次后让构建失败，绝不发布空价格或旧价格。
 */
export async function refreshPricing() {
    let lastError
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            let storeBase = defaultStoreBase
            let slug = defaultSlug
            const purchase = await fetchJSON(`${licenseApiBase}/api/purchase`)
            if (purchase?.shopBaseURL) storeBase = purchase.shopBaseURL.replace(/\/+$/, '')
            if (purchase?.shopProductSlug) slug = purchase.shopProductSlug

            // 价格以 CNY 为准，中英文营销页共用同一份金额（页面上标注“价格单位：人民币”）。
            const detail = await fetchJSON(`${storeBase}/api/store/products/${slug}?language=zh-CN`)
            const productKey = detail?.product?.slug || detail?.product?.id || slug
            const prices = (detail?.prices ?? [])
                .filter((price) => (price.status === undefined || price.status === 'enabled') && price.showInList !== false)
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
            if (!prices.length) throw new Error('published pricing list is empty')

            const plans = {}
            for (const [planKey, skus] of Object.entries(PLAN_SKUS)) {
                const row = {}
                for (const cycle of BILLING_CYCLES) {
                    const sku = skus[cycle]
                    if (!sku) continue
                    const price = prices.find((item) => item.lookupKey === sku || item.id === sku)
                    if (!price) {
                        // 商城尚未同步该 SKU：保留占位，页面显示“商城价格同步中”。
                        row[cycle] = {amount: null, checkoutURL: null}
                        continue
                    }
                    if (price.currency !== 'CNY' || !Number.isSafeInteger(price.unitAmount) || price.unitAmount < 0) {
                        throw new Error(`invalid price payload for ${sku}`)
                    }
                    const checkout = new URL(`/checkout/${productKey}`, storeBase)
                    checkout.searchParams.set('price', price.lookupKey)
                    if (price.billingScheme === 'per_unit' && (price.defaultQuantity ?? 0) > 0) {
                        checkout.searchParams.set('quantity', String(price.defaultQuantity))
                    }
                    row[cycle] = {amount: price.unitAmount, checkoutURL: checkout.toString()}
                }
                plans[planKey] = row
            }

            const snapshot = {
                ok: true,
                fetchedAt: new Date().toISOString(),
                storeBase,
                product: {slug: productKey},
                plans,
            }
            await writeSnapshotIfChanged(
                new URL('../.vitepress/theme/marketing/config/pricing-snapshot.json', import.meta.url),
                snapshot,
            )
            const priced = Object.values(plans).flatMap((row) => Object.values(row)).filter((item) => item.amount !== null)
            console.log(`Updated ${priced.length} published prices from ${storeBase}`)
            return snapshot
        } catch (error) {
            lastError = error
        }
    }
    throw new Error('Cannot build with unverified pricing', {cause: lastError})
}

// 允许直接执行：node scripts/refresh-pricing.mjs
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await refreshPricing()
}
