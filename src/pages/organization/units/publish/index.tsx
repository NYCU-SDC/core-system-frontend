import { useFormManager } from "@/features/form/hooks/useFormManager"
import { FormListCard } from "@/features/form/components/FormListCard"
import { NewFormDialog } from "@/features/form/components/NewFormDialog"
import { FormBuilder } from "@/features/form/components/FormBuilder"

export default function PublishFormView() {
    const {
        forms,
        openEditor,
        showDialog,
        newFormTitle,
        editForm,
        setShowDialog,
        setNewFormTitle,
        setOpenEditor,
        handleAdd,
        handleEdit,
        handleDelete,
        handleUpdateForm,
    } = useFormManager([
        {id: "1", title: "請填寫 SDC 志工制服尺寸與飲食需求", status: "published", updatedAt: "2025-07-22"},
        {id: "2", title: "工作坊協助意願調查", status: "draft", updatedAt: "2025-07-20"},
    ])

    return (
        <div className="flex flex-col gap-8">
            {!openEditor && (
                <>
                    <FormListCard
                        forms={forms}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onNewForm={() => setShowDialog(true)}
                    />
                    <NewFormDialog
                        open={showDialog}
                        onOpenChange={setShowDialog}
                        value={newFormTitle}
                        onValueChange={setNewFormTitle}
                        onCreate={handleAdd}
                    />
                </>
            )}
            {openEditor && (
                <FormBuilder
                    form={editForm}
                    onBack={() => setOpenEditor(null)}
                    onUpdate={handleUpdateForm}
                />
            )}
        </div>
    )
}
