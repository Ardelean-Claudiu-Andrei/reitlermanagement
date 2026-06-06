"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Download, FileQuestion, FileText } from "lucide-react"
import type { UploadedFile } from "@/lib/types"
import { getUploadFileUrl } from "@/lib/api"
import { DxfPreview } from "@/components/file-preview/dxf-preview"

const CATEGORY_LABELS: Record<string, string> = {
  dxf: "DXF",
  dpd: "DPD",
  pdf: "PDF",
  welding_drawing: "Desen sudură",
  bending_drawing: "Desen îndoire",
}

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif"])
const DXF_EXTS = new Set(["dxf"])
const DPD_EXTS = new Set(["dpd"])

function getExt(filename: string): string {
  const parts = filename.split(".")
  if (parts.length < 2) return ""
  return parts.pop()!.toLowerCase()
}

function detectType(file: UploadedFile): "image" | "pdf" | "dxf" | "dpd" | "unknown" {
  const ext = getExt(file.originalFilename)

  if (IMAGE_EXTS.has(ext)) return "image"
  if (ext === "pdf") return "pdf"
  if (DXF_EXTS.has(ext)) return "dxf"
  if (DPD_EXTS.has(ext)) return "dpd"

  // Fallback to MIME type when extension is ambiguous
  const mime = file.contentType?.toLowerCase() ?? ""
  if (mime.startsWith("image/")) return "image"
  if (mime === "application/pdf") return "pdf"

  return "unknown"
}

export function FilePreviewModal({
  file,
  onClose,
}: {
  file: UploadedFile | null
  onClose: () => void
}) {
  if (!file) return null

  const url = getUploadFileUrl(file.url)
  const type = detectType(file)
  const isWide = type === "image" || type === "pdf" || type === "dxf"

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className={isWide ? "max-w-4xl" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="shrink-0">
              {CATEGORY_LABELS[file.fileCategory] ?? file.fileCategory}
            </Badge>
            <span className="truncate text-sm font-normal text-muted-foreground">
              {file.originalFilename}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* ── Image ── */}
        {type === "image" && (
          <div className="flex items-center justify-center max-h-[70vh] overflow-auto rounded border bg-muted/20 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={file.originalFilename}
              className="max-w-full max-h-[65vh] rounded object-contain"
            />
          </div>
        )}

        {/* ── PDF inline ── */}
        {type === "pdf" && (
          <div className="h-[70vh]">
            <iframe
              src={url}
              className="h-full w-full rounded border"
              title={file.originalFilename}
            />
          </div>
        )}

        {/* ── DXF viewer ── */}
        {type === "dxf" && (
          <DxfPreview fileUrl={url} />
        )}

        {/* ── DPD fallback ── */}
        {type === "dpd" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
            <FileText className="h-12 w-12 text-purple-400" />
            <Badge className="bg-purple-100 text-purple-800">DPD</Badge>
            <p className="text-sm">
              Previzualizarea fișierelor DPD nu este disponibilă.
              <br />
              Folosiți butonul de mai jos pentru a deschide fișierul.
            </p>
          </div>
        )}

        {/* ── Unknown fallback ── */}
        {type === "unknown" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
            <FileQuestion className="h-12 w-12" />
            <p className="text-sm">
              Previzualizarea acestui tip de fișier nu este disponibilă încă.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <a href={url} target="_blank" rel="noreferrer">
            <Button type="button" variant="outline" size="sm">
              <ExternalLink className="mr-1 h-3 w-3" />
              Deschide
            </Button>
          </a>
          <a href={url} download={file.originalFilename}>
            <Button type="button" variant="outline" size="sm">
              <Download className="mr-1 h-3 w-3" />
              Descarcă
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
