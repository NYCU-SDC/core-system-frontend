import { useState, useEffect } from "react"
import type { FormMeta, Question } from "@/features/form/types"
import { api } from "@/lib/api"

interface FormResponse {
    ID: string
    Title: string
    Description: string
    UnitID: string
    LastEditor: string
    CreatedAt: string
    UpdatedAt: string
    //Status: string
}

interface LoginRequest {
    uid: string
}

interface LoginResponse {
    message: string
}

interface CreateFormRequest {
    title: string
    description: string
}

interface CreateFormResponse {
    ID: string
    Title: string
    Description: string
    UnitID: string
    LastEditor: string
    CreatedAt: string
    UpdatedAt: string
    //Status: string
}

export function useFormManager(
    initialForms: FormMeta[] = [],
    orgSlug?: string,
    unitId?: string,
    userId?: string
) {
    const [forms, setForms] = useState<FormMeta[]>(initialForms)
    const [openEditor, setOpenEditor] = useState<null | string>(null)
    const [showDialog, setShowDialog] = useState(false)
    const [newFormTitle, setNewFormTitle] = useState("")
    const [newFormDescription, setNewFormDescription] = useState("")
    const [editForm, setEditForm] = useState({
        id: "",
        title: "",
        description: "",
        questions: [] as Question[],
    })
    const [loading, setLoading] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)


    const login = async () => {
        const uid = userId || "f68cfdbc-68be-4a76-ad22-3c6958cf3fb2"

        try {
            const requestBody: LoginRequest = {
                uid: uid
            }

            const loginResponse = await api<LoginResponse>("/api/auth/login/internal", {
                method: 'POST',
                body: requestBody
            })

            console.log('Login successful:', loginResponse.message)
            setIsLoggedIn(true)
            return true
        } catch (error) {
            console.error('Login error:', error)
            return false
        }
    }


    const loadForms = async () => {
        if (!orgSlug || !unitId) return

        try {
            setLoading(true)
            const data = await api<FormResponse[]>(`/api/orgs/${orgSlug}/units/${unitId}/forms`)


            const convertedForms: FormMeta[] = data.map((form) => ({
                id: form.ID,
                title: form.Title,
                status: "draft",
                updatedAt: new Date(form.UpdatedAt).toISOString().slice(0, 10)
            }))
            setForms(convertedForms)
        } catch (error) {
            console.error('Failed to load forms:', error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        const initializeData = async () => {
            if (orgSlug && unitId) {
                const loginSuccess = await login()
                if (loginSuccess) {
                    await loadForms()
                }
            }
        }
        initializeData()
    }, [orgSlug, unitId, userId])

    const handleEdit = (form: FormMeta) => {
        setEditForm({
            id: form.id,
            title: form.title,
            description: "為了統一製作制服與安排餐點，請填寫以下資訊。若有特殊需求請於下方備註欄說明。",
            questions: [
                {
                    id: "q1",
                    type: "short_text",
                    title: "姓名",
                },
                {
                    id: "q2",
                    type: "single_choice",
                    title: "制服尺寸",
                    options: ["XS", "S", "M", "L", "XL", "2XL", "其他"],
                },
                {
                    id: "q3",
                    type: "single_choice",
                    title: "飲食需求",
                    options: ["葷食", "素食", "特殊過敏需求"],
                },
                {
                    id: "q4",
                    type: "long_text",
                    title: "備註（選填）",
                },
            ],
        })
        setOpenEditor(form.id)
    }


    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await api<void>(`/api/forms/${id}`, { method: "DELETE" }); // ← 用 api()
            setForms(prev => prev.filter(f => f.id !== id));
            setOpenEditor(prev => (prev === id ? null : prev));
        } catch (e) {
            console.error("Delete error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newFormTitle.trim()) return
        if (!orgSlug || !unitId) {
            const id = crypto.randomUUID()
            setForms((prev) => [
                ...prev,
                {id, title: newFormTitle, status: "draft", updatedAt: new Date().toISOString().slice(0, 10)}
            ])
            setNewFormTitle("")
            setShowDialog(false)
            return
        }

        try {
            setLoading(true)
            const requestBody: CreateFormRequest = {
                title: newFormTitle,
                description: newFormDescription || "請填寫表單內容"
            }

            const newForm = await api<CreateFormResponse>(`/api/orgs/${orgSlug}/units/${unitId}/forms`, {
                method: 'POST',
                body: requestBody
            })

            const convertedForm: FormMeta = {
                id: newForm.ID,
                title: newForm.Title,
                status: "draft",
                updatedAt: new Date(newForm.UpdatedAt).toISOString().slice(0, 10)
            }

            setForms((prev) => [...prev, convertedForm])
            setNewFormTitle("")
            setNewFormDescription("")
            setShowDialog(false)
        } catch (error) {
            console.error('Failed to create form:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateForm = (updatedForm: {
        id: string
        title: string
        description: string
        questions: Question[]
    }) => {
        setEditForm(updatedForm)
    }

    return {
        forms,
        openEditor,
        showDialog,
        newFormTitle,
        newFormDescription,
        editForm,
        loading,
        isLoggedIn,
        setShowDialog,
        setNewFormTitle,
        setNewFormDescription,
        setEditForm,
        setOpenEditor,
        handleAdd,
        handleEdit,
        handleDelete,
        handleUpdateForm,
    }
}
