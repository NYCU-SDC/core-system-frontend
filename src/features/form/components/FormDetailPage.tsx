import { UserLayout } from "@/layouts";
import { Button, Checkbox, DetailedCheckbox, Input, Radio, TextArea } from "@/shared/components";
import {
	formsGetFormById,
	formsListQuestions,
	responsesCreateFormResponse,
	responsesGetFormResponse,
	responsesListResponseSections,
	responsesSubmitFormResponse,
	responsesUpdateFormResponse,
	type FormsForm,
	type FormsQuestionResponse,
	type ResponsesAnswersRequestUpdate,
	type ResponsesResponseSections
} from "@nycu-sdc/core-system-sdk";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./FormDetailPage.module.css";

interface Section {
	id: string;
	title: string;
	completed: boolean;
	questions?: FormsQuestionResponse[];
}

export const FormDetailPage = () => {
	const { id: formId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(0);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState<FormsForm | null>(null);
	const [responseId, setResponseId] = useState<string | null>(null);
	const [sections, setSections] = useState<Section[]>([]);
	const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> answer value

	const saveAnswers = async () => {
		if (!responseId) return;

		try {
			const answersArray = Object.entries(answers)
				.filter(([_, value]) => value !== "")
				.map(([questionId, value]) => ({
					questionId,
					value
				}));

			if (answersArray.length === 0) return;

			const answersUpdate: ResponsesAnswersRequestUpdate = {
				answers: answersArray
			};

			await responsesUpdateFormResponse(responseId, answersUpdate, { credentials: "include" });
		} catch (error) {
			console.error("儲存答案失敗:", error);
		}
	};

	useEffect(() => {
		if (!responseId) return;

		const timer = setTimeout(() => {
			saveAnswers();
		}, 1000); // 1 秒後儲存

		return () => clearTimeout(timer);
	}, [FormData, responseId]);

	// 載入表單資料
	useEffect(() => {
		const loadForm = async () => {
			if (!formId) {
				setError("表單 ID 不存在");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setError(null);

				// 取得表單資訊
				const formResponse = await formsGetFormById(formId, { credentials: "include" });
				if (formResponse.status === 200) {
					setForm(formResponse.data);

					// 建立或取得表單回覆
					const responseCreation = await responsesCreateFormResponse(formId, { credentials: "include" });
					if (responseCreation.status === 201) {
						setResponseId(responseCreation.data.id);

						// 已有回覆資料
						if (responseCreation.data.id) {
							const existingResponse = await responsesGetFormResponse(formId, responseCreation.data.id, { credentials: "include" });
							if (existingResponse.status === 200) {
								// TODO: 根據 existingResponse.data 來填充 formData
							}

							// 載入 sections 和 questions
							const sectionsResponse = await responsesListResponseSections(responseCreation.data.id, { credentials: "include" });
							if (sectionsResponse.status === 200) {
								const loadedSections: Section[] = await Promise.all(
									sectionsResponse.data.sections.map(async (section: ResponsesResponseSections) => {
										try {
											const questionsResponse = await formsListQuestions(section.id, { responseId: responseCreation.data.id }, { credentials: "include" });

											const questions = questionsResponse.status === 200 ? questionsResponse.data : [];

											return {
												id: section.id,
												title: section.title,
												completed: false,
												questions
											};
										} catch (err) {
											console.error(`載入 section ${section.id} 的問題失敗:`, err);
											return {
												id: section.id,
												title: section.title,
												completed: false,
												questions: []
											};
										}
									})
								);

								setSections(loadedSections);
							}

							if (existingResponse.status === 200 && existingResponse.data.questionAnswerPairs) {
								const loadedAnswers: Record<string, string> = {};
								existingResponse.data.questionAnswerPairs.forEach((pair: any) => {
									if (pair.questionId && pair.answer) {
										loadedAnswers[pair.questionId] = pair.answer;
									}
								});
								setAnswers(loadedAnswers);
							}
						}
					}
				} else {
					throw new Error(`取得表單失敗: HTTP ${formResponse.status}`);
				}

				setIsLoading(false);
			} catch (err) {
				let errorMessage = "載入表單時發生錯誤";
				if (err instanceof Error) {
					errorMessage = err.message;

					// JSON 解析錯誤
					if (err.message.includes("JSON") || err.message.includes("<!doctype")) {
						errorMessage = "API 連線錯誤：伺服器返回了非預期的回應。請確認：\n1. 開發伺服器是否正在運行\n2. API 端點是否正確\n3. 是否需要先登入";
					}
				}

				setError(errorMessage);
				setIsLoading(false);
			}
		};

		loadForm();
	}, [formId]);

	const isSectionCompleted = (section: Section): boolean => {
		if (!section.questions || section.questions.length === 0) {
			return false;
		}

		return section.questions.every(question => {
			if (!question.required) return true;
			return answers[question.id] !== undefined && answers[question.id] !== "";
		});
	};

	// 更新完成狀態
	useEffect(() => {
		if (sections.length > 0) {
			setSections(prevSections =>
				prevSections.map(section => ({
					...section,
					completed: isSectionCompleted(section)
				}))
			);
		}
	}, [answers]);

	const isLastStep = currentStep === sections.length - 1;
	const isFirstStep = currentStep === 0;

	const handleNext = () => {
		if (!isLastStep) {
			setCurrentStep(prev => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (!isFirstStep) {
			setCurrentStep(prev => prev - 1);
		}
	};

	const handleSectionClick = (index: number) => {
		setCurrentStep(index);
	};

	const updateAnswer = (questionId: string, value: string) => {
		setAnswers(prev => ({
			...prev,
			[questionId]: value
		}));
	};

	const renderQuestion = (question: FormsQuestionResponse) => {
		const value = answers[question.id] || "";

		switch (question.type) {
			case "SHORT_TEXT":
				return (
					<Input
						key={question.id}
						id={question.id}
						label={question.title}
						placeholder={question.description || "請輸入..."}
						value={value}
						onChange={e => updateAnswer(question.id, e.target.value)}
						required={question.required}
					/>
				);

			case "LONG_TEXT":
				return (
					<TextArea
						key={question.id}
						id={question.id}
						label={question.title}
						placeholder={question.description || "請輸入..."}
						value={value}
						onChange={e => updateAnswer(question.id, e.target.value)}
						rows={6}
						required={question.required}
					/>
				);

			case "SINGLE_CHOICE":
			case "DROPDOWN":
				return (
					<div key={question.id}>
						<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
							{question.title}
							{question.required && <span style={{ color: "red" }}> *</span>}
						</label>
						{question.description && <p style={{ marginBottom: "1rem", color: "var(--color-caption)" }}>{question.description}</p>}
						<Radio
							options={
								question.choices?.map(choice => ({
									value: choice.id,
									label: choice.name
								})) || []
							}
							value={value}
							onValueChange={newValue => updateAnswer(question.id, newValue)}
						/>
					</div>
				);

			case "MULTIPLE_CHOICE":
				return (
					<div key={question.id}>
						<label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
							{question.title}
							{question.required && <span style={{ color: "red" }}> *</span>}
						</label>
						{question.description && <p style={{ marginBottom: "1rem", color: "var(--color-caption)" }}>{question.description}</p>}
						{question.choices?.map(choice => (
							<Checkbox
								key={choice.id}
								id={`${question.id}-${choice.id}`}
								label={choice.name}
								checked={value.includes(choice.id)}
								onCheckedChange={checked => {
									const currentValues = value ? value.split(",") : [];
									const newValues = checked ? [...currentValues, choice.id] : currentValues.filter(v => v !== choice.id);
									updateAnswer(question.id, newValues.join(","));
								}}
							/>
						))}
					</div>
				);

			case "DETAILED_MULTIPLE_CHOICE":
				return (
					<div key={question.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
									updateAnswer(question.id, newValues.join(","));
								}}
							/>
						))}
					</div>
				);

			default:
				return (
					<div key={question.id}>
						<p>不支援的問題類型: {question.type}</p>
						<p style={{ color: "var(--color-caption)" }}>{question.title}</p>
					</div>
				);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (currentStep === sections.length - 1 && responseId) {
			try {
				await saveAnswers();
				const submitResponse = await responsesSubmitFormResponse(responseId, { credentials: "include" });

				if (submitResponse.status === 200) {
					setIsSubmitted(true);
				} else {
					throw new Error("提交失敗");
				}
			} catch (error) {
				console.error("提交表單失敗:", error);
				alert("提交失敗，請稍後再試");
			}
		}
	};

	if (isSubmitted) {
		return (
			<UserLayout>
				<div className={styles.successContainer}>
					<div className={styles.successBox}>
						<h1 className={styles.successTitle}>感謝您的填答！</h1>
						<p className={styles.successMessage}>
							結果將於 XX/XX 公布，屆時會將信件傳遞至您註冊的 Email 信箱
							<br />
							問卷副本已寄送至您的信箱，如有疑問請洽您的內心。
						</p>
						<div className={styles.successActions}>
							<Button type="button" onClick={() => {}} themeColor="var(--code-foreground)">
								查看問卷副本
							</Button>
							<Button type="button" onClick={() => navigate("/forms")} themeColor="var(--orange)">
								返回主頁
							</Button>
						</div>
					</div>
				</div>
			</UserLayout>
		);
	}

	// 載入中
	if (isLoading) {
		return (
			<UserLayout>
				<div className={styles.container}>
					<p>載入表單中...</p>
				</div>
			</UserLayout>
		);
	}

	// 錯誤處理
	if (error || !form) {
		return (
			<UserLayout>
				<div className={styles.container}>
					<h1 className={styles.title}>載入失敗</h1>
					<pre style={{ whiteSpace: "pre-wrap", color: "red", marginBottom: "1rem" }}>{error || "找不到表單"}</pre>
					<Button onClick={() => navigate("/forms")} themeColor="var(--orange)">
						返回表單列表
					</Button>
				</div>
			</UserLayout>
		);
	}

	return (
		<UserLayout>
			<img src={formId ? `/api/forms/${formId}/cover` : ""} className={styles.cover} alt="Form Cover" />
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>{form.title}</h1>
					{currentStep === 0 ? <p className={styles.description}>{form.description}</p> : <h2 className={styles.sectionHeader}>{sections[currentStep].title}</h2>}
				</div>

				<div className={styles.structure}>
					<div className={styles.structureTitle}>
						<h2>表單結構</h2>
						<p>（可點擊項目返回編輯）</p>
					</div>
					<div style={{ display: "flex", gap: "0.625rem" }}>
						<div className={styles.structureLegend}>
							<span style={{ backgroundColor: "var(--color-caption)" }}></span>
							<p>完成填寫</p>
						</div>
						<div className={styles.structureLegend}>
							<span style={{ backgroundColor: "var(--code-foreground)" }}></span>
							<p>待填寫</p>
						</div>
						<div className={styles.structureLegend}>
							<span style={{ backgroundColor: "var(--orange)" }}></span>
							<p>目前位置</p>
						</div>
					</div>
					<div className={styles.workflow}>
						{sections.map((section, index) => (
							<button
								key={section.id}
								type="button"
								className={`${styles.workflowButton} ${index === currentStep ? styles.active : ""} ${section.completed ? styles.completed : ""}`}
								onClick={() => handleSectionClick(index)}
							>
								{section.title}
							</button>
						))}
					</div>
				</div>

				<form className={styles.form} onSubmit={handleSubmit}>
					{sections[currentStep] && (
						<div className={styles.section}>
							<div className={styles.fields}>
								{sections[currentStep].questions?.map(question => renderQuestion(question))}

								{(!sections[currentStep].questions || sections[currentStep].questions.length === 0) && <p style={{ color: "var(--color-caption)" }}>此 section 目前沒有問題</p>}
							</div>
						</div>
					)}

					<div className={styles.navigation}>
						<Button type="button" onClick={handlePrevious} disabled={isFirstStep} themeColor="var(--foreground)">
							上一頁
						</Button>
						{isLastStep ? (
							<Button type="submit">送出</Button>
						) : (
							<Button type="button" onClick={handleNext}>
								下一頁
							</Button>
						)}
					</div>
				</form>
			</div>
		</UserLayout>
	);
};
