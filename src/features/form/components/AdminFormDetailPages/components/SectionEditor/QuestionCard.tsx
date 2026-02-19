import { Button, Input, Switch } from "@/shared/components";
import { Calendar, CaseSensitive, CloudUpload, Copy, Ellipsis, LayoutList, Link2, List, ListOrdered, Rows3, SquareCheckBig, Star, TextAlignStart, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Question } from "../../types/option";
import { DetailOptionsQuestion } from "./DetailOptionsQuestion";
import { OptionsQuestion } from "./OptionsQuestion";
import styles from "./QuestionCard.module.css";
import { RangeQuestion } from "./RangeQuestion";

export interface QuestionCardProps {
	question: Question;
	onTitleChange?: (newTitle: string) => void;
	onDescriptionChange?: (newDescription: string) => void;
	removeQuestion: () => void;
	duplicateQuestion: () => void;
	onAddOption?: () => void;
	onAddOtherOption?: () => void;
	onRemoveOption?: (optionIndex: number) => void;
	onRemoveOtherOption?: () => void;
	onAddDetailOption?: () => void;
	onDetailOptionChange?: (optionIndex: number, field: "label" | "description", value: string) => void;
	onRemoveDetailOption?: (optionIndex: number) => void;
	onChangeOption?: (optionIndex: number, newLabel: string) => void;
	onStartChange?: (newStart: number) => void;
	onEndChange?: (newEnd: number) => void;
	onStartLabelChange?: (label: string) => void;
	onEndLabelChange?: (label: string) => void;
	onChangeIcon?: (newIcon: Question["icon"]) => void;
	onToggleIsFromAnswer?: () => void;
	onRequiredChange?: (required: boolean) => void;
	onUrlChange?: (url: string) => void;
}

type typeInfo = {
	icon: React.ReactNode;
	label: string;
	optionType?: "radio" | "checkbox" | "list";
};

const typeMap: Record<Question["type"], typeInfo> = {
	SHORT_TEXT: {
		icon: <CaseSensitive />,
		label: "文字簡答"
	},
	LONG_TEXT: {
		icon: <TextAlignStart />,
		label: "文字詳答"
	},
	SINGLE_CHOICE: {
		icon: <List />,
		label: "單選選擇題",
		optionType: "radio"
	},
	MULTIPLE_CHOICE: {
		icon: <SquareCheckBig />,
		label: "核取方塊",
		optionType: "checkbox"
	},
	DROPDOWN: {
		icon: <Rows3 />,
		label: "下拉選單",
		optionType: "list"
	},
	DETAILED_MULTIPLE_CHOICE: {
		icon: <LayoutList />,
		label: "詳細核取方塊"
	},
	UPLOAD_FILE: {
		icon: <CloudUpload />,
		label: "檔案上傳"
	},
	LINEAR_SCALE: {
		icon: <Ellipsis />,
		label: "線性刻度"
	},
	RATING: {
		icon: <Star />,
		label: "評分"
	},
	RANKING: {
		icon: <ListOrdered />,
		label: "排序",
		optionType: "list"
	},
	DATE: {
		icon: <Calendar />,
		label: "日期選擇"
	},
	HYPERLINK: {
		icon: <Link2 />,
		label: "超連結"
	}
};

