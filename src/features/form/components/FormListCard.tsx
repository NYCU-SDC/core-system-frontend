import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { FormMeta } from "../types/index"
import { statusLabel, statusColor } from "../constants/index"

interface FormListCardProps {
  forms: FormMeta[]
  onEdit: (form: FormMeta) => void
  onDelete: (id: string) => void
  onNewForm: () => void
}

export function FormListCard({ forms, onEdit, onDelete, onNewForm }: FormListCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Form Management</CardTitle>
        </div>
        <Button size="sm" onClick={onNewForm}>
          <Plus className="mr-2 h-4 w-4"/>
          New Form
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.title}</TableCell>
                <TableCell>
                  <span className={cn("rounded-xl px-2 py-0.5 text-xs font-semibold", statusColor[f.status])}>
                    {statusLabel[f.status]}
                  </span>
                </TableCell>
                <TableCell>{f.updatedAt}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(f)} title="Edit">
                    <Edit2 className="w-4 h-4"/>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(f.id)} title="Delete">
                    <Trash2 className="w-4 h-4"/>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
