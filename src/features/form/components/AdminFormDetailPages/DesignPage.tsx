import { useFormFonts, useUpdateForm, useUploadFormCoverImage } from "@/features/form/hooks/useOrgForms";
import { Button, ColorPicker, FileUpload, Input, LoadingSpinner, useToast } from "@/shared/components";
import type { FormsForm } from "@nycu-sdc/core-system-sdk";
import { useState } from "react";
import styles from "./DesignPage.module.css";

interface AdminFormDesignPageProps {
	formData: FormsForm;
}

export const AdminFormDesignPage = ({ formData }: AdminFormDesignPageProps) => {
	const { pushToast } = useToast();
	const fontsQuery = useFormFonts();
	const updateFormMutation = useUpdateForm(formData.id);
	const uploadCoverMutation = useUploadFormCoverImage(formData.id);

	const [color, setColor] = useState(formData.dressing?.color ?? "#ff5555");
	const [headerFont, setHeaderFont] = useState(formData.dressing?.headerFont ?? "");
	const [questionFont, setQuestionFont] = useState(formData.dressing?.questionFont ?? "");
	const [textFont, setTextFont] = useState(formData.dressing?.textFont ?? "");

	const handleSaveDressing = () => {
		updateFormMutation.mutate(
			{ dressing: { color, headerFont, questionFont, textFont } },
			{
				onSuccess: () => pushToast({ title: "外觀已儲存", variant: "success" }),
				onError: e => pushToast({ title: "儲存失敗", description: (e as Error).message, variant: "error" })
			}
		);
	};

	const handleCoverUpload = (file: File | null) => {
		if (!file) return;
		uploadCoverMutation.mutate(file, {
			onSuccess: () => pushToast({ title: "封面圖片已上傳", variant: "success" }),
			onError: e => pushToast({ title: "上傳失敗", description: (e as Error).message, variant: "error" })
		});
	};

	return (
		<>
			<section className={styles.container}>
				<div>
					<p className={styles.label}>主題顏色</p>
					<ColorPicker value={color} onChange={setColor} allowCustom={false} />
				</div>
				<FileUpload label="封面圖片" onChange={handleCoverUpload} />
				{uploadCoverMutation.isPending && <LoadingSpinner />}
				<h3>表單外觀</h3>
				{fontsQuery.isLoading ? (
					<LoadingSpinner />
				) : (
					<>
						<Input label="頁首字體" type="text" placeholder="請輸入字體 ID，例如 jfOpenHuninn" value={headerFont} onChange={e => setHeaderFont(e.target.value)} list="font-list" />
						<Input label="問題字體" type="text" placeholder="請輸入字體 ID" value={questionFont} onChange={e => setQuestionFont(e.target.value)} list="font-list" />
						<Input label="文字字體" type="text" placeholder="請輸入字體 ID" value={textFont} onChange={e => setTextFont(e.target.value)} list="font-list" />
						<datalist id="font-list">
							{(fontsQuery.data ?? []).map(f => (
								<option key={f.id} value={f.id} label={f.name} />
							))}
						</datalist>
					</>
				)}
				<blockquote className={styles.blockquote}>
					<p className={styles.quote}>
						您可以從{" "}
						<a className={styles.link} href="https://font.emtech.cc/" target="_blank" rel="noopener noreferrer">
							emfont
						</a>{" "}
						尋找適合的字體。
					</p>
				</blockquote>
				<Button onClick={handleSaveDressing} processing={updateFormMutation.isPending}>
					儲存外觀設定
				</Button>
			</section>
		</>
	);
};
