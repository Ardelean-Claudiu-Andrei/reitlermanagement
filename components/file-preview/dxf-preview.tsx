"use client"

import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

interface DxfPreviewProps {
  fileUrl: string
}

export function DxfPreview({ fileUrl }: DxfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!containerRef.current) return

    let viewer: { Destroy?: (noWait?: boolean) => void; Subscribe?: (event: string, handler: (e: CustomEvent) => void) => void } | null = null
    let mounted = true

    ;(async () => {
      try {
        const [{ DxfViewer }, { Color }] = await Promise.all([
          import("dxf-viewer"),
          import("three"),
        ])

        if (!mounted || !containerRef.current) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        viewer = new (DxfViewer as any)(containerRef.current, {
          autoResize: true,
          clearColor: new Color("#fafafa"),
          clearAlpha: 1,
          colorCorrection: true,
          blackWhiteInversion: true,
          antialias: true,
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (viewer as any).Load({ url: fileUrl, fonts: null })

        if (!mounted) return
        setStatus("ready")
      } catch (e: unknown) {
        if (!mounted) return
        if (viewer) {
          try { viewer.Destroy?.(true) } catch { /* ignore */ }
          viewer = null
        }
        const msg = e instanceof Error ? e.message : String(e)
        setErrorMsg(msg)
        setStatus("error")
      }
    })()

    return () => {
      mounted = false
      if (viewer) {
        try { viewer.Destroy?.(true) } catch { /* ignore */ }
      }
    }
  }, [fileUrl])

  return (
    <div className="relative w-full rounded border bg-neutral-50" style={{ height: "65vh" }}>
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Se încarcă DXF...</span>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <p className="text-sm font-medium">Nu s-a putut previzualiza fișierul DXF.</p>
          {errorMsg && (
            <p className="max-w-xs truncate text-xs text-muted-foreground">{errorMsg}</p>
          )}
        </div>
      )}

      {/* Viewer canvas attaches here — always in DOM so viewer can measure dimensions */}
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ visibility: status === "error" ? "hidden" : "visible" }}
      />
    </div>
  )
}
