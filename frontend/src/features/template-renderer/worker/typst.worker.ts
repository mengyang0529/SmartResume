import { $typst, TypstSnippet } from '@myriaddreamin/typst.ts/contrib/snippet';
import { RESUME_TEMPLATES } from '@data/templates';

let initializationPromise: Promise<void> | null = null;
let currentPhotoPath: string | null = null;
const loadedTemplates = new Set<number>();

async function ensureInitialized() {
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    $typst.use(
      TypstSnippet.disableDefaultFontAssets(),
      TypstSnippet.preloadFontAssets({ assets: ['text', 'cjk'] }),
      TypstSnippet.preloadFontFromUrl(
        'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'
      ),
      TypstSnippet.preloadFontFromUrl(
        'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Bold.otf'
      ),
      TypstSnippet.preloadFontFromUrl(
        'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf'
      ),
      TypstSnippet.preloadFontFromUrl(
        'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf'
      ),
      TypstSnippet.preloadFontFromUrl(
        'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/webfonts/fa-solid-900.ttf'
      ),
      TypstSnippet.preloadFontFromUrl(
        'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.6.0/webfonts/fa-brands-400.ttf'
      ),
      await TypstSnippet.fetchPackageRegistry()
    );

    $typst.setCompilerInitOptions({
      getModule: () => '/typst/typst_ts_web_compiler_bg.wasm',
    });

    await $typst.getCompiler();
  })();

  return initializationPromise;
}

async function loadTemplate(templateId: number) {
  if (loadedTemplates.has(templateId)) return;

  const template = RESUME_TEMPLATES.find(t => t.id === templateId);
  if (!template) return;

  const cacheBuster = `?t=${Date.now()}`;

  // 1. Load primary typst files
  for (const fileName of template.typstFiles) {
    const resp = await fetch(`${template.basePath}${fileName}${cacheBuster}`);
    const text = await resp.text();
    await $typst.addSource(`/${fileName}`, text);
  }

  // 2. Load extra assets (e.g. lang.toml)
  if (template.extraAssets) {
    for (const assetName of template.extraAssets) {
      const resp = await fetch(`${template.basePath}${assetName}${cacheBuster}`);
      const text = await resp.text();
      await $typst.addSource(`/${assetName}`, text);
    }
  }

  loadedTemplates.add(templateId);
}

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'init': {
      try {
        await ensureInitialized();
        self.postMessage({ type: 'init_done' });
      } catch (err: any) {
        self.postMessage({ type: 'init_error', error: err.message ?? String(err) });
      }
      break;
    }

    case 'compile': {
      try {
        await ensureInitialized();
        if (payload.templateId) await loadTemplate(payload.templateId);
        const pdfBytes = await $typst.pdf!({ mainFilePath: '/main.typ' });
        self.postMessage({ type: 'compile_done', compileId: payload.compileId, pdfBytes }, {
          transfer: pdfBytes ? [pdfBytes.buffer] : undefined,
        } as any);
      } catch (err: any) {
        self.postMessage({
          type: 'compile_error',
          compileId: payload.compileId,
          error: err.message ?? String(err),
        });
      }
      break;
    }

    case 'set_source': {
      await $typst.addSource('/main.typ', payload.source);
      self.postMessage({ type: 'source_set' });
      break;
    }

    case 'set_photo': {
      const match = payload.dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) {
        self.postMessage({ type: 'photo_error', error: 'Invalid image data URL' });
        break;
      }
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const base64 = match[2];
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      if (currentPhotoPath) {
        $typst.unmapShadow(currentPhotoPath);
      }
      currentPhotoPath = `/photo.${ext}`;
      $typst.mapShadow(currentPhotoPath, bytes);
      self.postMessage({ type: 'photo_set' });
      break;
    }

    case 'remove_photo': {
      if (currentPhotoPath) {
        $typst.unmapShadow(currentPhotoPath);
        currentPhotoPath = null;
      }
      self.postMessage({ type: 'photo_removed' });
      break;
    }

    case 'reset': {
      initializationPromise = null;
      loadedTemplates.clear();
      self.postMessage({ type: 'reset_done' });
      break;
    }
  }
};
