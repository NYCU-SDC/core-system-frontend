import { UserLayout } from "@/layouts";
import { Button, Checkbox, DetailedCheckbox, Input, Radio, TextArea } from "@/shared/components";
import {
	formsGetFormById,
	formsGetFormCoverImage,
	formsListSections,
	responsesCreateFormResponse,
	responsesGetFormResponse,
	responsesSubmitFormResponse,
	responsesUpdateFormResponse,
	type FormsForm,
	type FormsQuestionResponse,
	type FormsSection,
	type ResponsesAnswersRequestUpdate,
	type ResponsesDateAnswer,
	type ResponsesResponseProgress,
	type ResponsesResponseSections,
	type ResponsesScaleAnswer,
	type ResponsesStringAnswer,
	type ResponsesStringArrayAnswer
} from "@nycu-sdc/core-system-sdk";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./FormDetailPage.module.css";

interface Section extends FormsSection {
	progress?: "DRAFT" | "SUBMITTED";
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
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
	const [previewData, setPreviewData] = useState<ResponsesResponseSections[] | null>(null);
	const [responseProgress, setResponseProgress] = useState<ResponsesResponseProgress>("DRAFT");

	const saveAnswers = useCallback(async () => {
		if (!responseId) return;

		try {
			const questionTypeMap: Record<string, string> = {};
			sections.forEach(section => {
				section.questions?.forEach(question => {
					questionTypeMap[question.id] = question.type;
				});
			});

			const answersArray = Object.entries(answers)
				.filter(([, value]) => value !== "")
				.map(([questionId, value]) => {
					const questionType = questionTypeMap[questionId];

					// Determine if this is a string or string array answer type
					const stringArrayTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "DETAILED_MULTIPLE_CHOICE", "RANKING"];
					const isArrayType = stringArrayTypes.includes(questionType);

					if (isArrayType) {
						const valueArray = value.includes(",") ? value.split(",") : [value];
						return {
							questionId,
							questionType: questionType as ResponsesStringArrayAnswer["questionType"],
							value: valueArray
						} as ResponsesStringArrayAnswer;
					} else {
						return {
							questionId,
							questionType: questionType as ResponsesStringAnswer["questionType"],
							value: value
						} as ResponsesStringAnswer;
					}
				});

			if (answersArray.length === 0) return;

			const answersUpdate: ResponsesAnswersRequestUpdate = {
				answers: answersArray as (ResponsesStringAnswer | ResponsesStringArrayAnswer | ResponsesScaleAnswer | ResponsesDateAnswer)[]
			};

			await responsesUpdateFormResponse(responseId, answersUpdate, { credentials: "include" });
		} catch (error) {
			console.error("儲存答案失敗:", error);
		}
	}, [responseId, answers, sections]);

	useEffect(() => {
		if (!responseId) return;

		const timer = setTimeout(() => {
			saveAnswers();
		}, 1000); // 1 秒後儲存

		return () => clearTimeout(timer);
	}, [answers, responseId, saveAnswers]);

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

					// 載入封面圖片
					try {
						const coverResponse = await formsGetFormCoverImage(formId, { credentials: "include" });
						if (coverResponse.status === 200 && coverResponse.data) {
							const blob = new Blob([coverResponse.data], { type: "image/webp" });
							const imageUrl = URL.createObjectURL(blob);
							setCoverImageUrl(imageUrl);
						}
					} catch (coverError) {
						console.error("載入封面圖片失敗:", coverError);
					}

					// 建立或取得表單回覆
					const responseCreation = await responsesCreateFormResponse(formId, { credentials: "include" });
					if (responseCreation.status === 201) {
						setResponseId(responseCreation.data.id);

						// 已有回覆資料
						if (responseCreation.data.id) {
							const existingResponse = await responsesGetFormResponse(formId, responseCreation.data.id, { credentials: "include" });
							if (existingResponse.status === 200) {
								// 儲存預覽資料和進度
								setPreviewData(existingResponse.data.sections);
								setResponseProgress(existingResponse.data.progress);

								// 載入已儲存的答案
								const loadedAnswers: Record<string, string> = {};
								existingResponse.data.sections.forEach(section => {
									section.answerDetails.forEach(detail => {
										if (detail.question.id && detail.payload.displayValue) {
											loadedAnswers[detail.question.id] = detail.payload.displayValue;
										}
									});
								});
								setAnswers(loadedAnswers);
							}

							// 載入 sections 和 questions
							const sectionsResponse = await formsListSections(formId, { credentials: "include" });
							if (sectionsResponse.status === 200) {
								const loadedSections: Section[] = sectionsResponse.data.flatMap(item =>
									item.sections.map(section => ({
										id: section.id,
										formId: section.formId,
										title: section.title,
										description: section.description,
										progress: "DRAFT" as const,
										questions: section.questions
									}))
								);

								loadedSections.push({
									id: "preview",
									formId: formId,
									title: "填答結果預覽",
									progress: "DRAFT" as const,
									questions: []
								});
								setSections(loadedSections);
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

	useEffect(() => {
		return () => {
			if (coverImageUrl) {
				URL.revokeObjectURL(coverImageUrl);
			}
		};
	}, [coverImageUrl]);

	useEffect(() => {
		const loadPreviewData = async () => {
			if (currentStep === sections.length - 1 && sections[currentStep]?.id === "preview" && formId && responseId) {
				try {
					const response = await responsesGetFormResponse(formId, responseId, { credentials: "include" });
					if (response.status === 200) {
						setPreviewData(response.data.sections);
						setResponseProgress(response.data.progress);
					}
				} catch (error) {
					console.error("載入預覽資料失敗:", error);
				}
			}
		};

		loadPreviewData();
	}, [currentStep, sections, formId, responseId]);

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

	const renderPreviewSection = () => {
		if (!previewData || previewData.length === 0) {
			return <p style={{ color: "var(--color-caption)" }}>尚無填答資料</p>;
		}

		return (
			<div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
				{previewData.map((section, sectionIndex) => (
					<div key={sectionIndex} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
						<h3>{section.title}</h3>
						<ul style={{ listStyleType: "disc", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
							{section.answerDetails.map((detail, questionIndex) => (
								<li key={questionIndex}>
									<span style={{ fontWeight: 500 }}>
										{detail.question.title}
										{detail.question.required && <span style={{ color: "red" }}> *</span>}
									</span>
									<span>：</span>
									<span>{detail.payload.displayValue || <span>未填寫</span>}</span>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (currentStep === sections.length - 1 && responseId) {
			try {
				await saveAnswers();
				const submitResponse = await responsesSubmitFormResponse(
					responseId,
					{
						answers: []
					},
					{ credentials: "include" }
				);

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
						<p className={styles.successMessage}>{form?.messageAfterSubmission}</p>
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
			{coverImageUrl && <img src={coverImageUrl} className={styles.cover} alt="Form Cover" />}
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
							<button key={section.id} type="button" className={`${styles.workflowButton} ${index === currentStep ? styles.active : ""}`} onClick={() => handleSectionClick(index)}>
								{section.title}
							</button>
						))}
					</div>
				</div>

				<form className={styles.form} onSubmit={handleSubmit}>
					{sections[currentStep] && (
						<div className={styles.section}>
							<div className={styles.fields}>
								{sections[currentStep].id === "preview" ? (
									renderPreviewSection()
								) : (
									<>
										{sections[currentStep].questions?.map(question => renderQuestion(question))}
										{(!sections[currentStep].questions || sections[currentStep].questions.length === 0) && <p style={{ color: "var(--color-caption)" }}>此 section 目前沒有問題</p>}
									</>
								)}
							</div>
						</div>
					)}

					<div className={styles.navigation}>
						<Button type="button" onClick={handlePrevious} disabled={isFirstStep} themeColor="var(--foreground)">
							上一頁
						</Button>
						{isLastStep ? (
							<Button type="submit" disabled={responseProgress === "DRAFT"}>
								{responseProgress === "SUBMITTED" ? "已送出" : "送出"}
							</Button>
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
