import { useCreateQuestion, useDeleteQuestion, useSections, useUpdateQuestion } from "@/features/form/hooks/useSections";
import { Button, ErrorMessage, Input, LoadingSpinner, useToast } from "@/shared/components";
import type { FormsQuestionRequest } from "@nycu-sdc/core-system-sdk";
import { Calendar, CaseSensitive, CloudUpload, Ellipsis, LayoutList, Link2, List, ListOrdered, Rows3, SquareCheckBig, Star, TextAlignStart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./SectionEditPage.module.css";
import { QuestionCard } from "./components/SectionEditor/QuestionCard";
import type { Option, Question } from "./types/option";

type NewQuestion = {
	icon: React.ReactNode;
	text: string;
	type: Question["type"];
	setDefaultQuestion: () => Question;
};

export const AdminSectionEditPage = () => {
	const { formid, sectionId } = useParams<{ formid: string; sectionId: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();

	const sectionsQuery = useSections(formid);
	const section = sectionsQuery.data?.flatMap(r => r.sections).find(s => s.id === sectionId);
	const apiQuestions = section?.questions ?? [];

	const createQuestion = useCreateQuestion(formid!, sectionId!);
	const updateQuestion = useUpdateQuestion(formid!, sectionId!);
	const deleteQuestion = useDeleteQuestion(formid!, sectionId!);

	const [questions, setQuestions] = useState<Question[]>([]);
	const [questionIds, setQuestionIds] = useState<(string | undefined)[]>([]);

	// Sync from API on first load
	useEffect(() => {
		if (apiQuestions.length > 0 && questions.length === 0) {
			const mapped: Question[] = apiQuestions.map(q => ({
				type: q.type as Question["type"],
				title: q.title,
				description: q.description ?? "",
				isFromAnswer: !!q.sourceId,
				options: q.choices?.map(c => ({ label: c.label ?? "" })),
				start: q.scale?.start,
				end: q.scale?.end,
				icon: q.scale?.icon as Question["icon"]
			}));
			setQuestions(mapped);
			setQuestionIds(apiQuestions.map(q => q.id));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiQuestions.length]);

	const toApiRequest = (q: Question, order: number): FormsQuestionRequest => ({
		type: q.type as FormsQuestionRequest["type"],
		title: q.title,
		description: q.description,
		required: false,
		order,
		...(q.options && { choices: q.options.map(o => ({ label: o.label, isOther: o.isOther ?? false })) }),
		...(q.start !== undefined && { scale: { start: q.start, end: q.end ?? 5, icon: q.icon as FormsQuestionRequest["scale"] extends object ? FormsQuestionRequest["scale"]["icon"] : never } })
	});

	const handleSaveQuestion = async (index: number) => {
		if (!formid || !sectionId) return;
		const req = toApiRequest(questions[index], index);
		const existingId = questionIds[index];
		try {
			if (existingId) {
				await updateQuestion.mutateAsync({ questionId: existingId, req });
			} else {
				const res = await createQuestion.mutateAsync(req);
				const newIds = [...questionIds];
				newIds[index] = res.id;
				setQuestionIds(newIds);
			}
			pushToast({ title: "已儲存", description: "問題已更新。", variant: "success" });
		} catch {
			pushToast({ title: "儲存失敗", description: "請稍後再試。", variant: "error" });
		}
	};

	const handleDeleteQuestionWithApi = async (index: number) => {
		const existingId = questionIds[index];
		if (existingId) {
			try {
				await deleteQuestion.mutateAsync(existingId);
			} catch {
				pushToast({ title: "刪除失敗", description: "請稍後再試。", variant: "error" });
				return;
			}
		}
		handleRemoveQuestion(index);
	};

	const newQuestionOptions: NewQuestion[] = [
		{
			icon: <CaseSensitive />,
			text: "文字簡答",
			type: "SHORT_TEXT",
			setDefaultQuestion: () => {
				return { type: "SHORT_TEXT", title: "", description: "", isFromAnswer: false };
			}
		},
		{ icon: <TextAlignStart />, text: "文字詳答", type: "LONG_TEXT", setDefaultQuestion: () => ({ type: "LONG_TEXT", title: "", description: "", isFromAnswer: false }) },
		{ icon: <List />, text: "單選選擇題", type: "SINGLE_CHOICE", setDefaultQuestion: () => ({ type: "SINGLE_CHOICE", title: "", description: "", options: [], isFromAnswer: false }) },
		{ icon: <SquareCheckBig />, text: "核取方塊", type: "MULTIPLE_CHOICE", setDefaultQuestion: () => ({ type: "MULTIPLE_CHOICE", title: "", description: "", options: [], isFromAnswer: false }) },
		{ icon: <Rows3 />, text: "下拉選單", type: "DROPDOWN", setDefaultQuestion: () => ({ type: "DROPDOWN", title: "", description: "", options: [], isFromAnswer: false }) },
		{
			icon: <LayoutList />,
			text: "詳細核取方塊",
			type: "DETAILED_MULTIPLE_CHOICE",
			setDefaultQuestion: () => ({ type: "DETAILED_MULTIPLE_CHOICE", title: "", description: "", options: [], isFromAnswer: false, detailOptions: [] })
		},
		{ icon: <CloudUpload />, text: "檔案上傳", type: "UPLOAD_FILE", setDefaultQuestion: () => ({ type: "UPLOAD_FILE", title: "", description: "", isFromAnswer: false }) },
		{ icon: <Ellipsis />, text: "線性刻度", type: "LINEAR_SCALE", setDefaultQuestion: () => ({ type: "LINEAR_SCALE", title: "", description: "", isFromAnswer: false, start: 1, end: 5 }) },
		{ icon: <Star />, text: "評分", type: "RATING", setDefaultQuestion: () => ({ type: "RATING", title: "", description: "", isFromAnswer: false, start: 1, end: 5, icon: "STAR" }) },
		{ icon: <ListOrdered />, text: "排序", type: "RANKING", setDefaultQuestion: () => ({ type: "RANKING", title: "", description: "", options: [], isFromAnswer: false }) },
		{ icon: <Calendar />, text: "日期選擇", type: "DATE", setDefaultQuestion: () => ({ type: "DATE", title: "", description: "", isFromAnswer: false }) },
		{ icon: <Link2 />, text: "超連結", type: "HYPERLINK", setDefaultQuestion: () => ({ type: "HYPERLINK", title: "", description: "", url: "", isFromAnswer: false }) }
	];

	const handleBack = () => {
		navigate(`/orgs/sdc/forms/${formid}/edit`);
	};

	const handleAddQuestion = (setQuestion: () => Question) => {
		setQuestions([...questions, setQuestion()]);
	};

	const handleRemoveQuestion = (index: number) => {
		const updatedQuestions = [...questions];
		updatedQuestions.splice(index, 1);
		setQuestions(updatedQuestions);
	};

	const handleDuplicateQuestion = (index: number) => {
		const updatedQuestions = [...questions];
		const questionToDuplicate = updatedQuestions[index];
		updatedQuestions.splice(index + 1, 0, { ...questionToDuplicate });
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

	const handleAddDetailOption = (questionIndex: number, newDetailOption: { label: string; description: string }) => {
		const updatedQuestions = [...questions];
		if (!updatedQuestions[questionIndex].detailOptions) {
			updatedQuestions[questionIndex].detailOptions = [];
		}
		updatedQuestions[questionIndex].detailOptions!.push(newDetailOption);
		setQuestions(updatedQuestions);
	};

	const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
		const updatedQuestions = [...questions];
		if (!updatedQuestions[questionIndex].options) {
			return;
		}
		updatedQuestions[questionIndex].options!.splice(optionIndex, 1);
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

	const handleStartChange = (questionIndex: number, newStart: number) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].start = newStart;
		setQuestions(updatedQuestions);
	};

	const handleEndChange = (questionIndex: number, newEnd: number) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].end = newEnd;
		setQuestions(updatedQuestions);
	};

	const handleChangeIcon = (questionIndex: number, newIcon: Question["icon"]) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].icon = newIcon;
		setQuestions(updatedQuestions);
	};

	const handleToggleIsFromAnswer = (questionIndex: number) => {
		const updatedQuestions = [...questions];
		updatedQuestions[questionIndex].isFromAnswer = !updatedQuestions[questionIndex].isFromAnswer;
		setQuestions(updatedQuestions);
	};

	return (
		<>
			<div className={styles.layout}>
				<div className={styles.content}>
					<Button onClick={handleBack}>Back</Button>
					{sectionsQuery.isLoading && <LoadingSpinner />}
					{sectionsQuery.isError && <ErrorMessage message="無法載入區塊資料" />}
					<div className={styles.container}>
						<section className={styles.card}>
							<Input placeholder="Section 標題" variant="flushed" themeColor="--comment" textSize="h2" value={section?.title ?? ""} readOnly />
							<Input placeholder="這裡可以寫一段描述" variant="flushed" themeColor="--comment" value={section?.description ?? ""} readOnly />
						</section>
						{questions.map((question, index) => (
							<>
								<QuestionCard
									key={questionIds[index] ?? index}
									question={question}
									duplicateQuestion={() => handleDuplicateQuestion(index)}
									removeQuestion={() => handleDeleteQuestionWithApi(index)}
									onTitleChange={newTitle => handleTitleChange(index, newTitle)}
									onDescriptionChange={newDescription => handleDescriptionChange(index, newDescription)}
									onAddOption={() => handleAddOption(index, { label: "New Option" })}
									onAddOtherOption={() => handleAddOption(index, { label: "其他", isOther: true })}
									onAddDetailOption={() => handleAddDetailOption(index, { label: "New Option", description: "Option Description" })}
									onRemoveOption={optionIndex => handleRemoveOption(index, optionIndex)}
									onRemoveOtherOption={() =>
										handleRemoveOption(
											index,
											question.options!.findIndex(option => option.isOther)
										)
									}
									onChangeOption={(optionIndex, newLabel) => handleChangeOption(index, optionIndex, newLabel)}
									onStartChange={newStart => handleStartChange(index, newStart)}
									onEndChange={newEnd => handleEndChange(index, newEnd)}
									onChangeIcon={newIcon => handleChangeIcon(index, newIcon)}
									onToggleIsFromAnswer={() => handleToggleIsFromAnswer(index)}
								/>
								<Button key={`save-${index}`} onClick={() => handleSaveQuestion(index)}>
									儲存此問題
								</Button>
							</>
						))}
					</div>
				</div>
				<div>
					<div className={styles.sidebar}>
						<p>新增</p>
						{newQuestionOptions.map((option, index) => (
							<button key={index} className={styles.newQuestion} onClick={() => handleAddQuestion(option.setDefaultQuestion)}>
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
