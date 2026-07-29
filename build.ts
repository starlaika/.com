import { cp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { minify } from 'html-minifier-next'
import createVento from 'ventojs'

const vento = createVento({ includes: join(import.meta.dirname, 'views') })

const buildDate = (function getBuildDate() {
  const now = new Date().toISOString()
  return now.slice(0, now.indexOf('T'))
})()

await rm('dist', { recursive: true, force: true })
await cp('public', 'dist', { recursive: true, preserveTimestamps: true })

await writeFile('dist/index.html', await buildHtml('index.vto'))
await writeFile('dist/404.html', await buildHtml('404.vto'))

async function buildHtml(file: string) {
  const { content } = await vento.run(file, {
    SITE: 'https://starlaika.github.io',
    BUILD_DATE: buildDate,
  })

  const minified = await minify(content, {
    collapseAttributeWhitespace: true,
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    removeDefaultTypeAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    minifyCSS: {
      targets: {
        chrome: 144,
      },
    },
    minifyJS: {
      engine: 'terser',
      ecma: 2023,
    },
  })

  return minified.replaceAll('</style><style>', '')
}
