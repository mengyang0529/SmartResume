import { $typst, TypstSnippet } from '@myriaddreamin/typst.ts/contrib/snippet'
import localforage from 'localforage'

let initialized = false

const TEMPLATE_CACHE_VERSION = 2
const CACHE_KEY_TEMPLATE = `cached_template_awesome_cv_v${TEMPLATE_CACHE_VERSION}`
const CACHE_KEY_LANG = `cached_template_lang_v${TEMPLATE_CACHE_VERSION}`

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

  const cachedTemplate = await localforage.getItem<string>(CACHE_KEY_TEMPLATE)
  if (cachedTemplate) {
    await $typst.addSource('/awesome-cv.typ', cachedTemplate)
  } else {
    const resp = await fetch('/templates/awesome-cv/awesome-cv.typ')
    const text = await resp.text()
    await localforage.setItem(CACHE_KEY_TEMPLATE, text)
    await $typst.addSource('/awesome-cv.typ', text)
  }

  const cachedLang = await localforage.getItem<string>(CACHE_KEY_LANG)
  if (cachedLang) {
    await $typst.addSource('/lang.toml', cachedLang)
  } else {
    const resp = await fetch('/templates/awesome-cv/lang.toml')
    const text = await resp.text()
    await localforage.setItem(CACHE_KEY_LANG, text)
    await $typst.addSource('/lang.toml', text)
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
