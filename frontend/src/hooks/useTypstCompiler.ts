import { useRef, useEffect, useCallback, useState } from 'react'

export interface UseTypstCompilerOptions {
  debounceMs?: number
  onCompileResult?: (pdfBytes: ArrayBuffer, compileId?: number) => void
}

export interface UseTypstCompilerReturn {
  pdfBlobUrl: string | null
  isCompiling: boolean
  error: string | null
  compile: (source: string, compileId?: number) => void
  setPhoto: (dataUrl: string) => void
  removePhoto: () => void
  reset: () => void
}

export function useTypstCompiler(
  options: UseTypstCompilerOptions = {},
): UseTypstCompilerReturn {
  const { debounceMs = 400 } = options

  const workerRef = useRef<Worker | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sourceRef = useRef<string>('')
  const pendingCompileIdRef = useRef<number | undefined>(undefined)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workerReady, setWorkerReady] = useState(false)

  useEffect(() => {
    const worker = new Worker(
      new URL('../compiler/compiler.worker.ts', import.meta.url),
      { type: 'module' },
    )
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent) => {
      const { type, pdfBytes, error: errMsg, compileId } = e.data

      switch (type) {
        case 'init_done':
          setWorkerReady(true)
          setIsCompiling(false)
          break
        case 'init_error':
          setError(errMsg)
          setIsCompiling(false)
          setWorkerReady(false)
          break
        case 'compile_done':
          setIsCompiling(false)
          if (pdfBytes) {
            if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl)
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            setPdfBlobUrl(URL.createObjectURL(blob))
            options.onCompileResult?.(pdfBytes, compileId)
          }
          setError(null)
          break
        case 'compile_error':
          setIsCompiling(false)
          setError(errMsg)
          break
        case 'source_set':
          triggerDelayedCompile()
          break
        case 'reset_done':
          setPdfBlobUrl(null)
          setError(null)
          setWorkerReady(false)
          break
      }
    }

    worker.postMessage({ type: 'init' })
    setIsCompiling(true)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl)
      worker.terminate()
    }
  }, [])

  const triggerDelayedCompile = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (workerRef.current && sourceRef.current) {
        const compileId = pendingCompileIdRef.current
        pendingCompileIdRef.current = undefined
        setIsCompiling(true)
        workerRef.current.postMessage({
          type: 'compile',
          payload: { compileId },
        })
      }
    }, debounceMs)
  }, [debounceMs])

  const compile = useCallback((source: string, compileId?: number) => {
    sourceRef.current = source
    pendingCompileIdRef.current = compileId
    if (workerRef.current && workerReady) {
      workerRef.current.postMessage({
        type: 'set_source',
        payload: { source },
      })
    }
  }, [workerReady])

  const setPhoto = useCallback((dataUrl: string) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'set_photo',
        payload: { dataUrl },
      })
    }
  }, [])

  const removePhoto = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'remove_photo' })
    }
  }, [])

  // Resend pending source when worker becomes ready
  useEffect(() => {
    if (workerReady && sourceRef.current && workerRef.current) {
      workerRef.current.postMessage({
        type: 'set_source',
        payload: { source: sourceRef.current },
      })
    }
  }, [workerReady])

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    sourceRef.current = ''
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl)
    setPdfBlobUrl(null)
    setError(null)
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'reset' })
    }
  }, [pdfBlobUrl])

  return { pdfBlobUrl, isCompiling, error, compile, setPhoto, removePhoto, reset }
}
