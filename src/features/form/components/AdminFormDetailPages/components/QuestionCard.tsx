import { Button, Switch } from "@/shared/components";
import { Input } from "@/shared/components/Input/Input";
import { Calendar, CaseSensitive, CloudUpload, Copy, Ellipsis, LayoutList, List, ListOrdered, Rows3, SquareCheckBig, TextAlignStart, Trash2 } from "lucide-react";
import { useState } from "react";
import styles from "./QuestionCard.module.css";

export interface QuestionCardProps {
	type: "SHORT_TEXT" | "LONG_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "DROPDOWN" | "DETAILED_MULTIPLE_CHOICE" | "DATE" | "UPLOAD_FILE" | "LINEAR_SCALE" | "RANKING";
	title?: string;
	description?: string;
	onTitleChange?: (newTitle: string) => void;
	onDescriptionChange?: (newDescription: string) => void;
	removeQuestion?: () => void;
}

type typeInfo = {
	icon: React.ReactNode;
	label: string;
};

const typeIconMap: Record<QuestionCardProps["type"], typeInfo> = {
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
		label: "單選選擇題"
	},
	MULTIPLE_CHOICE: {
		icon: <SquareCheckBig />,
		label: "核取方塊"
	},
	DROPDOWN: {
		icon: <Rows3 />,
		label: "下拉選單"
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
	RANKING: {
		icon: <ListOrdered />,
		label: "排序"
	},
	DATE: {
		icon: <Calendar />,
		label: "日期選擇"
	}
};

export const QuestionCard = (props: QuestionCardProps) => {
	const { type, removeQuestion } = props;

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
								value={props.title}
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
								value={props.description}
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
								{typeIconMap[type].icon} {typeIconMap[type].label}
							</Button>
						</div>
					</div>
					<div className={styles.actions}>
						<Copy />
						<Trash2 onClick={removeQuestion} />
						<div className={`${styles.switch}`}>
							<p className={`${styles.label}`}>必填</p>
							<Switch />
						</div>
					</div>
				</div>
			) : (
				<div className={styles.preview}>
					{typeIconMap[type].icon}
					<p>{props.title || "Question 標題"}</p>
				</div>
			)}
		</section>
	);
};
