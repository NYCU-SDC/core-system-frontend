import { DateInput, ScaleInput } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import { useEffect } from "react";
import styles from "./FormFilloutPage.module.css";
import { FormQuestionWrapper } from "./FormQuestionWrapper";
import {
	DetailMultipleChoiceRenderer,
	DropdownRenderer,
	FileUploadRenderer,
	HyperlinkRenderer,
	LongTextRenderer,
	MultipleChoiceRenderer,
	OAuthConnectRenderer,
	RankingRenderer,
	ShortTextRenderer,
	SingleChoiceRenderer,
	type ServerFileInfo
} from "./QuestionRenderers";

type FormQuestionRendererProps = {
	question: FormsQuestionResponse;
	value: string;
	otherTextValue?: string;
	sourceQuestion?: FormsQuestionResponse;
	sourceAnswerValue?: string;
	responseId?: string;
	disableFileUpload?: boolean;
	initialFiles?: ServerFileInfo[];
	onFileMetadataChange?: (files: ServerFileInfo[]) => void;
	onAnswerChange: (questionId: string, value: string) => void;
	onOtherTextChange: (questionId: string, value: string) => void;
};

export const FormQuestionRenderer = ({
	question,
	value,
	otherTextValue = "",
	sourceQuestion,
	sourceAnswerValue = "",
	responseId,
	disableFileUpload = false,
	initialFiles,
	onFileMetadataChange,
	onAnswerChange,
	onOtherTextChange
}: FormQuestionRendererProps) => {
	useEffect(() => {
		if (question.type !== "RANKING") return;
		const rankingChoices = question.choices?.length ? question.choices : (sourceQuestion?.choices ?? []);
		const sourceSelectedIds = sourceAnswerValue ? sourceAnswerValue.split(",").filter(Boolean) : [];
		const isFromAnswerRanking = Boolean(question.sourceId);
		const allowedIds = isFromAnswerRanking ? sourceSelectedIds : rankingChoices.map(choice => choice.id);
		if (allowedIds.length !== 1) return;
		if (value === allowedIds[0]) return;
		onAnswerChange(question.id, allowedIds[0]);
	}, [question, sourceQuestion, sourceAnswerValue, value, onAnswerChange]);

	const renderControl = () => {
		if (question.type === "SHORT_TEXT") {
			return <ShortTextRenderer question={question} value={value} onAnswerChange={onAnswerChange} />;
		}
		if (question.type === "LONG_TEXT") {
			return <LongTextRenderer question={question} value={value} onAnswerChange={onAnswerChange} />;
		}
		if (question.type === "SINGLE_CHOICE") {
			return <SingleChoiceRenderer question={question} value={value} onAnswerChange={onAnswerChange} onOtherTextChange={onOtherTextChange} otherTextValue={otherTextValue} />;
		}
		if (question.type === "DROPDOWN") {
			return <DropdownRenderer question={question} value={value} onAnswerChange={onAnswerChange} />;
		}
		if (question.type === "MULTIPLE_CHOICE") {
			return <MultipleChoiceRenderer question={question} value={value} onAnswerChange={onAnswerChange} onOtherTextChange={onOtherTextChange} otherTextValue={otherTextValue} />;
		}
		if (question.type === "DETAILED_MULTIPLE_CHOICE") {
			return <DetailMultipleChoiceRenderer question={question} value={value} onAnswerChange={onAnswerChange} />;
		}
		if (question.type === "RANKING") {
			return <RankingRenderer question={question} value={value} onAnswerChange={onAnswerChange} sourceQuestion={sourceQuestion} sourceAnswerValue={sourceAnswerValue} />;
		}
		if (question.type === "DATE") {
			return (
				<DateInput
					key={question.id}
					id={question.id}
					label={question.title}
					descriptionHtml={question.descriptionHtml || undefined}
					value={value}
					options={question.date || { hasYear: true, hasMonth: true, hasDay: true }}
					required={question.required}
					onChange={newValue => onAnswerChange(question.id, newValue)}
				/>
			);
		}
		if (question.type === "LINEAR_SCALE") {
			return (
				<ScaleInput
					key={question.id}
					id={question.id}
					label={question.title}
					descriptionHtml={question.descriptionHtml || undefined}
					value={value}
					options={question.scale || { minVal: 1, maxVal: 5 }}
					required={question.required}
					onChange={newValue => onAnswerChange(question.id, newValue)}
				/>
			);
		}
		if (question.type === "RATING") {
			return (
				<ScaleInput
					key={question.id}
					id={question.id}
					label={question.title}
					descriptionHtml={question.descriptionHtml || undefined}
					value={value}
					options={question.scale || { minVal: 1, maxVal: 5 }}
					required={question.required}
					onChange={newValue => onAnswerChange(question.id, newValue)}
				/>
			);
		}
		if (question.type === "UPLOAD_FILE") {
			return (
				<FileUploadRenderer
					responseId={responseId}
					questionId={question.id}
					question={question}
					maxFileAmount={question.uploadFile?.maxFileAmount || 1}
					allowedFileTypes={question.uploadFile?.allowedFileTypes?.join(",") || "*"}
					initialFiles={initialFiles}
					onFileMetadataChange={onFileMetadataChange}
					onFilesChange={fileNames => onAnswerChange(question.id, fileNames)}
					disabled={disableFileUpload}
				/>
			);
		}
		if (question.type === "OAUTH_CONNECT") {
			return <OAuthConnectRenderer question={question} value={value} responseId={responseId} onAnswerChange={onAnswerChange} />;
		}
		if (question.type === "HYPERLINK") {
			return <HyperlinkRenderer question={question} value={value} onAnswerChange={onAnswerChange} />;
		}
		return (
			<div key={question.id}>
				<p>不支援的問題類型: {question.type}</p>
				<p className={styles.caption}>{question.title}</p>
			</div>
		);
	};

	// 目前只有 DATE / LINEAR_SCALE / RATING 內建 label 與 description，其餘題型用 FormQuestionWrapper 顯示標題
	if (question.type === "DATE" || question.type === "LINEAR_SCALE" || question.type === "RATING") {
		return <>{renderControl()}</>;
	}

	return <FormQuestionWrapper question={question}>{renderControl()}</FormQuestionWrapper>;
};
