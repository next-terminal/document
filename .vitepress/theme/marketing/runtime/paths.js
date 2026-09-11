// 营销页路径助手（对齐原 Astro 站 website/src/lib/site.ts 的 pagePath）。
// 合并后：EN 在根路径，ZH 在 /zh/ 前缀。站点未启用 cleanUrls，故链接带 .html 后缀。
const SLUGS = {
    home: '/',
    pricing: '/pricing',
    cases: '/cases',
    freeEnterpriseLicense: '/free-enterprise-license',
    changelog: '/changelog',
    terms: '/terms',
    privacy: '/privacy',
};

export const PAGE_KEYS = Object.keys(SLUGS);

export function pagePath(page, locale) {
    const slug = SLUGS[page];
    if (locale === 'zh') {
        return slug === '/' ? '/zh/' : `/zh${slug}.html`;
    }
    return slug === '/' ? '/' : `${slug}.html`;
}

/** 把另一语言版本的路径取出来（用于语言切换链接） */
export function altPath(page, locale) {
    return pagePath(page, locale === 'zh' ? 'en' : 'zh');
}
