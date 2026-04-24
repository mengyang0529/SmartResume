import { $typst, TypstSnippet } from '@myriaddreamin/typst.ts/contrib/snippet'
import localforage from 'localforage'

let initialized = false

async function ensureInitialized() {
  if (initialized) return

  $typst.use(
    TypstSnippet.disableDefaultFontAssets(),
    TypstSnippet.preloadFontAssets({ assets: ['text', 'cjk'] }),
    await TypstSnippet.fetchPackageRegistry(),
  )

  $typst.setCompilerInitOptions({
    getModule: () => '/typst/typst_ts_web_compiler_bg.wasm',
  })

  await $typst.getCompiler()

  // Always fetch fresh template files to pick up edits to awesome-cv.typ
  const resp = await fetch('/templates/awesome-cv/awesome-cv.typ')
  const text = await resp.text()
  await $typst.addSource('/awesome-cv.typ', text)

  const langResp = await fetch('/templates/awesome-cv/lang.toml')
  const langText = await langResp.text()
  await $typst.addSource('/lang.toml', langText)

  // Clean up any previously cached template data
  const keys = await localforage.keys()
  for (const key of keys) {
    if (key.startsWith('cached_template_')) {
      await localforage.removeItem(key)
    }
  }

  initialized = true
}

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data

  switch (type) {
    case 'init': {
      try {
        await ensureInitialized()
        self.postMessage({ type: 'init_done' })
      } catch (err: any) {
        self.postMessage({ type: 'init_error', error: err.message ?? String(err) })
      }
      break
    }

    case 'compile': {
      try {
        await ensureInitialized()
        const pdfBytes = await $typst.pdf!({ mainFilePath: '/main.typ' })
        self.postMessage({ type: 'compile_done', pdfBytes }, { transfer: pdfBytes ? [pdfBytes.buffer] : undefined } as any)
      } catch (err: any) {
        self.postMessage({ type: 'compile_error', error: err.message ?? String(err) })
      }
      break
    }

    case 'set_source': {
      await $typst.addSource('/main.typ', payload.source)
      self.postMessage({ type: 'source_set' })
      break
    }

    case 'reset': {
      initialized = false
      self.postMessage({ type: 'reset_done' })
      break
    }
  }
}
