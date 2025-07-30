import type { Status} from "../types/index"

export const statusLabel: Record<Status, string> = {
    draft: "Draft",
    published: "Published",
}

export const statusColor: Record<Status, string> = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}