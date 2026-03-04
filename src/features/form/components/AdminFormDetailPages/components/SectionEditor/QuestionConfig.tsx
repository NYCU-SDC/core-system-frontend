import type { Question } from "@/features/form/components/AdminFormDetailPages/types/question";
import { NormalizeDateToUtc } from "@/shared/utils/date";
import { FormsAllowedFileTypes, type FormsQuestionRequest } from "@nycu-sdc/core-system-sdk";
import { Calendar, CaseSensitive, CloudUpload, Ellipsis, LayoutList, Link2, List, ListOrdered, Rows3, ShieldCheck, SquareCheckBig, Star, TextAlignStart } from "lucide-react";
import { marked } from "marked";
import { v4 as uuidv4 } from "uuid";

export const QUESTION_FEATURES = {
	HAS_OPTIONS: ["options", "isFromAnswer", "sourceQuestionId"],
	HAS_DETAIL_OPTIONS: ["detailOptions"],
	HAS_SCALE: ["start", "end", "startLabel", "endLabel"],
	HAS_RATING: ["icon"],
	HAS_UPLOAD: ["uploadAllowedFileTypes", "uploadMaxFileAmount", "uploadMaxFileSizeLimit"],
	HAS_DATE: ["dateHasYear", "dateHasMonth", "dateHasDay", "dateHasMinDate", "dateHasMaxDate", "dateMinDate", "dateMaxDate"],
	HAS_URL: ["url"],
	HAS_OAUTH: ["oauthProvider"]
} as const;

export type QuestionFeatureKey = keyof typeof QUESTION_FEATURES;

export type QuestionTemplate = {
	icon: React.ReactNode;
	text: string;
	type: Question["type"];
	features: QuestionFeatureKey[];
	initialState: () => Partial<Question>;
	toApiPayload?: (question: Question, base: FormsQuestionRequest) => void;
};

