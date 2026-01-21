import { Button, Input } from "@/shared/components";
import { Calendar, CaseSensitive, CloudUpload, Ellipsis, LayoutList, List, ListOrdered, Rows3, SquareCheckBig, TextAlignStart } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./SectionEditPage.module.css";
import { QuestionCard } from "./components/QuestionCard";
import type { Option } from "./types/option";

type Question = {
	type: "SHORT_TEXT" | "LONG_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "DROPDOWN" | "DETAILED_MULTIPLE_CHOICE" | "DATE" | "UPLOAD_FILE" | "LINEAR_SCALE" | "RANKING";
	title: string;
	description: string;
	options?: Array<Option>;
	onTitleChange?: (newTitle: string) => void;
	onDescriptionChange?: (newDescription: string) => void;
};

type NewQuestion = {
	icon: React.ReactNode;
	text: string;
	type: Question["type"];
};

export const AdminSectionEditPage = () => {
	const { formid } = useParams();
	const navigate = useNavigate();

	const [questions, setQuestions] = useState<Question[]>([]);

	const newQuestionOptions: NewQuestion[] = [
		{ icon: <CaseSensitive />, text: "文字簡答", type: "SHORT_TEXT" },
		{ icon: <TextAlignStart />, text: "文字詳答", type: "LONG_TEXT" },
		{ icon: <List />, text: "單選選擇題", type: "SINGLE_CHOICE" },
		{ icon: <SquareCheckBig />, text: "核取方塊", type: "MULTIPLE_CHOICE" },
		{ icon: <Rows3 />, text: "下拉選單", type: "DROPDOWN" },
		{ icon: <LayoutList />, text: "詳細核取方塊", type: "DETAILED_MULTIPLE_CHOICE" },
		{ icon: <CloudUpload />, text: "檔案上傳", type: "UPLOAD_FILE" },
		{ icon: <Ellipsis />, text: "線性刻度", type: "LINEAR_SCALE" },
		{ icon: <ListOrdered />, text: "排序", type: "RANKING" },
		{ icon: <Calendar />, text: "日期選擇", type: "DATE" }
	];

	const handleBack = () => {
		navigate(`/orgs/sdc/forms/${formid}/edit`);
	};

	const handleAddQuestion = (type: Question["type"]) => {
		setQuestions([...questions, { type, title: "", description: "", options: [] }]);
	};

	const handleRemoveQuestion = (index: number) => {
		const updatedQuestions = [...questions];
		console.log("Removing question at index:", index);
		updatedQuestions.splice(index, 1);
		setQuestions(updatedQuestions);
	};

	const handleTitleChange = (index: number, newTitle: string) => {
		const updatedQuestions = [...questions];
		updatedQuestions[index].title = newTitle;
		setQuestions(updatedQuestions);
	};

	const handleDescriptionChange = (index: number, newDescription: string) => {
		const updatedQuestions = [...questions];
		updatedQuestions[index].description = newDescription;
		setQuestions(updatedQuestions);
	};

	const handleAddOption = (questionIndex: number, newOption: Option) => {
		const updatedQuestions = [...questions];
		if (!updatedQuestions[questionIndex].options) {
			updatedQuestions[questionIndex].options = [];
		}

		const otherOptionIndex = updatedQuestions[questionIndex].options!.findIndex(option => option.isOther);
		if (newOption.isOther) {
			if (otherOptionIndex === -1) {
				updatedQuestions[questionIndex].options!.push(newOption);
			}
		} else {
			if (otherOptionIndex !== -1) {
				updatedQuestions[questionIndex].options!.splice(otherOptionIndex, 0, newOption);
			} else {
				updatedQuestions[questionIndex].options!.push(newOption);
			}
		}

		setQuestions(updatedQuestions);
	};

	const handleChangeOption = (questionIndex: number, optionIndex: number, newLabel: string) => {
		const updatedQuestions = [...questions];
		if (!updatedQuestions[questionIndex].options) {
			updatedQuestions[questionIndex].options = [];
		}
		updatedQuestions[questionIndex].options![optionIndex] = {
			...updatedQuestions[questionIndex].options![optionIndex],
			label: newLabel
		};
		setQuestions(updatedQuestions);
	};

	return (
		<>
			<div className={styles.layout}>
				<div className={styles.content}>
					<Button onClick={handleBack}>Back</Button>
					<div className={styles.container}>
						<section className={styles.card}>
							<Input placeholder="Section 標題" variant="flushed" themeColor="--comment" textSize="h2" />
							<Input placeholder="這裡可以寫一段描述" variant="flushed" themeColor="--comment" />
						</section>
						{questions.map((question, index) => (
							<QuestionCard
								key={index}
								type={question.type}
								title={question.title}
								description={question.description}
								options={question.options}
								removeQuestion={() => handleRemoveQuestion(index)}
								onTitleChange={newTitle => handleTitleChange(index, newTitle)}
								onDescriptionChange={newDescription => handleDescriptionChange(index, newDescription)}
								onAddOption={() => handleAddOption(index, { label: "New Option" })}
								onAddOtherOption={() => handleAddOption(index, { label: "其他", isOther: true })}
								onChangeOption={(optionIndex, newLabel) => handleChangeOption(index, optionIndex, newLabel)}
							/>
						))}
					</div>
				</div>
				<div>
					<div className={styles.sidebar}>
						<p>新增</p>
						{newQuestionOptions.map((option, index) => (
							<button key={index} className={styles.newQuestion} onClick={() => handleAddQuestion(option.type)}>
								{option.icon}
								{option.text}
							</button>
						))}
					</div>
				</div>
			</div>
		</>
	);
};