export const QuestionCard = (props: QuestionCardProps): ReactNode => {
	const { question, removeQuestion, duplicateQuestion } = props;

	const [isToggled, setIsToggled] = useState(false);

	const handleToggle = () => {
		setIsToggled(!isToggled);
	};

	return (
		<section className={styles.card} onClick={handleToggle}>
			{isToggled ? (
				<div
					onClick={e => {
						e.stopPropagation();
					}}
					className={styles.content}
				>
					<div className={styles.header}>
						<div className={styles.input}>
							<Input
								value={question.title}
								onChange={e => {
									if (props.onTitleChange) {
										props.onTitleChange(e.target.value);
									}
								}}
								placeholder="Question 標題"
								variant="flushed"
								themeColor="--comment"
								textSize="h2"
							/>
							<Input
								value={question.description}
								onChange={e => {
									if (props.onDescriptionChange) {
										props.onDescriptionChange(e.target.value);
									}
								}}
								placeholder="這裡可以寫一段描述"
								variant="flushed"
								themeColor="--comment"
							/>
						</div>
						<div>
							<Button variant="secondary" className={styles.typeButton}>
								{typeMap[question.type].icon} {typeMap[question.type].label}
							</Button>
						</div>
					</div>
					{["SINGLE_CHOICE", "MULTIPLE_CHOICE", "RANKING", "DROPDOWN"].some(type => type === question.type) && (
						<OptionsQuestion
							type={typeMap[question.type].optionType || "radio"}
							options={question.options || []}
							isFromAnswer={question.isFromAnswer}
							onAdd={() => {
								if (props.onAddOption) {
									props.onAddOption();
								}
							}}
							onAddOther={() => {
								if (props.onAddOtherOption) {
									props.onAddOtherOption();
								}
							}}
							onChange={(optionIndex, newLabel) => {
								if (props.onChangeOption) {
									props.onChangeOption(optionIndex, newLabel);
								}
							}}
							onRemove={optionIndex => {
								if (props.onRemoveOption) {
									props.onRemoveOption(optionIndex);
								}
							}}
							onRemoveOther={() => {
								if (props.onRemoveOtherOption) {
									props.onRemoveOtherOption();
								}
							}}
							onToggleIsFromAnswer={() => {
								if (props.onToggleIsFromAnswer) {
									props.onToggleIsFromAnswer();
								}
							}}
						/>
					)}
					{question.type === "LINEAR_SCALE" && (
						<div className={styles.linearScale}>
							<RangeQuestion
								start={question.start || 1}
								end={question.end || 5}
								startLabel={question.startLabel}
								endLabel={question.endLabel}
								hasIcon={false}
								onStartChange={props.onStartChange}
								onEndChange={props.onEndChange}
								onStartLabelChange={props.onStartLabelChange}
								onEndLabelChange={props.onEndLabelChange}
							/>
						</div>
					)}

					{question.type === "RATING" && (
						<div className={styles.linearScale}>
							<RangeQuestion
								start={question.start || 1}
								end={question.end || 5}
								startLabel={question.startLabel}
								endLabel={question.endLabel}
								hasIcon={true}
								icon={question.icon}
								onStartChange={props.onStartChange}
								onEndChange={props.onEndChange}
								onStartLabelChange={props.onStartLabelChange}
								onEndLabelChange={props.onEndLabelChange}
								onChangeIcon={props.onChangeIcon}
							/>
						</div>
					)}

					{question.type === "DETAILED_MULTIPLE_CHOICE" && (
						<DetailOptionsQuestion options={question.detailOptions || []} onAdd={props.onAddDetailOption || (() => {})} onEdit={props.onDetailOptionChange} onRemove={props.onRemoveDetailOption} />
					)}
					{question.type === "HYPERLINK" && (
						<Input value={question.url ?? ""} placeholder="輸入超連結 URL" variant="flushed" themeColor="--comment" onChange={e => props.onUrlChange?.(e.target.value)} />
					)}
					<div className={styles.actions}>
						<Copy onClick={duplicateQuestion} />
						<Trash2 onClick={removeQuestion} />
						<div className={`${styles.switch}`}>
							<p className={`${styles.label}`}>必填</p>
							<Switch checked={question.required ?? false} onClick={() => props.onRequiredChange?.(!(question.required ?? false))} />
						</div>
					</div>
				</div>
			) : (
				<div className={styles.preview}>
					{typeMap[question.type].icon}
					<p>{props.question.title || "Question 標題"}</p>
				</div>
			)}
		</section>
	);
};
