import { $typst, TypstSnippet } from '@myriaddreamin/typst.ts/contrib/snippet'
import localforage from 'localforage'

let initialized = false
let currentPhotoPath: string | null = null

async function ensureInitialized() {
  if (initialized) return

  $typst.use(
    TypstSnippet.disableDefaultFontAssets(),
    TypstSnippet.preloadFontAssets({ assets: ['text', 'cjk'] }),
    TypstSnippet.preloadFontFromUrl('https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'),
    TypstSnippet.preloadFontFromUrl('https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Bold.otf'),
    TypstSnippet.preloadFontFromUrl('https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf'),
    TypstSnippet.preloadFontFromUrl('https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/webfonts/fa-solid-900.ttf'),
    TypstSnippet.preloadFontFromUrl('https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/webfonts/fa-brands-400.ttf'),
    await TypstSnippet.fetchPackageRegistry(),
  )

  $typst.setCompilerInitOptions({
    getModule: () => '/typst/typst_ts_web_compiler_bg.wasm',
  })

  await $typst.getCompiler()

  // Always fetch fresh template files to pick up edits
  const classicResp = await fetch('/templates/awesome-cv/awesome-cv-classic.typ')
  const classicText = await classicResp.text()
  await $typst.addSource('/awesome-cv-classic.typ', classicText)

  const modernResp = await fetch('/templates/awesome-cv/awesome-cv-modern.typ')
  const modernText = await modernResp.text()
  await $typst.addSource('/awesome-cv-modern.typ', modernText)

  const artResp = await fetch('/templates/awesome-cv/awesome-cv-art.typ')
  const artText = await artResp.text()
  await $typst.addSource('/awesome-cv-art.typ', artText)

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
        self.postMessage({ type: 'compile_done', compileId: payload.compileId, pdfBytes }, { transfer: pdfBytes ? [pdfBytes.buffer] : undefined } as any)
      } catch (err: any) {
        self.postMessage({ type: 'compile_error', compileId: payload.compileId, error: err.message ?? String(err) })
      }
      break
    }

    case 'set_source': {
      await $typst.addSource('/main.typ', payload.source)
      self.postMessage({ type: 'source_set' })
      break
    }

    case 'set_photo': {
      // Extract MIME type and base64 data from data URL
      // e.g. "data:image/png;base64,iVBOR..."
      const match = payload.dataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
      if (!match) {
        self.postMessage({ type: 'photo_error', error: 'Invalid image data URL' })
        break
      }
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
      const base64 = match[2]
      const binaryStr = atob(base64)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      // Remove previous photo mapping if any
      if (currentPhotoPath) {
        $typst.unmapShadow(currentPhotoPath)
      }
      currentPhotoPath = `/photo.${ext}`
      $typst.mapShadow(currentPhotoPath, bytes)
      self.postMessage({ type: 'photo_set' })
      break
    }

    case 'remove_photo': {
      if (currentPhotoPath) {
        $typst.unmapShadow(currentPhotoPath)
        currentPhotoPath = null
      }
      self.postMessage({ type: 'photo_removed' })
      break
    }

    case 'reset': {
      initialized = false
      self.postMessage({ type: 'reset_done' })
      break
    }
  }
}
