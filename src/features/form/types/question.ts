export type QuestionType =
    | "short_text"
    | "long_text"
    | "single_choice"
    | "multiple_choice"
    | "date"

export type Question = {
    id: string
    type: QuestionType
    title: string
    options?: string[]
}