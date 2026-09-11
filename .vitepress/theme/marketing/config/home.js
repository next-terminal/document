// 营销首页内容：文案逐字取自原 Astro 站 website/src/i18n/en.ts 与 zh.ts（home 段 + meta.home）。
// 与 pricing 页一致的组织方式：每语言一个对象，HomePage.vue 只消费 content.home。
export const homeContent = {
    en: {
        meta: {
            home: {
                title: 'Next Terminal Open Source Bastion Host | Lightweight Jump Server & PAM | JumpServer/Teleport Alternative',
                description: 'Next Terminal is an open source bastion host and jump server for teams. Unified SSH/RDP/VNC/SFTP/Telnet/HTTP access, asset authorization, session audit and recording, command interception, and Passkey/TOTP/LDAP/OIDC MFA. Self-hosted JumpServer and Teleport alternative.',
            },
        },
        home: {
            eyebrow: 'Secure access · accountable operations',
            title: 'Open Source Bastion Host — Secure, Controllable, Auditable Remote Access',
            lead: 'Next Terminal is an open source bastion host and lightweight jump server for SMB teams — unified SSH/RDP/VNC/SFTP/Telnet/HTTP access from the browser, with session and command audit and replay. Self-hosted JumpServer/Teleport alternative.',
            deployGuide: 'Read the deployment guide →',
            readDocs: 'Read the docs',
            github: 'Visit GitHub',
            protocolsLabel: 'Supported protocols',
            protocols: ['SSH / SFTP', 'RDP', 'VNC', 'Telnet', 'HTTP', 'Database'],
            previewAlt: 'Next Terminal light interface: assets, sessions, and operations access management',
            proof: [
                {title: 'Unified entry', desc: 'One place to reach servers and intranet apps'},
                {title: 'Fine-grained authorization', desc: 'Permissions by user, group, and asset'},
                {title: 'End-to-end auditing', desc: 'Sessions, commands, and file operations traced'},
                {title: 'Self-hosted', desc: 'Deploy containers on your own infrastructure'},
            ],
            capabilities: {
                heading: 'From bastion host entry to a closed audit loop',
                sub: 'Not just remote protocols in a browser: identity, authorization, connectivity, and auditing connected into one manageable bastion host path.',
                items: [
                    {icon: '01', title: 'Multi-protocol access', desc: 'Reach SSH, RDP, VNC, Telnet, and HTTP assets from the web UI, and manage files over SFTP.'},
                    {icon: '02', title: 'Assets and credentials', desc: 'Maintain assets, credentials, and asset groups centrally instead of scattering keys on personal devices.', linkText: 'Read the asset management docs →'},
                    {icon: '03', title: 'Permissions and policies', desc: 'Authorize by user, group, and asset, and constrain access time, source, and sessions with sign-in policies.'},
                    {icon: '04', title: 'Session audit and replay', desc: 'Record text and graphical sessions with live monitoring and history replay for troubleshooting context.'},
                    {icon: '05', title: 'Risky command interception', desc: 'Configure command rules for SSH sessions to intercept high-risk operations before they run.'},
                    {icon: '06', title: 'Enterprise identity and strong auth', desc: 'Passkey, TOTP, LDAP, and OIDC bring remote access into your existing identity system.', linkText: 'Read the authentication docs →'},
                ],
            },
            steps: {
                heading: 'Set up a unified operations entry in three steps',
                sub: 'Start with a working deployment, then onboard assets, members, and stricter access policies.',
                items: [
                    {title: 'Deploy Next Terminal', desc: 'Follow the system requirements, start the service with Docker Compose, and initialize the administrator.'},
                    {title: 'Register assets and credentials', desc: 'Add servers, desktops, and web assets, then organize asset groups and credentials by purpose.'},
                    {title: 'Grant access and enable auditing', desc: 'Assign asset permissions to members and configure authentication, session, and command policies by risk.'},
                ],
            },
            demo: {
                heading: 'Live Demo',
                sub: 'Try the full workflow of asset onboarding, session auditing, and license management with the demo accounts. No sign-up required.',
                open: 'Open the demo site →',
                accountsLabel: 'Demo accounts',
                adminLabel: 'Admin',
                userLabel: 'User',
                copy: 'Copy',
                copied: 'Copied',
            },
            community: {
                wechat: 'WeChat Group',
                wechatScan: 'Scan to join',
                wechatHint: 'Valid for 7 days (until Sep 2)',
            },
        },
    },
    zh: {
        meta: {
            home: {
                title: 'Next Terminal 开源堡垒机｜轻量跳板机与运维审计 | JumpServer/Teleport 替代',
                description: 'Next Terminal 是面向中小团队的开源堡垒机与跳板机，支持 SSH/RDP/VNC/SFTP/Telnet/HTTP 统一接入、资产授权、会话审计与录像、命令拦截、Passkey/TOTP/LDAP/OIDC 多因素认证，私有化部署，JumpServer 与 Teleport 的轻量替代。',
            },
        },
        home: {
            eyebrow: 'Secure access · accountable operations',
            title: 'Next Terminal 开源堡垒机，让远程访问安全、可控、可审计',
            lead: 'Next Terminal 是面向中小团队的开源堡垒机与轻量跳板机。统一管理服务器与内网应用的访问权限，在浏览器中直连 SSH、RDP、VNC、SFTP、Telnet 和 HTTP，JumpServer 与 Teleport 的轻量替代，私有化部署，会话与命令全程可审计、可回放。',
            deployGuide: '查看部署指南 →',
            readDocs: '阅读使用文档',
            github: '访问 GitHub',
            protocolsLabel: '支持协议',
            protocols: ['SSH / SFTP', 'RDP', 'VNC', 'Telnet', 'HTTP', 'Database'],
            previewAlt: 'Next Terminal 浅色界面：资产、会话与运维访问管理',
            proof: [
                {title: '统一入口', desc: '集中访问服务器与内网应用'},
                {title: '细粒度授权', desc: '按用户、分组与资产配置权限'},
                {title: '全过程审计', desc: '会话、命令和文件操作可追溯'},
                {title: '私有化部署', desc: '用容器部署到自己的基础设施'},
            ],
            capabilities: {
                heading: '从堡垒机访问入口到审计闭环',
                sub: '不是把远程协议简单搬进浏览器，而是把身份、授权、连接和审计连成一条可管理的堡垒机运维路径。',
                items: [
                    {icon: '01', title: '多协议统一访问', desc: '从 Web 界面访问 SSH、RDP、VNC、Telnet 与 HTTP 资产，并使用 SFTP 管理文件。'},
                    {icon: '02', title: '资产与凭证管理', desc: '集中维护资产、凭证和资产分组，避免连接信息与密钥散落在个人设备。', linkText: '查看资产管理文档 →'},
                    {icon: '03', title: '权限与访问策略', desc: '按用户、用户组和资产配置授权，并通过登录策略约束访问时间、来源与会话。'},
                    {icon: '04', title: '会话审计与回放', desc: '记录文本与图形会话，支持实时监控和历史回放，为问题定位提供上下文。'},
                    {icon: '05', title: '危险命令拦截', desc: '为 SSH 会话配置命令规则，在高风险操作执行前进行拦截，降低误操作风险。'},
                    {icon: '06', title: '企业身份与强认证', desc: '支持 Passkey、TOTP、LDAP 与 OIDC，把远程访问纳入团队已有的身份体系。', linkText: '查看认证文档 →'},
                ],
            },
            steps: {
                heading: '三步建立统一运维入口',
                sub: '先完成可用部署，再逐步接入资产、成员和更严格的访问策略。',
                items: [
                    {title: '部署 Next Terminal', desc: '参考系统要求，通过 Docker Compose 启动服务并初始化管理员。'},
                    {title: '录入资产与凭证', desc: '添加服务器、桌面和 Web 资产，按用途建立资产分组与凭证。'},
                    {title: '授权访问并开启审计', desc: '为成员分配资产访问权限，按业务风险配置认证、会话与命令策略。'},
                ],
            },
            demo: {
                heading: '在线演示',
                sub: '无需注册，使用演示账号直接体验资产接入、会话审计与授权管理的完整流程。',
                open: '打开演示站点 →',
                accountsLabel: '演示账号',
                adminLabel: '管理账户',
                userLabel: '普通账户',
                copy: '复制',
                copied: '已复制',
            },
            community: {
                wechat: '微信群',
                wechatScan: '扫码加入',
                wechatHint: '7天内有效（9月2日前）',
            },
        },
    },
};