export const QUESTION_STRATEGIES: Record<Question["type"], QuestionTemplate> = {
	SHORT_TEXT: {
		icon: <CaseSensitive />,
		text: "文字簡答",
		type: "SHORT_TEXT",
		features: [],
		initialState: () => ({})
	},
	LONG_TEXT: {
		icon: <TextAlignStart />,
		text: "長文字簡答",
		type: "LONG_TEXT",
		features: [],
		initialState: () => ({})
	},
	SINGLE_CHOICE: {
		icon: <List />,
		text: "單選選擇題",
		type: "SINGLE_CHOICE",
		features: ["HAS_OPTIONS"],
		initialState: () => ({
			options: [
				{ id: uuidv4(), label: "選項 1" },
				{ id: uuidv4(), label: "選項 2" }
			]
		})
	},
	MULTIPLE_CHOICE: {
		icon: <SquareCheckBig />,
		text: "核取方塊",
		type: "MULTIPLE_CHOICE",
		features: ["HAS_OPTIONS"],
		initialState: () => ({
			options: [
				{ id: uuidv4(), label: "選項 1" },
				{ id: uuidv4(), label: "選項 2" }
			]
		})
	},
	DROPDOWN: {
		icon: <Rows3 />,
		text: "下拉選單",
		type: "DROPDOWN",
		features: ["HAS_OPTIONS"],
		initialState: () => ({
			options: [
				{ id: uuidv4(), label: "選項 1" },
				{ id: uuidv4(), label: "選項 2" }
			]
		})
	},
	DETAILED_MULTIPLE_CHOICE: {
		icon: <LayoutList />,
		text: "詳細核取方塊",
		type: "DETAILED_MULTIPLE_CHOICE",
		features: ["HAS_DETAIL_OPTIONS"],
		initialState: () => ({
			detailOptions: [
				{ id: uuidv4(), label: "選項 1", description: "描述 1" },
				{ id: uuidv4(), label: "選項 2", description: "描述 2" }
			]
		}),
		toApiPayload: (question, base) => {
			if (question.detailOptions) {
				base.choices = question.detailOptions.map(o => ({ name: o.label, description: o.description ? (marked.parse(o.description) as string) : o.description }));
			}
		}
	},
	DATE: {
		icon: <Calendar />,
		text: "日期選擇",
		type: "DATE",
		features: ["HAS_DATE"],
		initialState: () => ({
			dateHasYear: true,
			dateHasMonth: true,
			dateHasDay: true
		}),
		toApiPayload: (question, base) => {
			if (question.dateHasYear !== undefined && question.dateHasMonth !== undefined && question.dateHasDay !== undefined) {
				base.date = {
					hasYear: question.dateHasYear,
					hasMonth: question.dateHasMonth,
					hasDay: question.dateHasDay,
					minDate: question.dateHasMinDate ? NormalizeDateToUtc(question.dateMinDate ?? "") : undefined,
					maxDate: question.dateHasMaxDate ? NormalizeDateToUtc(question.dateMaxDate ?? "", true) : undefined
				};
			}
		}
	},
	UPLOAD_FILE: {
		icon: <CloudUpload />,
		text: "檔案上傳",
		type: "UPLOAD_FILE",
		features: ["HAS_UPLOAD"],
		initialState: () => ({
			uploadAllowedFileTypes: ["image/png", "image/jpeg"],
			uploadMaxFileAmount: 5,
			uploadMaxFileSizeLimit: 10485760
		}),
		toApiPayload: (question, base) => {
			if (question.uploadAllowedFileTypes) {
				base.uploadFile = {
					allowedFileTypes: (question.uploadAllowedFileTypes?.length ? question.uploadAllowedFileTypes : ["PDF"]) as FormsAllowedFileTypes[],
					maxFileAmount: question.uploadMaxFileAmount ?? 1,
					maxFileSizeLimit: question.uploadMaxFileSizeLimit ?? 10485760
				};
			}
		}
	},
	LINEAR_SCALE: {
		icon: <Ellipsis />,
		text: "線性刻度",
		type: "LINEAR_SCALE",
		features: ["HAS_SCALE"],
		initialState: () => ({
			start: 1,
			end: 5,
			startLabel: "非常不同意",
			endLabel: "非常同意"
		}),
		toApiPayload: (question, base) => {
			if (question.start !== undefined && question.end !== undefined) {
				base.scale = {
					minVal: question.start,
					maxVal: question.end,
					minValueLabel: question.startLabel || "",
					maxValueLabel: question.endLabel || ""
				};
			}
		}
	},
	RANKING: {
		icon: <ListOrdered />,
		text: "排序",
		type: "RANKING",
		features: ["HAS_OPTIONS"],
		initialState: () => ({
			options: [
				{ id: uuidv4(), label: "選項 1" },
				{ id: uuidv4(), label: "選項 2" },
				{ id: uuidv4(), label: "選項 3" }
			]
		})
	},
	HYPERLINK: {
		icon: <Link2 />,
		text: "超連結",
		type: "HYPERLINK",
		features: ["HAS_URL"],
		initialState: () => ({
			url: "https://example.com"
		})
	},
	RATING: {
		icon: <Star />,
		text: "評分",
		type: "RATING",
		features: ["HAS_RATING", "HAS_SCALE"],
		initialState: () => ({
			icon: "star",
			start: 1,
			end: 5,
			startLabel: "非常不喜歡",
			endLabel: "非常喜歡"
		}),
		toApiPayload: (question, base) => {
			if (question.start !== undefined && question.end !== undefined) {
				base.scale = {
					minVal: question.start,
					maxVal: question.end,
					icon: question.icon,
					minValueLabel: question.startLabel || "",
					maxValueLabel: question.endLabel || ""
				};
			}
		}
	},
	OAUTH_CONNECT: {
		icon: <ShieldCheck />,
		text: "OAuth 驗證",
		type: "OAUTH_CONNECT",
		features: ["HAS_OAUTH"],
		initialState: () => ({
			oauthProvider: "GITHUB"
		}),
		toApiPayload: (question, base) => {
			if (question.oauthProvider) {
				base.oauthConnect = question.oauthProvider ?? "GITHUB";
			}
		}
	}
};
