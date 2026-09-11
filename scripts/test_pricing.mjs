import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

import {PLAN_SKUS, BILLING_CYCLES} from './refresh-pricing.mjs'
import {formatPrice, isBuyable, planPrice, pricingRows} from '../.vitepress/theme/marketing/runtime/pricing-plans.js'
import {pricingContent as zhContent} from '../.vitepress/theme/marketing/config/zh.js'
import {pricingContent as enContent} from '../.vitepress/theme/marketing/config/en.js'

const snapshot = JSON.parse(
    readFileSync(new URL('../.vitepress/theme/marketing/config/pricing-snapshot.json', import.meta.url), 'utf8'),
)

test('价格快照结构完整且金额合法', () => {
    assert.equal(snapshot.ok, true)
    assert.ok(snapshot.product.slug)
    for (const [planKey, skus] of Object.entries(PLAN_SKUS)) {
        const row = snapshot.plans[planKey]
        assert.ok(row, `缺少套餐 ${planKey}`)
        for (const cycle of BILLING_CYCLES) {
            if (!skus[cycle]) {
                assert.equal(row[cycle], undefined, `${planKey}/${cycle} 不应有价格`)
                continue
            }
            const price = row[cycle]
            assert.ok(price, `${planKey}/${cycle} 缺少价格占位`)
            if (price.amount === null) {
                assert.equal(price.checkoutURL, null)
                continue
            }
            assert.ok(Number.isSafeInteger(price.amount) && price.amount > 0, `${planKey}/${cycle} 金额非法`)
            assert.match(price.checkoutURL, /\/checkout\/.+\?price=/)
        }
    }
    assert.ok(snapshot.plans['assets-200'].monthly.amount > 0, '主推套餐必须有真实价格')
})

test('中英文价格文案一致，金额走同一份快照', () => {
    const zhRows = pricingRows(snapshot, zhContent)
    const enRows = pricingRows(snapshot, enContent)
    assert.equal(zhRows.length, enRows.length)
    assert.deepEqual(
        zhRows.map((row) => row.cells.map((cell) => cell.text)),
        enRows.map((row) => row.cells.map((cell) => cell.text)),
    )
    assert.equal(formatPrice(9900, 'zh'), '99')
    assert.equal(formatPrice(149900, 'en'), '1,499')
})

test('占位与可购买状态互斥', () => {
    const price = planPrice(snapshot, 'assets-200', 'monthly')
    assert.equal(isBuyable(snapshot, price), true)
    assert.equal(isBuyable(snapshot, {amount: null, checkoutURL: null}), false)
    assert.equal(isBuyable({ok: false}, price), false)
})
