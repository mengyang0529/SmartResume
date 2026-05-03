---
name: update-resume-template
description: Updates template preview images for the resume application. Use when the user asks to regenerate template previews, update template preview images, or refresh the template gallery.
version: 1.0.0
---

# Update Resume Template Previews

Regenerate all template preview images at `public/template-previews/*.webp` from the actual Typst templates.

## Requirements

- **typst CLI**: [https://github.com/typst/typst](https://github.com/typst/typst)
- **ImageMagick**: `magick` command for WebP conversion

## Usage

```bash
cd frontend
node scripts/generate-template-previews.mjs
```

## What It Does

The script reads sample data from `src/data/sample-*.md` (YAML frontmatter for personal info, markdown body for sections), generates Typst source files, compiles them to PNG via `typst compile`, and converts to 900×1125 WebP images with ImageMagick.

### Templates Generated

| Preview | Source Data |
|---------|-------------|
| classic.webp | sample-resume.md → awesome-cv-classic.typ |
| modern.webp | sample-resume.md → awesome-cv-modern.typ |
| art.webp | sample-resume.md → awesome-cv-art.typ |
| rirekisho.webp | sample-rirekisho.md → rirekisho/rirekisho.typ |
| shokumukeirekisho.webp | sample-shokumukeirekisho.md → shokumukeirekisho/shokumukeirekisho.typ |

## After Changes

After regenerating previews, commit the updated `.webp` files if the changes are intended.
