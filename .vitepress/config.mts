import {existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {defineConfig, type DefaultTheme} from 'vitepress'

const docsOrigin = 'https://docs.next-terminal.com'

function routeFromRelativePath(relativePath: string) {
    const path = relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
    return path ? `/${path}` : '/'
}

function alternatePath(relativePath: string) {
    const source = relativePath.startsWith('zh/') ? relativePath.slice(3) : `zh/${relativePath}`
    return existsSync(resolve(process.cwd(), source)) ? routeFromRelativePath(source) : undefined
}

const head: DefaultTheme.Config['head'] = [
    ['link', {rel: 'icon', href: '/logo.svg'}],
    ['meta', {
        name: 'keywords',
        content: 'Next Terminal, bastion host, 堡垒机, 开源堡垒机, open source bastion, jump server, 跳板机, PAM, privileged access management, 运维审计, operations audit, SSH, RDP, VNC, Telnet, Web SSH, session audit, JumpServer alternative, Teleport alternative'
    }],
    ['meta', {property: 'og:title', content: 'Next Terminal Documentation - Secure Remote Access and Operations Audit'}],
    ['meta', {
        property: 'og:description',
        content: 'Official documentation for installing Next Terminal, managing assets, configuring secure remote access, and auditing operations.'
    }],
    ['meta', {property: 'og:type', content: 'website'}],
    ['meta', {property: 'og:image', content: `${docsOrigin}/logo.svg`}],
    [
        'script',
        {
            async: '',
            src: 'https://umami.next-terminal.com/script.js',
            'data-website-id': '4693b455-683d-4012-a715-cb5fd297ccdc'
        }
    ]
]

const enNav: DefaultTheme.NavItem[] = [
    {text: 'Installation', link: '/install/system-requirements', activeMatch: '^/install/'},
    {text: 'User Guide', link: '/usage/readme', activeMatch: '^/usage/'},
    {text: 'FAQ', link: '/faq/readme', activeMatch: '^/faq/'},
    {text: 'Blog', link: '/blog/docker-deploy', activeMatch: '^/blog/'},
    {text: 'API Docs', link: '/api/certificate', activeMatch: '^/api/'},
    {text: 'Official Website', link: 'https://www.next-terminal.com/'}
]

const zhNav: DefaultTheme.NavItem[] = [
    {text: '安装文档', link: '/zh/install/system-requirements', activeMatch: '^/zh/install/'},
    {text: '使用文档', link: '/zh/usage/readme', activeMatch: '^/zh/usage/'},
    {text: '常见问题', link: '/zh/faq/readme', activeMatch: '^/zh/faq/'},
    {text: '博客文章', link: '/zh/blog/docker-deploy', activeMatch: '^/zh/blog/'},
    {text: 'API 文档', link: '/zh/api/certificate', activeMatch: '^/zh/api/'},
    {text: '官网地址', link: 'https://www.next-terminal.com/'}
]

const enInstallSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'Installation',
        collapsed: false,
        items: [
            {text: 'System Requirements', link: '/install/system-requirements'},
            {text: 'Container Installation', link: '/install/container-install'},
            {text: 'Primary/Standby HA Deployment', link: '/install/ha-primary-standby-guide'},
            {text: 'Production HA Checklist', link: '/install/ha-production-checklist'},
            {text: 'Configuration File', link: '/install/config-desc'},
            {text: 'Reverse Proxy', link: '/install/reverse-proxy'},
            {text: 'Disable Docker userland-proxy', link: '/install/disable-docker-userland-proxy'},
            {text: 'Real Client IP', link: '/install/real-ip'}
        ]
    }
]

const enUsageSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'User Guide',
        collapsed: false,
        items: [
            {text: 'Quick Start', link: '/usage/readme'},
            {
                text: 'Resource Management',
                items: [
                    {text: 'Assets', link: '/usage/asset'},
                    {text: 'Web Assets', link: '/usage/website'},
                    {text: 'HTTPS mTLS', link: '/usage/mtls'},
                    {text: 'Database Audit', link: '/usage/database'}
                ]
            },
            {
                text: 'Access Gateways',
                items: [
                    {text: 'Security Gateway', link: '/usage/agent-gateway'},
                    {text: 'Security Gateway Configuration', link: '/usage/agent-gateway-config'},
                    {text: 'SSH Gateway', link: '/usage/ssh-gateway'}
                ]
            },
            {
                text: 'Access Assets',
                items: [
                    {text: 'Asset Access', link: '/usage/access'},
                    {text: 'SSH Proxy Server', link: '/usage/ssh-server'},
                    {text: 'RDP Proxy Server', link: '/usage/rdp-server'},
                    {text: 'Termark', link: '/usage/termark'},
                    {text: 'RDP/VNC Error Codes', link: '/usage/error-codes'}
                ]
            },
            {
                text: 'System Settings',
                items: [
                    {text: 'Passkey', link: '/usage/passkey'},
                    {text: '2FA (TOTP)', link: '/usage/otp'},
                    {text: 'OIDC Identity Server', link: '/usage/oidc_server'},
                    {text: 'License Binding', link: '/usage/license'}
                ]
            },
            {text: 'Compliance', link: '/usage/compliance'}
        ]
    }
]

const enFaqSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'FAQ',
        collapsed: false,
        items: [
            {text: 'FAQ', link: '/faq/readme'},
            {text: 'CLI', link: '/faq/cli'},
            {text: 'System Properties', link: '/faq/property'},
            {text: 'Migrate PostgreSQL 16 to 18', link: '/faq/postgresql-16-to-18'},
            {text: 'Upgrade v1 to v2', link: '/faq/v1tov2'},
            {text: 'Upgrade Native Installation to v3.2.0+', link: '/faq/v3.2.0-native-upgrade'}
        ]
    }
]

const enBlogSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'Blog',
        collapsed: false,
        items: [
            {text: 'Deploy Next Terminal Bastion Host with Docker: First SSH Asset in 5 Minutes', link: '/blog/docker-deploy'},
            {text: 'What Is the "Authentication Private Key" in SSH, and What Does It Actually Authenticate?', link: '/blog/ssh-authentication'},
            {text: '2026 Open Source Bastion Host Selection Guide: JumpServer vs Teleport vs Next Terminal', link: '/blog/selection-guide'},
            {text: 'Secure Web Asset Publishing: Replace VPN with Next Terminal', link: '/blog/web-asset-gateway'},
            {text: 'RDP Black Screen or Connection Failed? 5 Steps to Fix Windows Remote Desktop', link: '/blog/rdp-black-screen-failed'},
            {text: 'Sign in to Proxmox VE with Next Terminal OIDC', link: '/blog/pve-oidc/readme'},
            {text: 'Database Won\'t Expose to Public? 3 Secure Remote Access Methods', link: '/blog/db-remote-access'},
            {text: 'Still Sharing Root Passwords? Permissions and Auditing for Teams', link: '/blog/share-root-password-risk'},
            {text: 'Access Intranet Without VPN: 3 Secure Alternatives Compared', link: '/blog/intranet-without-vpn'}
        ]
    }
]

const enApiSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'API Docs',
        collapsed: false,
        items: [{text: 'Certificate Management', link: '/api/certificate'}]
    }
]

const enSidebar: DefaultTheme.Sidebar = {
    '/install/': enInstallSidebar,
    '/usage/': enUsageSidebar,
    '/faq/': enFaqSidebar,
    '/blog/': enBlogSidebar,
    '/api/': enApiSidebar
}

const zhInstallSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: '安装文档',
        collapsed: false,
        items: [
            {text: '系统需求', link: '/zh/install/system-requirements'},
            {text: '容器安装', link: '/zh/install/container-install'},
            {text: '主备高可用部署', link: '/zh/install/ha-primary-standby-guide'},
            {text: '生产级高可用 Checklist', link: '/zh/install/ha-production-checklist'},
            {text: '配置文件', link: '/zh/install/config-desc'},
            {text: '反向代理', link: '/zh/install/reverse-proxy'},
            {text: '禁用 Docker userland-proxy', link: '/zh/install/disable-docker-userland-proxy'},
            {text: '获取真实IP', link: '/zh/install/real-ip'}
        ]
    }
]

const zhUsageSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: '使用文档',
        collapsed: false,
        items: [
            {text: '快速开始', link: '/zh/usage/readme'},
            {
                text: '资源管理',
                items: [
                    {text: '资产管理', link: '/zh/usage/asset'},
                    {text: 'Web资产', link: '/zh/usage/website'},
                    {text: 'HTTPS 证书双向认证', link: '/zh/usage/mtls'},
                    {text: '数据库审计', link: '/zh/usage/database'}
                ]
            },
            {
                text: '接入网关',
                items: [
                    {text: '安全网关', link: '/zh/usage/agent-gateway'},
                    {text: '安全网关配置文件', link: '/zh/usage/agent-gateway-config'},
                    {text: 'SSH网关', link: '/zh/usage/ssh-gateway'}
                ]
            },
            {
                text: '访问资产',
                items: [
                    {text: '资产访问', link: '/zh/usage/access'},
                    {text: 'SSH代理服务器', link: '/zh/usage/ssh-server'},
                    {text: 'RDP代理服务器', link: '/zh/usage/rdp-server'},
                    {text: 'Termark 本地客户端', link: '/zh/usage/termark'},
                    {text: 'RDP/VNC 错误码', link: '/zh/usage/error-codes'}
                ]
            },
            {
                text: '系统设置',
                items: [
                    {text: '通行令牌（Passkey）', link: '/zh/usage/passkey'},
                    {text: '2fa(TOTP)', link: '/zh/usage/otp'},
                    {text: 'OIDC 身份服务器', link: '/zh/usage/oidc_server'},
                    {text: '绑定授权', link: '/zh/usage/license'}
                ]
            },
            {text: '合规与审计', link: '/zh/usage/compliance'}
        ]
    }
]

const zhFaqSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: '常见问题',
        collapsed: false,
        items: [
            {text: 'FAQ', link: '/zh/faq/readme'},
            {text: '命令行', link: '/zh/faq/cli'},
            {text: '系统配置表', link: '/zh/faq/property'},
            {text: 'PostgreSQL 16 迁移到 18', link: '/zh/faq/postgresql-16-to-18'},
            {text: 'v1 升级 v2', link: '/zh/faq/v1tov2'},
            {text: '原生安装升级到 v3.2.0+', link: '/zh/faq/v3.2.0-native-upgrade'}
        ]
    }
]

const zhBlogSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: '博客文章',
        collapsed: false,
        items: [
            {text: 'Docker 一键部署 Next Terminal 开源堡垒机：5分钟接入首个 SSH 资产', link: '/zh/blog/docker-deploy'},
            {text: 'SSH 里的“认证私钥”到底是什么，它认证的是谁？', link: '/zh/blog/ssh-authentication'},
            {text: '2026 开源堡垒机选型指南：如何为中小团队选 JumpServer / Teleport / Next Terminal', link: '/zh/blog/selection-guide'},
            {text: 'Web 资产安全发布：用 Next Terminal 替代 VPN 暴露内网系统', link: '/zh/blog/web-asset-gateway'},
            {text: 'RDP 连不上/黑屏/凭证失效？Windows 远程桌面 5 步排查', link: '/zh/blog/rdp-black-screen-failed'},
            {text: '使用 Next Terminal OIDC 登录 Proxmox VE', link: '/zh/blog/pve-oidc/readme'},
            {text: '数据库不敢开公网？MySQL/PostgreSQL 安全远程访问 3 种方式', link: '/zh/blog/db-remote-access'},
            {text: '还在共享 root 密码？多人运维的权限与审计怎么做', link: '/zh/blog/share-root-password-risk'},
            {text: '不开 VPN 怎么安全访问内网系统？3 种方案对比', link: '/zh/blog/intranet-without-vpn'}
        ]
    }
]

const zhServicesSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: '付费服务',
        collapsed: false,
        items: [{text: '安装服务', link: '/zh/services/readme'}]
    }
]

const zhApiSidebar: DefaultTheme.SidebarItem[] = [
    {
        text: 'API 文档',
        collapsed: false,
        items: [{text: '证书管理', link: '/zh/api/certificate'}]
    }
]

const zhSidebar: DefaultTheme.Sidebar = {
    '/zh/install/': zhInstallSidebar,
    '/zh/usage/': zhUsageSidebar,
    '/zh/faq/': zhFaqSidebar,
    '/zh/blog/': zhBlogSidebar,
    '/zh/services/': zhServicesSidebar,
    '/zh/api/': zhApiSidebar
}

