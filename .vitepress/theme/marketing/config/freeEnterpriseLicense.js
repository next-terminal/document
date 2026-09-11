// 免费企业版授权页内容：文案逐字取自原 Astro 站
// website/src/i18n/en.ts 与 zh.ts（freeEnterpriseLicense 段 + meta.freeEnterpriseLicense）。
// 与 pricing / cases 页一致的组织方式：每语言一个对象，FreeEnterpriseLicensePage.vue 只消费 content.freeEnterpriseLicense。
export const freeEnterpriseLicenseContent = {
    en: {
        meta: {
            title: 'Free Enterprise License Application | Next Terminal',
            description: 'Review the eligibility requirements, application notes, and review process for the free Next Terminal Enterprise license, then continue to the license service to apply.',
        },
        freeEnterpriseLicense: {
            title: 'Free Enterprise License',
            lead: 'Eligible business users can apply for a six-month unlimited Enterprise license at no cost.',
            eligibilityLabel: 'Eligibility',
            eligibility: 'Accounts registered with a business email (not a public mailbox provider) can apply once for a six-month unlimited Enterprise license at no cost. We verify the match between the email domain and the company online.',
            notesLabel: 'Application notes',
            notes: [
                'Each account can apply only once.',
                'Only business email addresses are accepted. Public mailbox providers and .xyz domains cannot apply.',
                'After approval, your company name may be displayed as a customer case on this website.',
                'The review result is sent by email, usually within 1-3 business days.',
            ],
            cta: 'Continue to the license service →',
            loginNote: 'You must sign in to the license service to apply. The conditions above apply.',
        },
    },
    zh: {
        meta: {
            title: '免费企业版授权申请｜Next Terminal',
            description: '查看 Next Terminal 免费企业版授权的申请条件、申请须知和审核流程，并前往授权服务提交申请。',
        },
        freeEnterpriseLicense: {
            title: '免费企业版授权',
            lead: '符合以下条件的企业用户，可以申请为期六个月的无限制企业版授权许可。',
            eligibilityLabel: '申请条件',
            eligibility: '使用企业邮箱（非公共邮箱）注册的账号，可以免费申请为期六个月的无限制企业版授权许可。我们会通过互联网验证邮箱域名与企业的一致性。',
            notesLabel: '申请须知',
            notes: [
                '每个账号只能申请一次',
                '仅接受企业邮箱，公共邮箱及 .xyz 域名邮箱无法申请',
                '审核通过后，您的公司名称将作为客户案例在官网展示',
                '审核结果将通过邮件通知，一般 1-3 个工作日内处理',
            ],
            cta: '前往授权服务申请 →',
            loginNote: '申请需登录授权系统，申请条件以上述说明为准。',
        },
    },
};
