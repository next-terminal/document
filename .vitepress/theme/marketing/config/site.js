// 营销页共用的站点常量，对齐原 Astro 站 website/src/lib/site.ts。
// 合并过渡期：docs/blog 链接先保留外链（域名未切换），切换时改站内路径。
export const SITE = {
    url: 'https://www.next-terminal.com',
    brand: 'Next Terminal',
    licensePortal: 'https://license.next-terminal.com',
    licenseApiBase: 'https://license.next-terminal.com',
    demoLogin: 'https://demo.next-terminal.com',
    storeBaseURL: 'https://store.next-terminal.com',
    storeProductSlug: 'next-terminal',
    github: 'https://github.com/next-terminal/next-terminal',
    termark: 'https://www.termark.app',
    docs: {
        zh: 'https://docs.next-terminal.com/zh/',
        en: 'https://docs.next-terminal.com/',
    },
    blog: {
        zh: 'https://docs.next-terminal.com/zh/blog/docker-deploy',
        en: 'https://docs.next-terminal.com/blog/docker-deploy',
    },
    deployGuide: 'https://docs.next-terminal.com/zh/install/container-install',
    usageDocs: 'https://docs.next-terminal.com/zh/usage/readme',
    assetDocs: 'https://docs.next-terminal.com/zh/usage/asset',
    passkeyDocs: 'https://docs.next-terminal.com/zh/usage/passkey',
    umami: {
        src: 'https://umami.next-terminal.com/script.js',
        websiteId: '3600635d-c8bf-4f0f-a73e-34a739da48c2',
        domains: 'www.next-terminal.com',
    },
    filings: {
        icp: {label: '蜀ICP备2026044859号-2', href: 'https://beian.miit.gov.cn/'},
        police: {
            label: '川公网安备51019002010272号',
            href: 'https://beian.mps.gov.cn/#/query/webSearch?code=51019002010272',
            badge: '/images/ghs.png',
        },
    },
};

export function absoluteUrl(path) {
    return new URL(path, SITE.url).toString();
}
