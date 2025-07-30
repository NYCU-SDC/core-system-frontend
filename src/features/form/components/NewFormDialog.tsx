import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface NewFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onValueChange: (value: string) => void
  onCreate: () => void
}

export function NewFormDialog({ open, onOpenChange, value, onValueChange, onCreate }: NewFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>New Form</DialogTitle>
        <div className="space-y-4">
          <Label>Form Name</Label>
          <Input value={value} onChange={e => onValueChange(e.target.value)}/>
          <Button className="w-full" onClick={onCreate} disabled={!value.trim()}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
