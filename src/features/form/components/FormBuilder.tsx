import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, ArrowUp, GripVertical } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Question, QuestionType } from "../types/index"
import { questionTypeLabel, questionTypes } from "../constants/index"

interface FormBuilderProps {
  form: {
    id: string
    title: string
    description: string
    questions: Question[]
  }
  onBack: () => void
  onUpdate: (form: any) => void
}

export function FormBuilder({ form, onBack, onUpdate }: FormBuilderProps) {
  const [editingQuestion, setEditingQuestion] = useState<null | (Question & { index?: number })>(null)

  const isEditing = editingQuestion && editingQuestion.index !== undefined

  const handleDelete = (index: number) => {
    const arr = [...form.questions]
    arr.splice(index, 1)
    onUpdate({ ...form, questions: arr })
  }

  const handleEdit = (q: Question, idx: number) => {
    setEditingQuestion({ ...q, index: idx })
  }

  const handleAdd = () => {
    setEditingQuestion({
      id: crypto.randomUUID(),
      type: "short_text",
      title: "",
      options: [],
    })
  }

  const handleSave = () => {
    if (!editingQuestion) return
    let arr = [...form.questions]
    const q = { ...editingQuestion }
    delete (q as any).index

    if (isEditing) {
      arr[(editingQuestion as any).index!] = q
    } else {
      arr.push(q)
    }
    onUpdate({ ...form, questions: arr })
    setEditingQuestion(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowUp className="rotate-270 w-5 h-5" />
        </Button>
        <div>
          <span className="font-semibold text-xl">{form.title}</span>
          <div className="text-muted-foreground">{form.description}</div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          {form.questions.map((q, idx) => (
            <div
              key={q.id}
              className={cn(
                "group relative rounded-2xl border bg-card shadow-sm px-6 py-5 transition-all",
                "hover:border-primary hover:ring-2 hover:ring-primary/20 flex items-center gap-3"
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 opacity-40 cursor-pointer" />
                  <span className="font-semibold">{q.title}</span>
                  <span className="rounded bg-muted px-2 py-0.5 ml-2 text-xs text-muted-foreground">
                    {questionTypeLabel[q.type]}
                  </span>
                </div>
                {(q.type === "single_choice" || q.type === "multiple_choice") && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(q.options ?? []).map((opt, i) => (
                      <span key={i} className="rounded-full border px-3 py-0.5 text-xs text-muted-foreground bg-muted">
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="absolute right-4 top-5 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <Button variant="outline" size="icon" className="border-destructive/60" title="Delete" onClick={() => handleDelete(idx)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
                <Button variant="outline" size="icon" title="Edit" onClick={() => handleEdit(q, idx)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button onClick={handleAdd}>
            <Plus className="mr-2 w-5 h-5" />
            Add Question
          </Button>
        </div>
      </CardContent>

      <Dialog open={!!editingQuestion} onOpenChange={(v) => !v && setEditingQuestion(null)}>
        <DialogContent>
          <DialogTitle>{isEditing ? "Edit Question" : "Add Question"}</DialogTitle>
          {editingQuestion && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave() }}>
              <div>
                <Label>Type</Label>
                <select
                  className="w-full border rounded h-9 px-2 mt-1"
                  value={editingQuestion.type}
                  onChange={e => setEditingQuestion({ ...editingQuestion, type: e.target.value as QuestionType, options: [] })}
                >
                  {questionTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={editingQuestion.title}
                  onChange={e => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                  required
                />
              </div>
              {(editingQuestion.type === "single_choice" || editingQuestion.type === "multiple_choice") && (
                <div>
                  <Label>Options (comma separated)</Label>
                  <Input
                    value={(editingQuestion.options ?? []).join(", ")}
                    onChange={e => setEditingQuestion({
                      ...editingQuestion,
                      options: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    })}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={!editingQuestion.title.trim()}>
                  {isEditing ? "Save" : "Add"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setEditingQuestion(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
