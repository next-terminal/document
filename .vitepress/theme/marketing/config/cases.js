// English / Chinese case page content: copied verbatim from the Astro site's
// website/src/i18n/en.ts and website/src/i18n/zh.ts (cases section), plus the
// supplementary label (empty: '-') carried by website/src/components/pages/CasesPage.astro.
export const casesContent = {
    en: {
        meta: {
            title: 'Customer Cases | Open Source Bastion Host Next Terminal',
            description: 'See how teams use Next Terminal open source bastion host for unified remote access, access control and operations audit — a JumpServer/Teleport alternative.',
        },
        cases: {
            title: 'Customer Cases',
            lead: 'See how different teams use Next Terminal for unified remote access, auditing, and permission management.',
            company: 'Company',
            useCase: 'Use Case',
            favoriteFeature: 'Favorite Feature',
            submitted: 'Submitted',
            loading: 'Loading cases...',
            loadFailed: 'Failed to load case data. Please try again later.',
            retry: 'Retry',
            none: 'No Cases Yet',
            noneDesc: 'There are no public customer cases yet.',
            empty: '-',
        },
    },
    zh: {
        meta: {
            title: '客户案例｜开源堡垒机 Next Terminal',
            description: '了解团队如何用 Next Terminal 开源堡垒机统一远程访问、权限控制与运维审计，替代 JumpServer/Teleport 的真实案例。',
        },
        cases: {
            title: '客户案例',
            lead: '了解不同团队如何使用 Next Terminal 统一远程访问、审计与权限管理。',
            company: '公司',
            useCase: '使用场景',
            favoriteFeature: '最喜欢的功能',
            submitted: '提交时间',
            loading: '正在加载案例...',
            loadFailed: '获取案例数据失败，请稍后重试',
            retry: '重试',
            none: '暂无案例',
            noneDesc: '目前还没有公开的客户案例',
            empty: '-',
        },
    },
}
