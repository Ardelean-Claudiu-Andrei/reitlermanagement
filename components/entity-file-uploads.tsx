"use client"

import { useRef, useState, useEffect } from "react"
import { Upload, X, Info, ExternalLink, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { uploadsApi, getUploadFileUrl } from "@/lib/api"
import type { FileCategory, UploadedFile } from "@/lib/types"
import { toast } from "sonner"
import { FilePreviewModal } from "@/components/file-preview-modal"

const CATEGORY_LABELS: Record<FileCategory, string> = {
  dxf: "DXF",
  dpd: "DPD",
  pdf: "PDF",
  welding_drawing: "Desen sudură",
  bending_drawing: "Desen îndoire",
}

function detectFileCategory(file: File): "dxf" | "dpd" | "pdf" | null {
  const ext = file.name.split(".").pop()?.toLowerCase()
  if (ext === "dxf") return "dxf"
  if (ext === "dpd") return "dpd"
  if (ext === "pdf") return "pdf"
  return null
}

interface EntityFileUploadsProps {
  entityType: "assembly" | "part" | "product"
  entityId?: string
  disabledMessage?: string
  readonly?: boolean
  showDrawingUploads?: boolean
}

export function EntityFileUploads({
  entityType,
  entityId,
  disabledMessage,
  readonly = false,
  showDrawingUploads = false,
}: EntityFileUploadsProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploadingCategory, setUploadingCategory] = useState<FileCategory | null>(null)
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const generalInputRef = useRef<HTMLInputElement>(null)
  const weldingInputRef = useRef<HTMLInputElement>(null)
  const bendingInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!entityId) { setFiles([]); return }
    uploadsApi.list(entityType, entityId).then(setFiles).catch(() => {})
  }, [entityType, entityId])

  const generalFiles = files.filter((f) =>
    f.fileCategory === "dxf" || f.fileCategory === "dpd" || f.fileCategory === "pdf"
  )
  const weldingFiles = files.filter((f) => f.fileCategory === "welding_drawing")
  const bendingFiles = files.filter((f) => f.fileCategory === "bending_drawing")

  if (!entityId) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        <Info className="h-4 w-4 shrink-0" />
        {disabledMessage ?? "Salvează entitatea înainte de a încărca fișiere."}
      </div>
    )
  }

  async function handleUpload(category: FileCategory, file: File) {
    setUploadingCategory(category)
    try {
      const uploaded = await uploadsApi.upload(entityType, entityId!, category, file)
      setFiles((prev) => [...prev, uploaded])
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la încărcare")
    } finally {
      setUploadingCategory(null)
    }
  }

  async function handleDelete(fileId: string) {
    try {
      await uploadsApi.delete(fileId)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch {
      toast.error("Eroare la ștergere")
    }
  }

  function handleGeneralInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    const cat = detectFileCategory(file)
    if (!cat) {
      toast.error("Tip de fișier neacceptat. Sunt permise doar DXF, DPD sau PDF.")
      return
    }
    handleUpload(cat, file)
  }

  function handleDrawingInput(category: "welding_drawing" | "bending_drawing") {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ""
      if (!file) return
      handleUpload(category, file)
    }
  }

  // ─── Readonly view ─────────────────────────────────────────────────────────
  if (readonly) {
    return <ReadonlyFileList files={files} />
  }

  // ─── Edit view ─────────────────────────────────────────────────────────────
  const isGeneralUploading = uploadingCategory === "dxf" || uploadingCategory === "dpd" || uploadingCategory === "pdf"

  return (
    <>
      <div className="space-y-4">
        {/* General files: DXF / DPD / PDF */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">DXF, DPD, PDF — detectate automat după extensie</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isGeneralUploading}
              onClick={() => generalInputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              {isGeneralUploading ? "Se încarcă..." : "Încarcă fișier"}
            </Button>
          </div>

          {generalFiles.length === 0 ? (
            <p className="text-xs text-muted-foreground">Niciun fișier.</p>
          ) : (
            <div className="divide-y rounded-md border">
              {generalFiles.map((f) => (
                <div key={f.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {CATEGORY_LABELS[f.fileCategory]}
                    </Badge>
                    <span className="truncate">{f.originalFilename}</span>
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Previzualizare"
                      onClick={() => setPreviewFile(f)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <a href={getUploadFileUrl(f.url)} target="_blank" rel="noreferrer">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Deschide">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDelete(f.id)}
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <input
            ref={generalInputRef}
            type="file"
            accept=".dxf,.dpd,.pdf"
            className="hidden"
            onChange={handleGeneralInput}
          />
        </div>

        {/* Drawing files — parts only */}
        {showDrawingUploads && (
          <>
            <DrawingSection
              label="Desen sudură"
              files={weldingFiles}
              uploading={uploadingCategory === "welding_drawing"}
              inputRef={weldingInputRef}
              onDelete={handleDelete}
              onPreview={setPreviewFile}
            />
            <DrawingSection
              label="Desen îndoire"
              files={bendingFiles}
              uploading={uploadingCategory === "bending_drawing"}
              inputRef={bendingInputRef}
              onDelete={handleDelete}
              onPreview={setPreviewFile}
            />
            <input
              ref={weldingInputRef}
              type="file"
              className="hidden"
              onChange={handleDrawingInput("welding_drawing")}
            />
            <input
              ref={bendingInputRef}
              type="file"
              className="hidden"
              onChange={handleDrawingInput("bending_drawing")}
            />
          </>
        )}
      </div>

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </>
  )
}

function DrawingSection({
  label,
  files,
  uploading,
  inputRef,
  onDelete,
  onPreview,
}: {
  label: string
  files: UploadedFile[]
  uploading: boolean
  inputRef: React.RefObject<HTMLInputElement>
  onDelete: (id: string) => void
  onPreview: (file: UploadedFile) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-1 h-3 w-3" />
          {uploading ? "Se încarcă..." : files.length > 0 ? "Înlocuiește" : "Încarcă"}
        </Button>
      </div>
      {files.length === 0 ? (
        <p className="text-xs text-muted-foreground">Niciun fișier.</p>
      ) : (
        <div className="divide-y rounded-md border">
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="truncate">{f.originalFilename}</span>
              <div className="ml-2 flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Previzualizare"
                  onClick={() => onPreview(f)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <a href={getUploadFileUrl(f.url)} target="_blank" rel="noreferrer">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Deschide">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDelete(f.id)}
                >
                  <X className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Standalone readonly file list (used in detail modals) ───────────────────

export function ReadonlyFileList({ files }: { files: UploadedFile[] }) {
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)

  if (files.length === 0) {
    return <p className="text-sm text-muted-foreground">Niciun fișier atașat.</p>
  }

  return (
    <>
      <div className="divide-y rounded-md border">
        {files.map((f) => {
          const url = getUploadFileUrl(f.url)
          return (
            <div key={f.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="outline" className="shrink-0 text-xs">
                  {CATEGORY_LABELS[f.fileCategory] ?? f.fileCategory}
                </Badge>
                <span className="truncate text-muted-foreground">{f.originalFilename}</span>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Previzualizare"
                  onClick={() => setPreviewFile(f)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <a href={url} target="_blank" rel="noreferrer">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Deschide">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
                <a href={url} download={f.originalFilename}>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Descarcă">
                    <Download className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            </div>
          )
        })}
      </div>
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </>
  )
}
