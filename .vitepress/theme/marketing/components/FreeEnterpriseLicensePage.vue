// 免费企业版授权页组件：逐字移植原 Astro 站 website/src/components/pages/FreeEnterpriseLicensePage.astro。
// 原组件在构建期通过 getDict(locale).freeEnterpriseLicense 取文案，这里改为由 content prop 传入对应段落。
// 站内链接由 Astro 的 licenseUrl('/request-quote') 改为 SITE.licensePortal（同一 URL）。
<script setup>
import {SITE} from '../config/site.js';

const props = defineProps({
    content: {type: Object, required: true},
    locale: {type: String, default: 'en'},
});

const content = props.content.freeEnterpriseLicense;
const requestQuoteUrl = `${SITE.licensePortal}/request-quote`;
</script>

<template>
    <section class="page-head tight">
        <div class="wrap license-page-wrap">
            <h1>{{ content.title }}</h1>
            <p class="lead">{{ content.lead }}</p>
        </div>
    </section>

    <section class="section license-page-section">
        <div class="wrap license-page-wrap">
            <div class="license-requirements">
                <section class="license-requirement-block" aria-labelledby="license-eligibility-title">
                    <h2 id="license-eligibility-title">{{ content.eligibilityLabel }}</h2>
                    <p>{{ content.eligibility }}</p>
                </section>

                <section class="license-requirement-block" aria-labelledby="license-notes-title">
                    <h2 id="license-notes-title">{{ content.notesLabel }}</h2>
                    <ol class="license-rules">
                        <li v-for="note in content.notes" :key="note">{{ note }}</li>
                    </ol>
                </section>

                <div class="license-apply-action">
                    <a
                        class="btn primary"
                        :href="requestQuoteUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {{ content.cta }}
                    </a>
                    <p>{{ content.loginNote }}</p>
                </div>
            </div>
        </div>
    </section>
</template>
