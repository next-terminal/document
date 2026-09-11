// 更新日志页运行时逻辑：逐条移植自原 Astro 站 website/src/lib/changelog.ts。
import {marked} from 'marked'

/** 过滤掉没有版本号的记录，并按发布时间倒序排列。 */
export function normalizeVersions(data) {
    if (!Array.isArray(data)) {
        return []
    }
    return data
        .filter((item) => {
            const candidate = item
            return typeof candidate?.version === 'string' && candidate.version.trim() !== ''
        })
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}

/** 客户端增量刷新的比较依据：版本号或更新时间有变化才重渲染。 */
export function versionsSignature(versions) {
    return versions.map((item) => `${item.version}:${item.updatedAt ?? item.createdAt ?? 0}`).join('|')
}

/** 版本号作为锚点（#v3.7.2），与旧门户保持一致。 */
export function versionAnchor(version) {
    const trimmed = version.trim()
    return trimmed.toLowerCase().startsWith('v') ? trimmed : `v${trimmed}`
}

function escapeHTML(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function formatDate(timestamp) {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
        return ''
    }
    const pad = (value) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * 渲染版本列表 HTML，构建时预渲染与客户端增量刷新共用同一实现。
 * 正文里的 # / ## 标题降级为 h3，避免与版本号 h2 冲突。
 */
export function renderVersionsHTML(versions) {
    return versions
        .map((item) => {
            const content = String(marked.parse(item.content ?? '', {async: false}))
                .replace(/<(\/?)h1>/g, '<$1h3>')
                .replace(/<(\/?)h2>/g, '<$1h3>')
            const date = item.createdAt ? formatDate(item.createdAt) : ''
            return `<article class="changelog-item" id="${escapeHTML(versionAnchor(item.version))}">
<header class="changelog-item-head"><h2><a href="#${escapeHTML(versionAnchor(item.version))}">${escapeHTML(item.version.trim())}</a></h2>${
                date ? `<time datetime="${date}">${date}</time>` : ''
            }</header>
<div class="changelog-body">${content}</div>
</article>`
        })
        .join('')
}
