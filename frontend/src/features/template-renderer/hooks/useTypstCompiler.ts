import { useRef, useEffect, useCallback, useState } from 'react';

export interface UseTypstCompilerOptions {
  debounceMs?: number;
}

export interface UseTypstCompilerReturn {
  pdfBlobUrl: string | null;
  isCompiling: boolean;
  error: string | null;
  compile: (source: string, templateId?: number, compileId?: number) => void;
  setPhoto: (dataUrl: string) => void;
  removePhoto: () => void;
  reset: () => void;
}

export function useTypstCompiler(options: UseTypstCompilerOptions = {}): UseTypstCompilerReturn {
  const { debounceMs = 400 } = options;

  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceRef = useRef<string>('');
  const pendingTemplateIdRef = useRef<number | undefined>(undefined);
  const pendingCompileIdRef = useRef<number | undefined>(undefined);

  // P0-5: 使用 Ref 追踪当前的 PDF Blob URL 以确保在组件卸载时正确释放内存
  const currentPdfUrlRef = useRef<string | null>(null);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workerReady, setWorkerReady] = useState(false);

  // 同步 ref 和 state，确保 cleanup 能拿到最新的 URL
  useEffect(() => {
    currentPdfUrlRef.current = pdfBlobUrl;
  }, [pdfBlobUrl]);

  const triggerDelayedCompile = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (workerRef.current && sourceRef.current) {
        const templateId = pendingTemplateIdRef.current;
        const compileId = pendingCompileIdRef.current;
        pendingTemplateIdRef.current = undefined;
        pendingCompileIdRef.current = undefined;
        setIsCompiling(true);
        workerRef.current.postMessage({
          type: 'compile',
          payload: { templateId, compileId },
        });
      }
    }, debounceMs);
  }, [debounceMs]);

  useEffect(() => {
    const worker = new Worker(new URL('../worker/typst.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const { type, pdfBytes, error: errMsg } = e.data;

      switch (type) {
        case 'init_done':
          setWorkerReady(true);
          setIsCompiling(false);
          break;
        case 'init_error':
          if (errMsg === 'FONT_LOAD_TIMEOUT') {
            setError('Failed to load fonts: network timeout. Please check your connection and refresh the page.');
          } else {
            setError(errMsg);
          }
          setIsCompiling(false);
          setWorkerReady(false);
          break;
        case 'compile_done':
          setIsCompiling(false);
          if (pdfBytes) {
            // P0-5: 显式释放旧的 URL 内存
            if (currentPdfUrlRef.current) {
              URL.revokeObjectURL(currentPdfUrlRef.current);
            }
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const newUrl = URL.createObjectURL(blob);
            setPdfBlobUrl(newUrl);
          }
          setError(null);
          break;
        case 'compile_error':
          setIsCompiling(false);
          setError(errMsg);
          break;
        case 'source_set':
          triggerDelayedCompile();
          break;
        case 'reset_done':
          if (currentPdfUrlRef.current) {
            URL.revokeObjectURL(currentPdfUrlRef.current);
          }
          setPdfBlobUrl(null);
          setError(null);
          setWorkerReady(false);
          break;
      }
    };

    worker.postMessage({ type: 'init' });
    setIsCompiling(true);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // P0-5: 修正原有的 stale closure 问题，使用 ref 释放最新的 URL
      if (currentPdfUrlRef.current) {
        URL.revokeObjectURL(currentPdfUrlRef.current);
      }
      worker.terminate();
      workerRef.current = null;
    };
  }, [triggerDelayedCompile]); // triggerDelayedCompile 依赖已稳定

  const compile = useCallback(
    (source: string, templateId?: number, compileId?: number) => {
      sourceRef.current = source;
      pendingTemplateIdRef.current = templateId;
      pendingCompileIdRef.current = compileId;
      if (workerRef.current && workerReady) {
        workerRef.current.postMessage({
          type: 'set_source',
          payload: { source },
        });
      }
    },
    [workerReady]
  );

  const setPhoto = useCallback((dataUrl: string) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'set_photo',
        payload: { dataUrl },
      });
    }
  }, []);

  const removePhoto = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'remove_photo' });
    }
  }, []);

  // Resend pending source when worker becomes ready
  useEffect(() => {
    if (workerReady && sourceRef.current && workerRef.current) {
      workerRef.current.postMessage({
        type: 'set_source',
        payload: { source: sourceRef.current },
      });
    }
  }, [workerReady]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    sourceRef.current = '';
    if (currentPdfUrlRef.current) {
      URL.revokeObjectURL(currentPdfUrlRef.current);
    }
    setPdfBlobUrl(null);
    setError(null);
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'reset' });
    }
  }, []);

  return { pdfBlobUrl, isCompiling, error, compile, setPhoto, removePhoto, reset };
}
