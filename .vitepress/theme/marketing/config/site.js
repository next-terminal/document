// 营销页共用的站点常量，对齐原 Astro 站 website/src/lib/site.ts。
// 合并到 VitePress 后：docs/blog 链接应改为站内路径，这里先保留外链以便两个阶段并存。
export const SITE = {
    url: 'https://www.next-terminal.com',
    brand: 'Next Terminal',
    licensePortal: 'https://license.next-terminal.com',
    demoLogin: 'https://demo.next-terminal.com',
    github: 'https://github.com/next-terminal/next-terminal',
    termark: 'https://www.termark.app',
    docs: {
        zh: 'https://docs.next-terminal.com/zh/',
        en: 'https://docs.next-terminal.com/',
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
