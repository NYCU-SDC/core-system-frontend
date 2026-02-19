import { useFormFonts, useUpdateForm, useUploadFormCoverImage } from "@/features/form/hooks/useOrgForms";
import { ColorPicker, FileUpload, LoadingSpinner, SearchableSelect, useToast } from "@/shared/components";
import type { FormsForm } from "@nycu-sdc/core-system-sdk";
import { formsGetFormCoverImage } from "@nycu-sdc/core-system-sdk";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import styles from "./DesignPage.module.css";

interface AdminFormDesignPageProps {
	formData: FormsForm;
}

export const AdminFormDesignPage = ({ formData }: AdminFormDesignPageProps) => {
	const { pushToast } = useToast();
	const fontsQuery = useFormFonts();
	const updateFormMutation = useUpdateForm(formData.id);
	const uploadCoverMutation = useUploadFormCoverImage(formData.id);

	// Fetch existing cover image
	const coverQuery = useQuery({
		queryKey: ["form", formData.id, "cover"],
		queryFn: async () => {
			const res = await formsGetFormCoverImage(formData.id, { credentials: "include" });
			if (res.status === 200 && res.data) {
				const blob = new Blob([res.data], { type: "image/webp" });
				return URL.createObjectURL(blob);
			}
			return null;
		},
		staleTime: Infinity,
		gcTime: 0
	});

	// Revoke blob URL on unmount
	useEffect(() => {
		const url = coverQuery.data;
		return () => {
			if (url) URL.revokeObjectURL(url);
		};
	}, [coverQuery.data]);

	const [color, setColor] = useState(formData.dressing?.color ?? "#ff5555");
	const [headerFont, setHeaderFont] = useState(formData.dressing?.headerFont ?? "");
	const [questionFont, setQuestionFont] = useState(formData.dressing?.questionFont ?? "");
	const [textFont, setTextFont] = useState(formData.dressing?.textFont ?? "");
	const [savedDressing, setSavedDressing] = useState({
		color: formData.dressing?.color ?? "#ff5555",
		headerFont: formData.dressing?.headerFont ?? "",
		questionFont: formData.dressing?.questionFont ?? "",
		textFont: formData.dressing?.textFont ?? ""
	});

	const hasDressingChanges = color !== savedDressing.color || headerFont !== savedDressing.headerFont || questionFont !== savedDressing.questionFont || textFont !== savedDressing.textFont;

	useEffect(() => {
		if (!hasDressingChanges) return;

		const nextDressing = { color, headerFont, questionFont, textFont };
		const timerId = window.setTimeout(() => {
			updateFormMutation.mutate(
				{ dressing: nextDressing },
				{
					onSuccess: () => setSavedDressing(nextDressing),
					onError: e => pushToast({ title: "儲存失敗", description: (e as Error).message, variant: "error" })
				}
			);
		}, 500);

		return () => window.clearTimeout(timerId);
	}, [color, headerFont, questionFont, textFont, hasDressingChanges, updateFormMutation, pushToast]);

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
				{coverQuery.data && (
					<div>
						<p className={styles.label}>目前封面圖片</p>
						<img src={coverQuery.data} alt="Current cover" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "0.5rem", objectFit: "cover" }} />
					</div>
				)}
				<FileUpload label="封面圖片（格式只支援 Webp）" onChange={handleCoverUpload} />
				{uploadCoverMutation.isPending && <LoadingSpinner />}
				<h3>表單外觀</h3>
				{fontsQuery.isLoading ? (
					<LoadingSpinner />
				) : (
					<>
						<SearchableSelect
							label="頁首字體"
							placeholder="搜尋字體名稱或 ID..."
							options={(fontsQuery.data ?? []).map(f => ({ value: f.id, label: `${f.name} (${f.id})` }))}
							value={headerFont || undefined}
							onValueChange={v => setHeaderFont(v)}
						/>
						<SearchableSelect
							label="問題字體"
							placeholder="搜尋字體名稱或 ID..."
							options={(fontsQuery.data ?? []).map(f => ({ value: f.id, label: `${f.name} (${f.id})` }))}
							value={questionFont || undefined}
							onValueChange={v => setQuestionFont(v)}
						/>
						<SearchableSelect
							label="文字字體"
							placeholder="搜尋字體名稱或 ID..."
							options={(fontsQuery.data ?? []).map(f => ({ value: f.id, label: `${f.name} (${f.id})` }))}
							value={textFont || undefined}
							onValueChange={v => setTextFont(v)}
						/>
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
			</section>
		</>
	);
};
