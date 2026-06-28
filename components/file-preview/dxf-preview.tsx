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

        // clearColor must be a THREE.Color instance — dxf-viewer calls
        // .getHex() on it internally.  An opaque light background gives
        // colorCorrection and blackWhiteInversion a known reference so they
        // can remap white / near-white entities to dark ink.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        viewer = new (DxfViewer as any)(containerRef.current, {
          autoResize: true,
          canvasAlpha: false,
          clearColor: new Color(0xfafafa),
          clearAlpha: 1,
          colorCorrection: true,
          blackWhiteInversion: true,
          antialias: true,
        })

        // Pre-check: dxf-viewer's internal fetcher does not check response.ok,
        // so a 404 gets parsed as an "Empty file" DXF — completely misleading.
        // Validate the URL ourselves first so we can surface a real error.
        const probe = await fetch(fileUrl, { method: "HEAD" })
        if (!probe.ok) {
          throw new Error(
            probe.status === 404
              ? "Fișierul nu a fost găsit pe server (404). Reîncărcați fișierul."
              : `Eroare la accesarea fișierului (HTTP ${probe.status}).`
          )
        }

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
    <div className="relative w-full rounded border" style={{ height: "65vh", background: "#fafafa" }}>
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
