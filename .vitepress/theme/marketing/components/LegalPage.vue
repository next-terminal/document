// 法律页组件（privacy / terms 共用）：逐字移植原 Astro 站 website/src/components/pages/LegalPage.astro。
// 原组件在构建期通过 getDict(locale).legal 取文案、由 kind 决定渲染隐私政策还是服务条款；
// 合并后不再使用 Astro 专有 props，kind 随 content 传入（content.kind），正文分节规则保持一致。
<script setup>
const props = defineProps({
    content: {type: Object, required: true},
    locale: {type: String, default: 'en'},
});

const dict = props.content.legal;
const kind = props.content.kind;
const title = kind === 'terms' ? dict.termsTitle : dict.privacyTitle;
const body = kind === 'terms' ? dict.termsBody : dict.privacyBody;

// 正文以「1 标题」「1.1 子标题」编号分节，构建时解析为 h2/h3，其余为段落。
const blocks = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
        if (/^\d+(\.\d+)?\s/.test(line) && !/[.。!！?？]$/.test(line)) {
            return {tag: /^\d+\.\d+\s/.test(line) ? 'h3' : 'h2', text: line};
        }
        return {tag: 'p', text: line};
    });
</script>

<template>
    <section class="page-head tight">
        <div class="wrap legal-col">
            <h1>{{ title }}</h1>
        </div>
    </section>

    <section class="section" style="padding-top: 0;">
        <div class="wrap legal-col">
            <template v-for="(block, index) in blocks" :key="index">
                <h2 v-if="block.tag === 'h2'">{{ block.text }}</h2>
                <h3 v-else-if="block.tag === 'h3'">{{ block.text }}</h3>
                <p v-else>{{ block.text }}</p>
            </template>
        </div>
    </section>
</template>
