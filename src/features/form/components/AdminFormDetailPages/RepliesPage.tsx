import { useUpdateForm } from "@/features/form/hooks/useOrgForms";
import { Badge, Button, Input, Label, useToast } from "@/shared/components";
import type { FormsForm } from "@nycu-sdc/core-system-sdk";
import { formsGetGoogleSheetEmail, formsVerifyGoogleSheet } from "@nycu-sdc/core-system-sdk";
import { Repeat2, SquareArrowOutUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./RepliesPage.module.css";

interface AdminFormRepliesPageProps {
	formData: FormsForm;
}

export const AdminFormRepliesPage = ({ formData }: AdminFormRepliesPageProps) => {
	const { pushToast } = useToast();
	const [email, setEmail] = useState<string>("");
	const [sheetUrl, setSheetUrl] = useState<string>(formData.googleSheetUrl || "");
	const [isVerifying, setIsVerifying] = useState(false);
	const [isVerified, setIsVerified] = useState(!!formData.googleSheetUrl);
	const [isLoading, setIsLoading] = useState(true);

	const updateFormMutation = useUpdateForm(formData.id);

	useEffect(() => {
		// Fetch the Google Sheet email on component mount
		const fetchEmail = async () => {
			try {
				const response = await formsGetGoogleSheetEmail();
				setEmail(response.data.email);
			} catch (error) {
				console.error("Failed to fetch Google Sheet email:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEmail();
	}, []);

	// 同步表單資料中的 googleSheetUrl
	useEffect(() => {
		setSheetUrl(formData.googleSheetUrl || "");
		setIsVerified(!!formData.googleSheetUrl);
	}, [formData.googleSheetUrl]);

	const handleVerifySheet = async () => {
		if (!sheetUrl.trim()) {
			pushToast({
				title: "請輸入 Google Sheets URL",
				variant: "warning"
			});
			return;
		}

		setIsVerifying(true);
		try {
			const response = await formsVerifyGoogleSheet({
				googleSheetUrl: sheetUrl
			});

			if (response.data.isValid) {
				// 使用 mutation 更新表單，會自動更新快取
				updateFormMutation.mutate(
					{ googleSheetUrl: sheetUrl },
					{
						onSuccess: () => {
							setIsVerified(true);
							pushToast({
								title: "Google Sheets 連結成功！",
								variant: "success"
							});
						},
						onError: error => {
							console.error("Failed to update form:", error);
							pushToast({
								title: "儲存失敗",
								description: "請稍後再試。",
								variant: "error"
							});
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
		} catch (error) {
			console.error("Failed to verify Google Sheet:", error);
			pushToast({
				title: "驗證失敗",
				description: "請稍後再試。",
				variant: "error"
			});
		} finally {
			setIsVerifying(false);
		}
	};

	const handleViewSheet = () => {
		if (!sheetUrl.trim()) {
			pushToast({
				title: "請先輸入並驗證 Google Sheets URL",
				variant: "warning"
			});
			return;
		}
		window.open(sheetUrl, "_blank");
	};

	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<h2>回覆蒐集</h2>
				<Badge className={styles.status} variant={isVerified ? "success" : "default"} showDot={isVerified}>
					{isVerified ? "已連結 Google Sheets" : "未連結"}
				</Badge>
			</div>
			<p>請將以下服務帳號加入您的 Google Sheets 編輯權限：</p>
			<div className={styles.emailBlock}>
				<code>{isLoading ? "載入中..." : email}</code>
			</div>

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
	);
};
