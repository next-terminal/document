import {writeSnapshotIfChanged} from './write-snapshot.mjs'
import {pathToFileURL} from 'node:url'
import {normalizeVersions, renderVersionsHTML, versionsSignature} from '../.vitepress/theme/marketing/runtime/changelog.js'

// 构建期预渲染更新日志（对齐原 Astro 站 ChangelogPage.astro 的 SSG 行为）：
// 拉到版本列表就烘进静态 HTML，拉不到就退化为客户端加载，不让构建失败。
const licenseApiBase = process.env.LICENSE_API_BASE ?? 'https://license.next-terminal.com'
const LANGS = {en: 'en-US', zh: 'zh-CN'}
const snapshotPath = new URL('../.vitepress/theme/marketing/config/changelog-snapshot.json', import.meta.url)

async function loadVersions(lang) {
    const response = await fetch(`${licenseApiBase}/api/versions?lang=${lang}`, {signal: AbortSignal.timeout(15000)})
    if (!response.ok) throw new Error(`HTTP ${response.status} for /api/versions?lang=${lang}`)
    return normalizeVersions(await response.json())
}

export async function refreshChangelog() {
    const snapshot = {ok: false, fetchedAt: new Date().toISOString(), en: null, zh: null}
    for (const [locale, lang] of Object.entries(LANGS)) {
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const versions = await loadVersions(lang)
                snapshot[locale] = {
                    signature: versionsSignature(versions),
                    count: versions.length,
                    html: renderVersionsHTML(versions),
                }
                break
            } catch (error) {
                if (attempt === 2) console.warn(`Changelog pre-render skipped for ${locale}: ${error.message}`)
            }
        }
    }
    snapshot.ok = Boolean(snapshot.en || snapshot.zh)
    await writeSnapshotIfChanged(snapshotPath, snapshot)
    const summary = Object.keys(LANGS).map((locale) => (snapshot[locale] ? `${locale}:${snapshot[locale].count}` : `${locale}:skip`))
    console.log(`Changelog snapshot refreshed (${summary.join(' ')})`)
    return snapshot
}

// 允许直接执行：node scripts/refresh-changelog.mjs
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await refreshChangelog()
}
