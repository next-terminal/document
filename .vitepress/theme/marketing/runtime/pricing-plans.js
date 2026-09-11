// 价格快照的读取与格式化，独立于 Vue 与 DOM，便于用 node --test 直接验证。
export const BILLING_CYCLES = ['monthly', 'yearly', 'lifetime'];

export function planPrice(snapshot, planKey, cycle) {
    return snapshot?.plans?.[planKey]?.[cycle];
}

export function isBuyable(snapshot, price) {
    return Boolean(snapshot?.ok && price && price.amount !== null && price.checkoutURL);
}

export function formatPrice(amount, locale) {
    const value = amount / 100;
    return value.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {maximumFractionDigits: 2});
}

/** 渲染用行数据：snapshot + 文案 → 表格行（与 Astro 版 PricingPage 的输出保持一致）。 */
export function pricingRows(snapshot, content) {
    const p = content.pricing;
    return p.plans.map((plan) => ({
        key: plan.key,
        label: plan.label,
        addon: Boolean(plan.addon),
        cells: BILLING_CYCLES.map((cycle) => {
            const price = planPrice(snapshot, plan.key, cycle);
            if (!price) return {cycle, empty: true};
            const buyable = isBuyable(snapshot, price);
            return {
                cycle,
                empty: false,
                buyable,
                amount: price.amount,
                text: price.amount !== null ? formatPrice(price.amount, 'zh') : '--',
                suffix: p.suffixes[cycle],
                hint: buyable ? p.buy : p.syncing,
                checkoutURL: price.checkoutURL,
            };
        }),
    }));
}