export default defineConfig({
    title: 'Next Terminal',
    description: 'Next Terminal open source bastion host and PAM — unified SSH/RDP/VNC/Telnet access, asset authorization, session audit and recording. A JumpServer/Teleport alternative for teams.',
    head,
    sitemap: {
        hostname: 'https://docs.next-terminal.com'
    },
    transformPageData(pageData) {
        if (!pageData.description) {
            const chinese = pageData.relativePath.startsWith('zh/')
            pageData.description = chinese
                ? `${pageData.title}：Next Terminal 官方安装、配置与使用说明。`
                : `${pageData.title}: official Next Terminal installation, configuration, and usage guidance.`
        }
    },
    transformHead({pageData}) {
        const route = routeFromRelativePath(pageData.relativePath)
        const canonical = `${docsOrigin}${route}`
        const chinese = pageData.relativePath.startsWith('zh/')
        const alternate = alternatePath(pageData.relativePath)
        const result: DefaultTheme.Config['head'] = [
            ['link', {rel: 'canonical', href: canonical}],
            ['meta', {property: 'og:url', content: canonical}],
            ['meta', {property: 'og:locale', content: chinese ? 'zh_CN' : 'en_US'}],
            ['script', {type: 'application/ld+json'}, JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'TechArticle',
                headline: pageData.title,
                description: pageData.description,
                url: canonical,
                inLanguage: chinese ? 'zh-CN' : 'en-US',
                publisher: {'@type': 'Organization', name: 'Next Terminal', url: 'https://www.next-terminal.com/'}
            })]
        ]
        if (alternate) {
            const englishRoute = chinese ? alternate : route
            const chineseRoute = chinese ? route : alternate
            result.push(
                ['link', {rel: 'alternate', hreflang: 'en', href: `${docsOrigin}${englishRoute}`}],
                ['link', {rel: 'alternate', hreflang: 'zh-CN', href: `${docsOrigin}${chineseRoute}`}],
                ['link', {rel: 'alternate', hreflang: 'x-default', href: `${docsOrigin}${englishRoute}`}]
            )
        }
        return result
    },
    themeConfig: {
        search: {
            provider: 'local',
            options: {
                locales: {
                    zh: {
                        translations: {
                            button: {
                                buttonText: '搜索',
                                buttonAriaLabel: '搜索'
                            },
                            modal: {
                                displayDetails: '显示详细列表',
                                resetButtonTitle: '重置搜索',
                                backButtonTitle: '关闭搜索',
                                noResultsText: '没有结果',
                                footer: {
                                    selectText: '选择',
                                    selectKeyAriaLabel: '输入',
                                    navigateText: '导航',
                                    navigateUpKeyAriaLabel: '上箭头',
                                    navigateDownKeyAriaLabel: '下箭头',
                                    closeText: '关闭',
                                    closeKeyAriaLabel: 'esc'
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    locales: {
        root: {
            label: 'English',
            lang: 'en-US',
            title: 'Next Terminal',
            description: 'Next Terminal open source bastion host and PAM — unified SSH/RDP/VNC/Telnet access, session audit and operations audit. A JumpServer and Teleport alternative.',
            themeConfig: {
                lastUpdated: {
                    text: 'Last Updated'
                },
                editLink: {
                    pattern: 'https://github.com/dushixiang/next-terminal-document/edit/main/:path',
                    text: 'Edit this page on GitHub'
                },
                outline: {
                    level: [2, 3],
                    label: 'On this page'
                },
                nav: enNav,
                sidebar: enSidebar,
                socialLinks: [{icon: 'github', link: 'https://github.com/dushixiang/next-terminal'}]
            }
        },
        zh: {
            label: '简体中文',
            lang: 'zh-CN',
            link: '/zh/',
            title: 'Next Terminal',
            description: 'Next Terminal 开源堡垒机与运维审计系统 — 支持 SSH/RDP/VNC/Telnet 统一接入、资产授权、会话审计与录像，JumpServer/Teleport 的轻量替代。',
            head: [
                ['meta', {property: 'og:title', content: 'Next Terminal 开源堡垒机 — 统一接入与运维审计 | JumpServer替代'}],
                [
                    'meta',
                    {
                        property: 'og:description',
                        content: 'Next Terminal 是一款轻量开源堡垒机与运维审计系统，支持 SSH/RDP/VNC/Telnet/Web 统一接入、会话录像与审计，适合中小团队私有化部署。'
                    }
                ]
            ],
            themeConfig: {
                lastUpdated: {
                    text: '最后更新'
                },
                editLink: {
                    pattern: 'https://github.com/dushixiang/next-terminal-document/edit/main/:path',
                    text: '在 GitHub 上编辑此页'
                },
                outline: {
                    level: [2, 3],
                    label: '页面导航'
                },
                nav: zhNav,
                sidebar: zhSidebar,
                socialLinks: [{icon: 'github', link: 'https://github.com/dushixiang/next-terminal'}]
            }
        }
    }
})
