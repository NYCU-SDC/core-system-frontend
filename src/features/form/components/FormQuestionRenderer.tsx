import { DateInput, ScaleInput } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import { useEffect } from "react";
import styles from "./FormDetailPage.module.css";
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
	SingleChoiceRenderer
} from "./QuestionRenderers";

type FormQuestionRendererProps = {
	question: FormsQuestionResponse;
	value: string;
	otherTextValue?: string;
	sourceQuestion?: FormsQuestionResponse;
	sourceAnswerValue?: string;
	responseId?: string;
	disableFileUpload?: boolean;
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

	const RENDER_MAP: Record<string, React.ReactNode> = {
		SHORT_TEXT: <ShortTextRenderer question={question} value={value} onAnswerChange={onAnswerChange} />,
		LONG_TEXT: <LongTextRenderer question={question} value={value} onAnswerChange={onAnswerChange} />,
		SINGLE_CHOICE: <SingleChoiceRenderer question={question} value={value} onAnswerChange={onAnswerChange} onOtherTextChange={onOtherTextChange} otherTextValue={otherTextValue} />,
		DROPDOWN: <DropdownRenderer question={question} value={value} onAnswerChange={onAnswerChange} />,
		MULTIPLE_CHOICE: <MultipleChoiceRenderer question={question} value={value} onAnswerChange={onAnswerChange} onOtherTextChange={onOtherTextChange} otherTextValue={otherTextValue} />,
		DETAILED_MULTIPLE_CHOICE: <DetailMultipleChoiceRenderer question={question} value={value} onAnswerChange={onAnswerChange} />,
		RANKING: <RankingRenderer question={question} value={value} onAnswerChange={onAnswerChange} />,
		DATE: (
			<DateInput
				key={question.id}
				id={question.id}
				label={question.title}
				description={question.description || undefined}
				value={value}
				options={question.date || { hasYear: true, hasMonth: true, hasDay: true }}
				required={question.required}
				onChange={newValue => onAnswerChange(question.id, newValue)}
			/>
		),
		LINEAR_SCALE: (
			<ScaleInput
				key={question.id}
				id={question.id}
				label={question.title}
				description={question.description || undefined}
				value={value}
				options={question.scale || { minVal: 1, maxVal: 5 }}
				required={question.required}
				onChange={newValue => onAnswerChange(question.id, newValue)}
			/>
		),
		RATING: (
			<ScaleInput
				key={question.id}
				id={question.id}
				label={question.title}
				description={question.description || undefined}
				value={value}
				options={question.scale || { minVal: 1, maxVal: 5 }}
				required={question.required}
				onChange={newValue => onAnswerChange(question.id, newValue)}
			/>
		),
		UPLOAD_FILE: (
			<FileUploadRenderer
				responseId={responseId}
				questionId={question.id}
				question={question}
				maxFileAmount={question.uploadFile?.maxFileAmount || 1}
				allowedFileTypes={question.uploadFile?.allowedFileTypes?.join(",") || "*"}
				onFilesChange={fileNames => onAnswerChange(question.id, fileNames)}
				disabled={disableFileUpload}
			/>
		),
		OAUTH_CONNECT: (
			<OAuthConnectRenderer question={question} value={value} responseId={responseId} onOauthConnect={() => onOauthConnect?.(question)} connectingOauthQuestionId={connectingOauthQuestionId} />
		),
		HYPERLINK: <HyperlinkRenderer question={question} value={value} onAnswerChange={onAnswerChange} />
	};

	return (
		<>
			{RENDER_MAP[question.type] || (
				<div key={question.id} className={styles.questionField}>
					<p>不支援的問題類型: {question.type}</p>
					<p className={styles.caption}>{question.title}</p>
				</div>
			)}
		</>
	);
};
