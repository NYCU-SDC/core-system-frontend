export type Status = "draft" | "published"

export type FormMeta = {
    id: string
    title: string
    status: Status
    updatedAt: string
}