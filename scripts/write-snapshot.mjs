import {readFile, writeFile} from 'node:fs/promises'

// 只在内容真的变化时落盘：fetchedAt 每次构建都会变，否则本地工作区会被构建搞脏（构建产物 = 仓库文件）。
export async function writeSnapshotIfChanged(path, snapshot) {
    const strip = (value) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const {fetchedAt: _ignored, ...rest} = value
            return rest
        }
        return value
    }
    try {
        const previous = JSON.parse(await readFile(path, 'utf8'))
        if (JSON.stringify(strip(previous)) === JSON.stringify(strip(snapshot))) {
            console.log('Snapshot unchanged, file left as is')
            return false
        }
    } catch {
        // 首次生成或文件损坏：继续写
    }
    await writeFile(path, JSON.stringify(snapshot, null, 2) + '\n')
    return true
}
