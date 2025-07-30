import type { QuestionType } from "../types/index"

export const questionTypeLabel: Record<QuestionType, string> = {
    short_text: "Short Text",
    long_text: "Long Text",
    single_choice: "Single Choice",
    multiple_choice: "Multiple Choice",
    date: "Date",
}

export const questionTypes: { value: QuestionType, label: string }[] = [
    { value: "short_text", label: "Short Text" },
    { value: "long_text", label: "Long Text" },
    { value: "single_choice", label: "Single Choice" },
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "date", label: "Date" },
]