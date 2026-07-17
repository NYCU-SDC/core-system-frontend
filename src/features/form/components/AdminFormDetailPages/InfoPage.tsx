import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useClearFormHighlight, useFormHighlight, useSetFormHighlight, useUpdateFormHighlight } from "@/features/form/hooks/useFormHighlight";
import { useFormResponses } from "@/features/form/hooks/useFormResponses";
import { useArchiveForm, useDeleteForm, useUnarchiveForm, useUpdateForm } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import * as api from "@/features/form/services/api";
import { Button, Input, LoadingSpinner, MarkdownEditor, SearchableSelect, Switch, Tooltip, useToast } from "@/shared/components";
import { EMPTY_PROSE_MIRROR_DOC, fromApiProseMirror, serializeProseMirrorDoc, toApiProseMirror } from "@/shared/utils/proseMirror";
import type { FormsFormRequestUpdate, FormsFormResponse, ProseMirrorDocumentUpdate } from "@nycu-sdc/core-system-sdk";
import { Archive, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./InfoPage.module.css";

interface AdminFormInfoPageProps {
	formData: FormsFormResponse;
}

type HighlightDraft = {
	baseKey: string;
	isOpen: boolean;
	title: string;
	sectionId: string;
	questionId: string;
};

export const AdminFormInfoPage = ({ formData }: AdminFormInfoPageProps) => {
	const { pushToast } = useToast();
	const navigate = useNavigate();
	const orgSlug = useActiveOrgSlug();
	const responsesQuery = useFormResponses(formData.id);
	const updateFormMutation = useUpdateForm(formData.id);
	const archiveFormMutation = useArchiveForm(orgSlug);
	const unarchiveFormMutation = useUnarchiveForm(orgSlug);
	const deleteFormMutation = useDeleteForm(orgSlug);
	const sectionsQuery = useSections(formData.id);
	const highlightQuery = useFormHighlight(formData.id);
	const setHighlightMutation = useSetFormHighlight(formData.id);
	const updateHighlightMutation = useUpdateFormHighlight(formData.id);
	const clearHighlightMutation = useClearFormHighlight(formData.id);
	const sendResponseEmailSupported = "sendResponseEmail" in formData;
	const sendResponseEmailWarningShownRef = useRef(false);

	// derive counts
	const totalResponseCount = responsesQuery.data?.totalCount ?? 0;
	const draftResponseCount = responsesQuery.data?.draftCount ?? 0;
	const submittedResponseCount = responsesQuery.data?.submittedCount ?? 0;

	// derive all questions across all sections
	const allQuestions = useMemo(
		() => sectionsQuery.data?.flatMap(group => group.questions?.map(question => ({ question: { ...question }, sectionId: group.section.id })) ?? []) ?? [],
		[sectionsQuery.data]
	);

	const allRequired = allQuestions.length > 0 && allQuestions.every(q => q.question.required);
	const [isSettingRequired, setIsSettingRequired] = useState(false);
	const [highlightDraft, setHighlightDraft] = useState<HighlightDraft | null>(null);
	const highlightQuestionId = highlightQuery.data?.questionId ?? "";
	const highlightBaseTitle = highlightQuery.data?.displayTitle ?? highlightQuery.data?.questionTitle ?? "";
	const highlightDraftBaseKey = [highlightQuestionId || "none", highlightQuery.data?.questionTitle ?? "", highlightQuery.data?.displayTitle ?? ""].join("|");
	const activeHighlightDraft = highlightDraft?.baseKey === highlightDraftBaseKey ? highlightDraft : null;
	const highlightIsConfigured = !!highlightQuestionId;
	const highlightConfiguredSectionId = useMemo(() => {
		if (!highlightQuestionId) return "";
		return sectionsQuery.data?.find(bundle => bundle.questions?.some(question => question.id === highlightQuestionId))?.section.id ?? "";
	}, [highlightQuestionId, sectionsQuery.data]);
	const isHighlightEditorOpen = activeHighlightDraft?.isOpen ?? highlightIsConfigured;
	const highlightTitle = activeHighlightDraft?.title ?? highlightBaseTitle;
	const selectedHighlightSectionId = activeHighlightDraft?.sectionId ?? highlightConfiguredSectionId;
	const selectedHighlightQuestionId = activeHighlightDraft?.questionId ?? highlightQuestionId;
	const sectionOptions = useMemo(() => sectionsQuery.data?.map(bundle => ({ value: bundle.section.id, label: bundle.section.title || "未命名區段" })) ?? [], [sectionsQuery.data]);
	const selectedHighlightSection = useMemo(() => sectionsQuery.data?.find(bundle => bundle.section.id === selectedHighlightSectionId), [sectionsQuery.data, selectedHighlightSectionId]);
	const highlightQuestionOptions = useMemo(
		() => selectedHighlightSection?.questions?.map((question, index) => ({ value: question.id, label: `Q${index + 1} ${question.title || "未命名問題"}` })) ?? [],
		[selectedHighlightSection]
	);
	const selectedHighlightQuestion = useMemo(
		() => selectedHighlightSection?.questions?.find(question => question.id === selectedHighlightQuestionId),
		[selectedHighlightQuestionId, selectedHighlightSection]
	);
	const selectedHighlightQuestionTitle = selectedHighlightQuestion?.title ?? (highlightQuery.data?.questionId === selectedHighlightQuestionId ? (highlightQuery.data.questionTitle ?? "") : "");
	const canResetHighlightTitle = !!selectedHighlightQuestionTitle && highlightTitle !== selectedHighlightQuestionTitle;
	const highlightChoiceStats = useMemo(() => {
		if (highlightQuery.data?.questionId === selectedHighlightQuestionId) {
			return highlightQuery.data.choices.map(choice => ({
				id: choice.choiceId,
				title: choice.name,
				count: choice.count
			}));
		}

		return (
			selectedHighlightQuestion?.choices?.map(choice => ({
				id: choice.id,
				title: choice.name,
				count: 0
			})) ?? []
		);
	}, [highlightQuery.data, selectedHighlightQuestion, selectedHighlightQuestionId]);
	const highlightHasManyChoices = highlightChoiceStats.length > 4;
	const highlightIsPending = setHighlightMutation.isPending || updateHighlightMutation.isPending || clearHighlightMutation.isPending;
	const updateHighlightDraft = (patch: Partial<Omit<HighlightDraft, "baseKey">>) => {
		setHighlightDraft(current => ({
			baseKey: highlightDraftBaseKey,
			isOpen: current?.baseKey === highlightDraftBaseKey ? current.isOpen : isHighlightEditorOpen,
			title: current?.baseKey === highlightDraftBaseKey ? current.title : highlightTitle,
			sectionId: current?.baseKey === highlightDraftBaseKey ? current.sectionId : selectedHighlightSectionId,
			questionId: current?.baseKey === highlightDraftBaseKey ? current.questionId : selectedHighlightQuestionId,
			...patch
		}));
	};

	// local draft state for settings
	const [title, setTitle] = useState(formData.title ?? "");
	const [description, setDescription] = useState(() => fromApiProseMirror(formData.description));
	const [confirmMsg, setConfirmMsg] = useState(formData.messageAfterSubmission ?? "");
	const [deadline, setDeadline] = useState(formData.deadline ? formData.deadline.split("T")[0] : "");
	const [publishTime, setPublishTime] = useState(formData.publishTime ? formData.publishTime.split("T")[0] : "");
	const [allowEditResponse, setAllowEditResponse] = useState(formData.allowEditResponse ?? false);
	const [isPublic, setIsPublic] = useState(formData.visibility === "PUBLIC");
	const [sendResponseEmail, setSendResponseEmail] = useState(sendResponseEmailSupported ? ((formData as FormsFormResponse & { sendResponseEmail?: boolean }).sendResponseEmail ?? false) : false);
	const [savedTitle, setSavedTitle] = useState(formData.title ?? "");
	const [savedDescription, setSavedDescription] = useState(() => serializeProseMirrorDoc(fromApiProseMirror(formData.description)));
	const [savedConfirmMsg, setSavedConfirmMsg] = useState(formData.messageAfterSubmission ?? "");
	const [savedDeadline, setSavedDeadline] = useState(formData.deadline ? formData.deadline.split("T")[0] : "");
	const [savedPublishTime, setSavedPublishTime] = useState(formData.publishTime ? formData.publishTime.split("T")[0] : "");
	const [savedIsPublic, setSavedIsPublic] = useState(formData.visibility === "PUBLIC");
	const isArchived = formData.status === "ARCHIVED";
	const serializedDescription = serializeProseMirrorDoc(description);
	const hasSettingChanges =
		title !== savedTitle ||
		serializedDescription !== savedDescription ||
		confirmMsg !== savedConfirmMsg ||
		deadline !== savedDeadline ||
		publishTime !== savedPublishTime ||
		isPublic !== savedIsPublic ||
		allowEditResponse !== formData.allowEditResponse;
	const sendResponseEmailDisabled = !sendResponseEmailSupported || isArchived || updateFormMutation.isPending;

	useEffect(() => {
		if (sendResponseEmailSupported) {
			sendResponseEmailWarningShownRef.current = false;
			return;
		}
		if (sendResponseEmailWarningShownRef.current) return;

		sendResponseEmailWarningShownRef.current = true;
		pushToast({
			title: "通知設定暫不可用",
			description: "後端尚未回傳寄送確認信設定，已暫時停用此開關。",
			variant: "warning"
		});
	}, [sendResponseEmailSupported, pushToast]);

	useEffect(() => {
		if (!hasSettingChanges || updateFormMutation.isPending || isArchived) return;

		const timerId = window.setTimeout(() => {
			updateFormMutation.mutate(
				{
					title,
					description: toApiProseMirror(description) as unknown as ProseMirrorDocumentUpdate,
					messageAfterSubmission: confirmMsg,
					deadline: deadline ? new Date(deadline).toISOString() : undefined,
					publishTime: publishTime ? new Date(publishTime).toISOString() : undefined,
					visibility: isPublic ? "PUBLIC" : "PRIVATE",
					allowEditResponse: allowEditResponse
				},
				{
					onSuccess: () => {
						setSavedTitle(title);
						setSavedDescription(serializedDescription);
						setSavedConfirmMsg(confirmMsg);
						setSavedDeadline(deadline);
						setSavedPublishTime(publishTime);
						setSavedIsPublic(isPublic);
					},
					onError: e => pushToast({ title: "儲存失敗", description: (e as Error).message, variant: "error" })
				}
			);
		}, 500);

		return () => window.clearTimeout(timerId);
	}, [
		hasSettingChanges,
		updateFormMutation.isPending,
		updateFormMutation,
		title,
		description,
		serializedDescription,
		confirmMsg,
		deadline,
		publishTime,
		allowEditResponse,
		isPublic,
		pushToast,
		isArchived
	]);

	const handleStartHighlightSetup = () => {
		if (isArchived) return;
		updateHighlightDraft({ isOpen: true });
	};

	const handleHighlightSectionChange = (sectionId: string) => {
		updateHighlightDraft({ sectionId, questionId: "" });
	};

	const handleSaveHighlight = () => {
		if (!selectedHighlightQuestionId) {
			pushToast({ title: "請先選擇精選問題", variant: "warning" });
			return;
		}

		const displayTitle = highlightTitle.trim() ? highlightTitle.trim() : null;
		const currentQuestionId = highlightQuery.data?.questionId ?? null;
		const mutationOptions = {
			onSuccess: () => pushToast({ title: "精選問題已儲存", variant: "success" }),
			onError: (error: Error) => pushToast({ title: "精選問題儲存失敗", description: error.message, variant: "error" })
		};

		if (currentQuestionId !== selectedHighlightQuestionId) {
			setHighlightMutation.mutate({ questionId: selectedHighlightQuestionId, displayTitle }, mutationOptions);
			return;
		}

		updateHighlightMutation.mutate({ displayTitle }, mutationOptions);
	};

	const handleClearHighlight = () => {
		clearHighlightMutation.mutate(undefined, {
			onSuccess: () => {
				updateHighlightDraft({ isOpen: false, title: "", sectionId: "", questionId: "" });
				pushToast({ title: "精選問題已清除", variant: "success" });
			},
			onError: error => pushToast({ title: "精選問題清除失敗", description: error.message, variant: "error" })
		});
	};

	const handleToggleAllRequired = async (checked: boolean) => {
		if (isArchived) return;
		if (allQuestions.length === 0) {
			pushToast({ title: "此表單沒有題目", variant: "warning" });
			return;
		}
		setIsSettingRequired(true);
		const results = await Promise.allSettled(
			allQuestions.map(({ sectionId, question: q }, idx) =>
				api.updateQuestion(sectionId, q.id, {
					required: checked,
					type: q.type,
					title: q.title,
					description: q.description ?? EMPTY_PROSE_MIRROR_DOC,
					order: (q as unknown as { order?: number }).order ?? idx,
					...(q.choices ? { choices: q.choices } : {}),
					...(q.scale ? { scale: q.scale } : {}),
					...(q.uploadFile ? { uploadFile: q.uploadFile } : {}),
					...(q.date ? { date: q.date } : {})
				})
			)
		);
		setIsSettingRequired(false);
		const failed = results.filter(r => r.status === "rejected").length;
		if (failed === 0) {
			pushToast({ title: checked ? "已將所有題目設為必填" : "已將所有題目設為非必填", variant: "success" });
			sectionsQuery.refetch();
		} else {
			pushToast({ title: `${failed} 題更新失敗`, description: "部分題目更新時發生錯誤", variant: "error" });
			sectionsQuery.refetch();
		}
	};

	const handleToggleSendResponseEmail = (checked: boolean) => {
		if (!sendResponseEmailSupported) {
			pushToast({
				title: "通知設定暫不可用",
				description: "後端尚未回傳寄送確認信設定，無法變更此開關。",
				variant: "warning"
			});
			return;
		}
		if (isArchived) return;
		const previousValue = sendResponseEmail;
		setSendResponseEmail(checked);
		updateFormMutation.mutate({ sendResponseEmail: checked } as FormsFormRequestUpdate, {
			onError: error => {
				setSendResponseEmail(previousValue);
				pushToast({ title: "儲存通知設定失敗", description: (error as Error).message, variant: "error" });
			}
		});
	};

	const handleArchive = () => {
		archiveFormMutation.mutate(formData.id, {
			onSuccess: () => pushToast({ title: "已封存", variant: "success" }),
			onError: error => pushToast({ title: "封存失敗", description: (error as Error).message, variant: "error" })
		});
	};

	const handleUnarchive = () => {
		unarchiveFormMutation.mutate(formData.id, {
			onSuccess: () => pushToast({ title: "已解除封存", variant: "success" }),
			onError: error => pushToast({ title: "解除封存失敗", description: (error as Error).message, variant: "error" })
		});
	};

	const handleDelete = () => {
		const typedName = prompt(`請輸入表單名稱「${formData.title}」以確認刪除：`);
		if (typedName === null) return;
		if (typedName !== formData.title) {
			pushToast({ title: "刪除失敗", description: "輸入的表單名稱不正確", variant: "error" });
			return;
		}
		deleteFormMutation.mutate(formData.id, {
			onSuccess: () => {
				pushToast({ title: "已刪除", variant: "success" });
				navigate(`/orgs/${orgSlug}/forms`);
			},
			onError: error => pushToast({ title: "刪除失敗", description: (error as Error).message, variant: "error" })
		});
	};

	return (
		<>
			<div className={styles.container}>
				<h3>表單資訊</h3>
				<section className={styles.seciton}>
					<div className={`${styles.count}`}>
						<div className={`${styles.item}`}>
							{responsesQuery.isLoading ? <LoadingSpinner /> : <h2 className={`${styles.value}`}>{totalResponseCount}</h2>}
							<p className={styles.value}>總回覆數</p>
						</div>
						<div className={`${styles.item}`}>
							{responsesQuery.isLoading ? <LoadingSpinner /> : <h2 className={`${styles.value}`}>{draftResponseCount}</h2>}
							<p className={styles.value}>填寫中</p>
						</div>
						<div className={`${styles.item}`}>
							{responsesQuery.isLoading ? <LoadingSpinner /> : <h2 className={`${styles.value}`}>{submittedResponseCount}</h2>}
							<p className={styles.value}>已提交</p>
						</div>
					</div>
				</section>
				<section className={styles.highlightSection}>
					<div className={styles.highlightHeader}>
						<h3 className={styles.highlightTitle}>精選問題</h3>
						<div className={styles.highlightHeaderActions}>
							{isHighlightEditorOpen ? (
								<>
									<Button
										type="button"
										icon={Save}
										onClick={handleSaveHighlight}
										disabled={isArchived || highlightIsPending || !selectedHighlightQuestionId}
										processing={setHighlightMutation.isPending || updateHighlightMutation.isPending}
									>
										儲存
									</Button>
									{highlightIsConfigured && (
										<Button type="button" variant="secondary" onClick={handleClearHighlight} disabled={isArchived || highlightIsPending} processing={clearHighlightMutation.isPending}>
											清除
										</Button>
									)}
								</>
							) : (
								<button className={styles.addHighlightButton} type="button" onClick={handleStartHighlightSetup} disabled={isArchived} aria-label="新增精選問題">
									<Plus size={24} />
								</button>
							)}
						</div>
					</div>
					{isHighlightEditorOpen && (
						<div className={styles.highlightEditor}>
							<div className={styles.highlightTitleRow}>
								<Input
									className={styles.highlightInput}
									placeholder="顯示標題"
									value={highlightTitle}
									onChange={event => updateHighlightDraft({ title: event.target.value })}
									disabled={isArchived || highlightIsPending}
								/>
								<Button
									type="button"
									className={styles.highlightResetButton}
									icon={RotateCcw}
									onClick={() => updateHighlightDraft({ title: selectedHighlightQuestionTitle })}
									disabled={isArchived || highlightIsPending || !canResetHighlightTitle}
								>
									重置為問題標題
								</Button>
							</div>
							<div className={`${styles.highlightPickerRow} ${highlightHasManyChoices ? styles.highlightPickerRowStacked : ""}`}>
								<div className={styles.highlightStats}>
									{highlightQuery.isLoading ? (
										<LoadingSpinner />
									) : highlightChoiceStats.length > 0 ? (
										highlightChoiceStats.map(stat => (
											<div className={styles.highlightStat} key={stat.id}>
												<strong>{stat.count}</strong>
												<span>{stat.title}</span>
											</div>
										))
									) : (
										<p className={styles.highlightStatsEmpty}>選擇有選項的問題後顯示統計</p>
									)}
								</div>
								<div className={styles.highlightPickerControls}>
									<div className={styles.highlightSelect}>
										<SearchableSelect
											id="highlight-section-select"
											placeholder="Section 選擇"
											options={sectionOptions}
											value={selectedHighlightSectionId || undefined}
											onValueChange={handleHighlightSectionChange}
											disabled={isArchived || highlightIsPending || sectionsQuery.isLoading}
										/>
									</div>
									<div className={styles.highlightSelect}>
										<SearchableSelect
											id="highlight-question-select"
											placeholder="問題選擇"
											options={highlightQuestionOptions}
											value={selectedHighlightQuestionId || undefined}
											onValueChange={questionId => updateHighlightDraft({ questionId })}
											disabled={isArchived || highlightIsPending || !selectedHighlightSectionId}
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</section>
				<h3>表單設定</h3>
				<Input label="表單標題" placeholder="輸入表單標題" value={title} onChange={e => setTitle(e.target.value)} disabled={isArchived} />
				<MarkdownEditor label="表單描述" placeholder="輸入表單描述" value={description} onChange={setDescription} disabled={isArchived} />
				<Input label="確認訊息" placeholder="輸入表單提交後顯示的訊息" value={confirmMsg} onChange={e => setConfirmMsg(e.target.value)} disabled={isArchived} />
				<Input label="開始日期" type="date" value={publishTime} onChange={e => setPublishTime(e.target.value)} disabled={isArchived} />
				<Input label="結束日期" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} disabled={isArchived} />
				<div className={`${styles.switch}`}>
					<p className={`${styles.label}`}>公開表單（所有登入使用者可見）</p>
					<Switch checked={isPublic} onCheckedChange={setIsPublic} disabled={isArchived} />
				</div>
				<Tooltip content="目前所有表單均需登入才能填寫" side="right">
					<div className={`${styles.switch}`}>
						<p className={`${styles.label}`}>需登入才能填寫</p>
						<Switch checked disabled />
					</div>
				</Tooltip>
				<Tooltip content="目前所有回覆均允許編輯" side="right">
					<div className={`${styles.switch}`}>
						<p className={`${styles.label}`}>允許編輯回覆</p>
						{sectionsQuery.isLoading ? <LoadingSpinner /> : <Switch checked={allowEditResponse} onCheckedChange={setAllowEditResponse} disabled={isArchived} />}
					</div>
				</Tooltip>
				<Tooltip content={sendResponseEmailSupported ? "成功送出表單後寄送確認信給填寫者" : "後端尚未支援此設定，暫時無法調整"} side="right">
					<div className={`${styles.switch}`}>
						<p className={`${styles.label}`}>送出表單後寄送確認信</p>
						<Switch checked={sendResponseEmail} onCheckedChange={handleToggleSendResponseEmail} disabled={sendResponseEmailDisabled} />
					</div>
				</Tooltip>
				<div className={`${styles.switch}`}>
					<p className={`${styles.label}`}>所有問題設為必填</p>
					{sectionsQuery.isLoading ? (
						<LoadingSpinner />
					) : (
						<Switch checked={allRequired} onCheckedChange={handleToggleAllRequired} disabled={isArchived || isSettingRequired || allQuestions.length === 0} />
					)}
				</div>
				<div className={styles.dangerActions}>
					<Button onClick={isArchived ? handleUnarchive : handleArchive} disabled={archiveFormMutation.isPending || unarchiveFormMutation.isPending}>
						<Archive size={14} />
						{isArchived ? "解除封存" : "封存"}
					</Button>
					<Button themeColor="var(--red)" onClick={handleDelete} disabled={deleteFormMutation.isPending}>
						<Trash2 size={14} />
						刪除
					</Button>
				</div>
			</div>
		</>
	);
};
