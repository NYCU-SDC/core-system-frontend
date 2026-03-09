import { AccountButton, Checkbox, DateInput, DetailedCheckbox, DragToOrder, Input, Radio, ScaleInput, Select, TextArea } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import { Chrome, Github } from "lucide-react";
import { useEffect } from "react";
import { FileUploadQuestion } from "./FileUploadQuestion";
import styles from "./FormDetailPage.module.css";
import { FormQuestionWrapper } from "./FormQuestionWrapper";

type FormQuestionRendererProps = {
	question: FormsQuestionResponse;
	value: string;
	otherTextValue?: string;
	sourceQuestion?: FormsQuestionResponse;
	sourceAnswerValue?: string;
	responseId?: string;
	connectingOauthQuestionId?: string | null;
	disableFileUpload?: boolean;
	onAnswerChange: (questionId: string, value: string) => void;
	onOtherTextChange: (questionId: string, value: string) => void;
	onOauthConnect?: (question: FormsQuestionResponse) => void;
};

export const FormQuestionRenderer = ({
	question,
	value,
	otherTextValue = "",
	sourceQuestion,
	sourceAnswerValue = "",
	responseId,
	connectingOauthQuestionId = null,
	disableFileUpload = false,
	onAnswerChange,
	onOtherTextChange,
	onOauthConnect
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

	const isValidUrl = (url: string): boolean => {
		try {
			const parsed = new URL(url);
			return parsed.protocol === "http:" || parsed.protocol === "https:";
		} catch {
			return false;
		}
	};

	const getSelectedChoiceIds = (rawValue: string) => (rawValue ? rawValue.split(",").filter(Boolean) : []);

	switch (question.type) {
		case "SHORT_TEXT":
			return (
				<FormQuestionWrapper question={question}>
					<Input id={question.id} placeholder="請輸入..." value={value} onChange={e => onAnswerChange(question.id, e.target.value)} required={question.required} />
				</FormQuestionWrapper>
			);

		case "LONG_TEXT":
			return (
				<FormQuestionWrapper question={question}>
					<TextArea id={question.id} placeholder="請輸入..." value={value} onChange={e => onAnswerChange(question.id, e.target.value)} rows={6} required={question.required} />
				</FormQuestionWrapper>
			);

		case "SINGLE_CHOICE": {
			const choices = question.choices ?? [];
			const otherChoice = choices.find(choice => choice.isOther);

			return (
				<FormQuestionWrapper question={question}>
					<Radio
						options={choices.map(choice => ({ value: choice.id, label: choice.name }))}
						value={value}
						onValueChange={newValue => {
							onAnswerChange(question.id, newValue);
							if (newValue !== otherChoice?.id) {
								onOtherTextChange(question.id, "");
							}
						}}
					/>
					{otherChoice && value === otherChoice.id && <Input placeholder="請填寫其他" value={otherTextValue} onChange={e => onOtherTextChange(question.id, e.target.value)} />}
				</FormQuestionWrapper>
			);
		}

		case "DROPDOWN": {
			const choices = question.choices ?? [];

			return (
				<FormQuestionWrapper question={question}>
					<Select options={choices.map(choice => ({ value: choice.id, label: choice.name }))} value={value || undefined} onValueChange={newValue => onAnswerChange(question.id, newValue)} />
				</FormQuestionWrapper>
			);
		}

		case "MULTIPLE_CHOICE": {
			const choices = question.choices ?? [];
			const otherChoice = choices.find(choice => choice.isOther);
			const selectedIds = getSelectedChoiceIds(value);

			return (
				<FormQuestionWrapper question={question}>
					<div className={styles.choiceList}>
						{choices.map(choice => (
							<Checkbox
								key={choice.id}
								id={`${question.id}-${choice.id}`}
								label={choice.name}
								checked={selectedIds.includes(choice.id)}
								onCheckedChange={checked => {
									const newValues = checked ? [...selectedIds, choice.id] : selectedIds.filter(v => v !== choice.id);
									onAnswerChange(question.id, newValues.join(","));
									if (otherChoice?.id === choice.id && !checked) {
										onOtherTextChange(question.id, "");
									}
								}}
							/>
						))}
					</div>
					{otherChoice && selectedIds.includes(otherChoice.id) && <Input placeholder="請填寫其他" value={otherTextValue} onChange={e => onOtherTextChange(question.id, e.target.value)} />}
				</FormQuestionWrapper>
			);
		}

		case "DETAILED_MULTIPLE_CHOICE":
			return (
				<FormQuestionWrapper question={question}>
					<div className={styles.choiceList}>
						{question.choices?.map(choice => (
							<DetailedCheckbox
								key={choice.id}
								id={`${question.id}-${choice.id}`}
								title={choice.name}
								description={choice.description || ""}
								checked={value.includes(choice.id)}
								onCheckedChange={checked => {
									const currentValues = value ? value.split(",") : [];
									const newValues = checked ? [...currentValues, choice.id] : currentValues.filter(v => v !== choice.id);
									onAnswerChange(question.id, newValues.join(","));
								}}
							/>
						))}
					</div>
				</FormQuestionWrapper>
			);

		case "DATE":
			return (
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
			);

		case "LINEAR_SCALE":
		case "RATING":
			return (
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
			);

		case "RANKING": {
			const isFromAnswerRanking = Boolean(question.sourceId);
			const rankingChoices = question.choices?.length ? question.choices : (sourceQuestion?.choices ?? []);
			const sourceSelectedIds = sourceAnswerValue ? sourceAnswerValue.split(",").filter(Boolean) : [];
			const shouldWaitSourceSelection = isFromAnswerRanking && sourceSelectedIds.length === 0;
			const allowedIds = sourceSelectedIds.length > 0 ? sourceSelectedIds : rankingChoices.map(choice => choice.id);
			const currentRankingIds = value
				? value
						.split(",")
						.filter(Boolean)
						.filter(id => allowedIds.includes(id))
				: [];
			const missingIds = allowedIds.filter(id => !currentRankingIds.includes(id));
			const displayIds = [...currentRankingIds, ...missingIds];

			return (
				<FormQuestionWrapper question={question}>
					{shouldWaitSourceSelection ? (
						<p className={styles.caption}>請先在「{sourceQuestion?.title || "來源題目"}」選擇至少一個項目，才可進行排序。</p>
					) : (
						<DragToOrder
							items={displayIds.map(choiceId => {
								const choice = rankingChoices.find(c => c.id === choiceId);
								return {
									id: choiceId,
									content: choice?.name || choiceId
								};
							})}
							onReorder={items => {
								onAnswerChange(question.id, items.map(item => item.id).join(","));
							}}
						/>
					)}
				</FormQuestionWrapper>
			);
		}

		case "UPLOAD_FILE":
			return (
				<FormQuestionWrapper question={question}>
					<FileUploadQuestion
						responseId={responseId}
						questionId={question.id}
						maxFileAmount={question.uploadFile?.maxFileAmount || 1}
						allowedFileTypes={question.uploadFile?.allowedFileTypes?.join(",") || "*"}
						onFilesChange={fileNames => onAnswerChange(question.id, fileNames)}
						disabled={disableFileUpload}
					/>
					<p className={styles.uploadHint}>
						最多 {question.uploadFile?.maxFileAmount || 1} 個檔案，每個檔案最大 {((question.uploadFile?.maxFileSizeLimit || 10485760) / 1024 / 1024).toFixed(0)} MB
					</p>
					{(!responseId || disableFileUpload) && <p className={styles.uploadHint}>預覽模式不會上傳檔案。</p>}
				</FormQuestionWrapper>
			);

		case "OAUTH_CONNECT":
			return (
				<FormQuestionWrapper question={question}>
					<p className={styles.caption}>
						綁定平台：
						{question.oauthConnect === "GOOGLE" ? "Google" : "GitHub"}
					</p>
					<div className={styles.oauthConnectActions}>
						<AccountButton
							type="button"
							logo={question.oauthConnect === "GOOGLE" ? <Chrome size={20} /> : <Github size={20} />}
							connected={Boolean(value)}
							onClick={() => onOauthConnect?.(question)}
							disabled={!responseId || !onOauthConnect || connectingOauthQuestionId === question.id}
						>
							{connectingOauthQuestionId === question.id ? "綁定中" : value ? "重新綁定帳號" : "綁定帳號"}
						</AccountButton>
						<p className={styles.uploadHint}>{value ? `已綁定帳號：${value}` : "尚未綁定，點擊上方按鈕開始 OAuth 綁定流程。"}</p>
					</div>
				</FormQuestionWrapper>
			);

		case "HYPERLINK":
			return (
				<FormQuestionWrapper question={question}>
					<Input
						id={question.id}
						placeholder="https://"
						value={value}
						onChange={e => onAnswerChange(question.id, e.target.value)}
						required={question.required}
						error={value && !isValidUrl(value) ? "請輸入有效的網址（需以 http:// 或 https:// 開頭）" : ""}
					/>
				</FormQuestionWrapper>
			);

		default:
			return (
				<div key={question.id} className={styles.questionField}>
					<p>不支援的問題類型: {question.type}</p>
					<p className={styles.caption}>{question.title}</p>
				</div>
			);
	}
};
