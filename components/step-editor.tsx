"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GripVertical, Plus, X } from "lucide-react"
import { stepDefinitionsApi } from "@/lib/api"
import type { AssemblyStep, StepDefinition } from "@/lib/types"

function newStepId() {
  return `step-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

interface StepEditorProps {
  steps: AssemblyStep[]
  onChange: (steps: AssemblyStep[]) => void
}

export function StepEditor({ steps, onChange }: StepEditorProps) {
  const [definitions, setDefinitions] = useState<StepDefinition[]>([])
  // Track which step IDs have explicitly selected "Custom" — distinguishes
  // from freshly-added steps that haven't chosen anything yet.
  const [customModeIds, setCustomModeIds] = useState<Set<string>>(() =>
    new Set(steps.filter((s) => !s.definitionId && s.name).map((s) => s.id))
  )

  useEffect(() => {
    stepDefinitionsApi.list().then(setDefinitions).catch(() => {})
  }, [])

  function addStep() {
    onChange([
      ...steps,
      { id: newStepId(), name: "", description: "", order: steps.length + 1 },
    ])
  }

  function removeStep(index: number) {
    const stepId = steps[index].id
    setCustomModeIds((prev) => {
      const next = new Set(prev)
      next.delete(stepId)
      return next
    })
    onChange(
      steps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i + 1 }))
    )
  }

  function patch(index: number, fields: Partial<AssemblyStep>) {
    onChange(steps.map((s, i) => (i === index ? { ...s, ...fields } : s)))
  }

  function handleDefinitionChange(index: number, value: string) {
    const stepId = steps[index].id
    if (value === "__custom__") {
      setCustomModeIds((prev) => new Set([...prev, stepId]))
      patch(index, { definitionId: undefined, name: "" })
    } else {
      setCustomModeIds((prev) => {
        const next = new Set(prev)
        next.delete(stepId)
        return next
      })
      const def = definitions.find((d) => d.id === value)
      if (def) patch(index, { definitionId: def.id, name: def.name })
    }
  }

  function dropdownValue(step: AssemblyStep): string {
    if (step.definitionId) {
      if (definitions.some((d) => d.id === step.definitionId)) {
        return step.definitionId
      }
      // Soft-deleted definition — treat as custom so name stays editable
      return "__custom__"
    }
    if (customModeIds.has(step.id)) return "__custom__"
    if (!step.name) return "" // freshly added, no selection yet
    return "__custom__" // legacy step with a name but no definitionId
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Pași de producție</Label>
        <Button type="button" variant="outline" size="sm" onClick={addStep}>
          <Plus className="mr-1 h-3 w-3" />
          Adaugă pas
        </Button>
      </div>

      {steps.length === 0 ? (
        <p className="text-sm text-muted-foreground">Niciun pas adăugat.</p>
      ) : (
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const dv = dropdownValue(step)
            const isCustom = dv === "__custom__"
            return (
              <div key={step.id} className="rounded-md border p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-2.5" />
                  <span className="text-xs text-muted-foreground w-5 shrink-0 mt-2.5">{idx + 1}.</span>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Select
                      value={dv || undefined}
                      onValueChange={(v) => handleDefinitionChange(idx, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Alege un pas de producție..." />
                      </SelectTrigger>
                      <SelectContent>
                        {definitions.map((def) => (
                          <SelectItem key={def.id} value={def.id}>
                            {def.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">Custom</SelectItem>
                      </SelectContent>
                    </Select>

                    {isCustom && (
                      <Input
                        value={step.name}
                        onChange={(e) => patch(idx, { name: e.target.value })}
                        placeholder="Denumire pas custom"
                      />
                    )}

                    <Input
                      value={step.description}
                      onChange={(e) => patch(idx, { description: e.target.value })}
                      placeholder="Descriere (opțional)"
                      className="text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 mt-0.5"
                    onClick={() => removeStep(idx)}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
