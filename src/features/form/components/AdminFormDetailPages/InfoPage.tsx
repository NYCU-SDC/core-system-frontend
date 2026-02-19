import { useActiveOrgSlug } from "@/features/dashboard/hooks/useOrgSettings";
import { useFormResponses } from "@/features/form/hooks/useFormResponses";
import { useArchiveForm, useDeleteForm, useUpdateForm } from "@/features/form/hooks/useOrgForms";
import { useSections } from "@/features/form/hooks/useSections";
import * as api from "@/features/form/services/api";
import { Button, Input, LoadingSpinner, Switch, Tooltip, useToast } from "@/shared/components";
import type { FormsForm } from "@nycu-sdc/core-system-sdk";
import { Archive, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./InfoPage.module.css";

interface AdminFormInfoPageProps {
	formData: FormsForm;
}

export const AdminFormInfoPage = ({ formData }: AdminFormInfoPageProps) => {
	const { pushToast } = useToast();
	const navigate = useNavigate();
	const orgSlug = useActiveOrgSlug();
	const responsesQuery = useFormResponses(formData.id);
	const updateFormMutation = useUpdateForm(formData.id);
	const archiveFormMutation = useArchiveForm(orgSlug);
	const deleteFormMutation = useDeleteForm(orgSlug);
	const sectionsQuery = useSections(formData.id);

	// derive counts
	const allResponses = responsesQuery.data?.responses ?? [];
	const submittedCount = allResponses.length;

	// derive all questions across all sections
	const allQuestions = useMemo(() => {
		if (!sectionsQuery.data) return [];
		return sectionsQuery.data.flatMap(item => {
			const sections = Array.isArray(item.sections) ? item.sections : [];
			return sections.flatMap(section => (section.questions ?? []).map(question => ({ sectionId: section.id, question })));
		});
	}, [sectionsQuery.data]);

	const allRequired = allQuestions.length > 0 && allQuestions.every(({ question: q }) => q.required);
	const [isSettingRequired, setIsSettingRequired] = useState(false);

	// local draft state for settings
	const [confirmMsg, setConfirmMsg] = useState(formData.messageAfterSubmission ?? "");
	const [deadline, setDeadline] = useState(formData.deadline ? formData.deadline.split("T")[0] : "");
	const [publishTime, setPublishTime] = useState(formData.publishTime ? formData.publishTime.split("T")[0] : "");
	const [isPublic, setIsPublic] = useState(formData.visibility === "PUBLIC");
	const isArchived = formData.status === "ARCHIVED";
	const initialConfirmMsg = formData.messageAfterSubmission ?? "";
	const initialDeadline = formData.deadline ? formData.deadline.split("T")[0] : "";
	const initialPublishTime = formData.publishTime ? formData.publishTime.split("T")[0] : "";
	const initialIsPublic = formData.visibility === "PUBLIC";
	const hasSettingChanges = confirmMsg !== initialConfirmMsg || deadline !== initialDeadline || publishTime !== initialPublishTime || isPublic !== initialIsPublic;

	const handleSave = () => {
		if (!hasSettingChanges) return;

		updateFormMutation.mutate(
			{
				messageAfterSubmission: confirmMsg,
				deadline: deadline ? new Date(deadline).toISOString() : undefined,
				publishTime: publishTime ? new Date(publishTime).toISOString() : undefined,
				visibility: isPublic ? "PUBLIC" : "PRIVATE"
			},
			{
				onSuccess: () => pushToast({ title: "儲存成功", variant: "success" }),
				onError: e => pushToast({ title: "儲存失敗", description: (e as Error).message, variant: "error" })
			}
		);
	};

	const handleToggleAllRequired = async (checked: boolean) => {
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
					description: q.description ?? "",
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

	const handleArchive = () => {
		archiveFormMutation.mutate(formData.id, {
			onSuccess: () => pushToast({ title: "已封存", variant: "success" }),
			onError: error => pushToast({ title: "封存失敗", description: (error as Error).message, variant: "error" })
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
							{responsesQuery.isLoading ? <LoadingSpinner /> : <h2 className={`${styles.value}`}>{submittedCount}</h2>}
							<p className={styles.value}>已提交</p>
						</div>
					</div>
				</section>
				<h3>表單設定</h3>
				<Input label="確認訊息" placeholder="輸入表單提交後顯示的訊息" value={confirmMsg} onChange={e => setConfirmMsg(e.target.value)} />
				<Input label="開始日期" type="date" value={publishTime} onChange={e => setPublishTime(e.target.value)} />
				<Input label="結束日期" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
				<div className={`${styles.switch}`}>
					<p className={`${styles.label}`}>公開表單（所有登入使用者可見）</p>
					<Switch checked={isPublic} onCheckedChange={setIsPublic} />
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
						<Switch checked disabled />
					</div>
				</Tooltip>
				<div className={`${styles.switch}`}>
					<p className={`${styles.label}`}>所有問題設為必填</p>
					{sectionsQuery.isLoading ? <LoadingSpinner /> : <Switch checked={allRequired} onCheckedChange={handleToggleAllRequired} disabled={isSettingRequired || allQuestions.length === 0} />}
				</div>
				<div style={{ marginTop: "1rem" }}>
					<Button onClick={handleSave} processing={updateFormMutation.isPending} disabled={!hasSettingChanges || updateFormMutation.isPending}>
						儲存設定
					</Button>
				</div>
				<div className={styles.dangerActions}>
					<Button onClick={handleArchive} disabled={archiveFormMutation.isPending || isArchived}>
						<Archive size={14} />
						{isArchived ? "已封存" : "封存"}
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
