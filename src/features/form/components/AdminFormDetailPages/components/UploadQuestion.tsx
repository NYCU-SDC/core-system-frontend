import { Select } from "@/shared/components/Select/Select";
import styles from "./UploadQuestion.module.css";

export const UploadQuestion = () => {
	return (
		<>
			<div className={styles.wrapper}>
				<p>檔案類型</p>
				<Select
					options={[
						{ label: "圖片", value: ".jpg,.jpeg,.png,.webp,.gif,.tiff,.bmp,.heic,.raw" },
						{ label: "文件", value: ".txt,.md,.doc,.docx,.odt,.rtf" },
						{ label: "簡報", value: ".ppt,.pptx,.odp" },
						{ label: "試算表", value: ".xls,.xlsx,.ods,.csv" },
						{ label: "設計圖", value: ".svg,.ai,.eps" },
						{ label: "PDF", value: ".pdf" },
						{ label: "影片", value: ".mp4,.mov,.avi,.mkv,.webm" },
						{ label: "音訊", value: ".mp3,.wav,.aac,.flac,.ogg,.m4a" },
						{ label: "壓縮檔", value: ".zip" }
					]}
					defaultValue=".jpg,.jpeg,.png,.webp,.gif,.tiff,.bmp,.heic,.raw"
				></Select>
			</div>
			<div className={styles.wrapper}>
				<p>檔案數量上限</p>
				<Select
					options={(() => {
						const opts = [];
						for (let i = 1; i <= 10; i++) {
							opts.push({ label: i.toString(), value: i.toString() });
						}
						return opts;
					})()}
					defaultValue="1"
				></Select>
			</div>
			<div className={styles.wrapper}>
				<p>檔案大小上限</p>
				<Select
					options={[
						{ label: "1 MB", value: "1" },
						{ label: "5 MB", value: "5" },
						{ label: "10 MB", value: "10" },
						{ label: "100 MB", value: "100" },
						{ label: "1 GB", value: "1024" }
					]}
					defaultValue="1"
				></Select>
			</div>
		</>
	);
};
