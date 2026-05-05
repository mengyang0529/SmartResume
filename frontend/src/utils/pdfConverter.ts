/**
 * Converts a PDF file to a single stitched PNG image (data URL).
 * Uses dynamic import for pdfjs-dist to avoid top-level side effects.
 */
export async function convertPdfToImage(file: File): Promise<string> {
  // Dynamic import for pdfjs
  const pdfjs = await import('pdfjs-dist');

  // Use Vite's ?url import to get the correct path to the worker
  const pdfWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker.default;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const pageImages: HTMLCanvasElement[] = [];
  let totalHeight = 0;
  let maxWidth = 0;

  // 1. Render each page to its own canvas
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = viewport.width;
    tempCanvas.height = viewport.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) continue;

    // Fill white for the page
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    await page.render({
      canvasContext: tempCtx,
      viewport: viewport,
      canvas: tempCanvas,
    }).promise;

    pageImages.push(tempCanvas);
    totalHeight += viewport.height;
    maxWidth = Math.max(maxWidth, viewport.width);
  }

  // 2. Stitch them together on a final canvas
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = maxWidth;
  finalCanvas.height = totalHeight;
  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) throw new Error('Could not create final canvas context');

  // Fill entire background white
  finalCtx.fillStyle = '#ffffff';
  finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  let currentY = 0;
  for (const canvas of pageImages) {
    // Center horizontally
    const x = (maxWidth - canvas.width) / 2;
    finalCtx.drawImage(canvas, x, currentY);
    currentY += canvas.height;
  }

  return finalCanvas.toDataURL('image/png');
}
