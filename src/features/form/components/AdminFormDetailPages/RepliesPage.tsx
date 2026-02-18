import { useDeleteFormResponse, useFormResponses } from "@/features/form/hooks/useFormResponses";
import { useGoogleSheetEmail, useUpdateForm, useVerifyGoogleSheet } from "@/features/form/hooks/useOrgForms";
import { Badge, Button, ErrorMessage, Input, Label, LoadingSpinner, Markdown, useToast } from "@/shared/components";
import type { FormsForm } from "@nycu-sdc/core-system-sdk";
import { Repeat2, SquareArrowOutUpRight, Trash2 } from "lucide-react";
import { useState } from "react";
import styles from "./RepliesPage.module.css";

interface AdminFormRepliesPageProps {
	formData: FormsForm;
}

export const AdminFormRepliesPage = ({ formData }: AdminFormRepliesPageProps) => {
	const { pushToast } = useToast();
	const [sheetUrl, setSheetUrl] = useState<string>(formData.googleSheetUrl || "");
	const [isVerified, setIsVerified] = useState(!!formData.googleSheetUrl);

	const emailQuery = useGoogleSheetEmail();
	const updateFormMutation = useUpdateForm(formData.id);
	const verifyMutation = useVerifyGoogleSheet(formData.id);
	const responsesQuery = useFormResponses(formData.id);
	const deleteResponseMutation = useDeleteFormResponse(formData.id);

	// 同步表單資料中的 googleSheetUrl（derived state pattern，避免 useEffect setState 的 cascading render）
	const [prevGoogleSheetUrl, setPrevGoogleSheetUrl] = useState(formData.googleSheetUrl);
	if (formData.googleSheetUrl !== prevGoogleSheetUrl) {
		setSheetUrl(formData.googleSheetUrl || "");
		setIsVerified(!!formData.googleSheetUrl);
		setPrevGoogleSheetUrl(formData.googleSheetUrl);
	}

	const handleVerifySheet = () => {
		if (!sheetUrl.trim()) {
			pushToast({ title: "請輸入 Google Sheets URL", variant: "warning" });
			return;
		}

		verifyMutation.mutate(
			{ googleSheetUrl: sheetUrl },
			{
				onSuccess: result => {
					if (result.isValid) {
						updateFormMutation.mutate(
							{ googleSheetUrl: sheetUrl },
							{
								onSuccess: () => {
									setIsVerified(true);
									pushToast({ title: "Google Sheets 連結成功！", variant: "success" });
								},
								onError: error => {
									pushToast({ title: "儲存失敗", description: (error as Error).message, variant: "error" });
								}
							}
						);
					} else {
						pushToast({
							title: "無法驗證 Google Sheets",
							description: "請確認服務帳號已被授予編輯權限。",
							variant: "error"
						});
					}
				},
				onError: error => {
					pushToast({ title: "驗證失敗", description: (error as Error).message, variant: "error" });
				}
			}
		);
	};

	const handleViewSheet = () => {
		if (!sheetUrl.trim()) {
			pushToast({ title: "請先輸入並驗證 Google Sheets URL", variant: "warning" });
			return;
		}
		window.open(sheetUrl, "_blank");
	};

	const handleDeleteResponse = (responseId: string) => {
		deleteResponseMutation.mutate(responseId, {
			onSuccess: () => pushToast({ title: "已刪除回覆", variant: "success" }),
			onError: error => pushToast({ title: "刪除失敗", description: (error as Error).message, variant: "error" })
		});
	};

	const responses = responsesQuery.data?.responses ?? [];
	const isVerifying = verifyMutation.isPending || updateFormMutation.isPending;

	return (
		<>
			<div className={styles.container}>
				<div className={styles.wrapper}>
					<h2>回覆蒐集</h2>
					<Badge className={styles.status} variant={isVerified ? "success" : "default"} showDot={isVerified}>
						{isVerified ? "已連結 Google Sheets" : "未連結"}
					</Badge>
				</div>
				<p>請將以下服務帳號加入您的 Google Sheets 編輯權限：</p>
				{emailQuery.isLoading ? (
					<LoadingSpinner />
				) : emailQuery.isError ? (
					<ErrorMessage message={(emailQuery.error as Error)?.message ?? "無法載入服務帳號 Email"} />
				) : (
					<Markdown content={`\`\`\`\n${emailQuery.data?.email ?? ""}\n\`\`\``} />
				)}

				<div className={styles.formGroup}>
					<Label htmlFor="sheetUrl">Google Sheets 完整 URL</Label>
					<Input id="sheetUrl" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." />
				</div>

				<div className={styles.wrapper}>
					<Button className={styles.checkButton} variant="primary" onClick={handleVerifySheet} disabled={isVerifying}>
						<Repeat2 />
						{isVerifying ? "檢查中..." : "檢查狀態"}
					</Button>
					<Button variant="primary" onClick={handleViewSheet} disabled={!sheetUrl.trim()}>
						<SquareArrowOutUpRight />
						檢視表單
					</Button>
				</div>
			</div>

			<div className={styles.container}>
				<h2>收到的回覆</h2>
				{responsesQuery.isLoading && <LoadingSpinner />}
				{responsesQuery.isError && <ErrorMessage message={(responsesQuery.error as Error)?.message ?? "無法載入回覆列表"} />}
				{!responsesQuery.isLoading && responses.length === 0 && <p>尚無回覆。</p>}
				{responses.length > 0 && (
					<table className={styles.table}>
						<thead>
							<tr>
								<th>提交者 ID</th>
								<th>提交時間</th>
								<th>操作</th>
							</tr>
						</thead>
						<tbody>
							{responses.map(r => (
								<tr key={r.id}>
									<td>{r.submittedBy}</td>
									<td>{new Date(r.createdAt).toLocaleString("zh-TW")}</td>
									<td>
										<Button themeColor="var(--red)" onClick={() => handleDeleteResponse(r.id)} disabled={deleteResponseMutation.isPending}>
											<Trash2 size={16} />
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</>
	);
};
