import { useFormResponses } from "@/features/form/hooks/useFormResponses";
import { useUpdateForm } from "@/features/form/hooks/useOrgForms";
import { Button, Input, LoadingSpinner, Switch, useToast } from "@/shared/components";
import type { FormsForm } from "@nycu-sdc/core-system-sdk";
import { useState } from "react";
import styles from "./InfoPage.module.css";

interface AdminFormInfoPageProps {
	formData: FormsForm;
}

export const AdminFormInfoPage = ({ formData }: AdminFormInfoPageProps) => {
	const { pushToast } = useToast();
	const responsesQuery = useFormResponses(formData.id);
	const updateFormMutation = useUpdateForm(formData.id);

	// derive counts
	const allResponses = responsesQuery.data?.responses ?? [];
	const submittedCount = allResponses.length;

	// local draft state for settings
	const [confirmMsg, setConfirmMsg] = useState(formData.messageAfterSubmission ?? "");
	const [deadline, setDeadline] = useState(formData.deadline ? formData.deadline.split("T")[0] : "");
	const [publishTime, setPublishTime] = useState(formData.publishTime ? formData.publishTime.split("T")[0] : "");

	const handleSave = () => {
		updateFormMutation.mutate(
			{
				messageAfterSubmission: confirmMsg,
				deadline: deadline ? new Date(deadline).toISOString() : undefined,
				publishTime: publishTime ? new Date(publishTime).toISOString() : undefined
			},
			{
				onSuccess: () => pushToast({ title: "儲存成功", variant: "success" }),
				onError: e => pushToast({ title: "儲存失敗", description: (e as Error).message, variant: "error" })
			}
		);
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
					<p className={`${styles.label}`}>需登入（收集電子郵件）</p>
					<Switch />
				</div>
				<div className={`${styles.switch}`}>
					<p className={`${styles.label}`}>允許編輯回覆</p>
					<Switch />
				</div>
				<div className={`${styles.switch}`}>
					<p className={`${styles.label}`}>所有問題設為必填</p>
					<Switch />
				</div>
				<div style={{ marginTop: "1rem" }}>
					<Button onClick={handleSave} processing={updateFormMutation.isPending}>
						儲存設定
					</Button>
				</div>
			</div>
		</>
	);
};
