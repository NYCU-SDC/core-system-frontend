import { ColorPicker, FileUpload, Input } from "@/shared/components";
import { useState } from "react";
import styles from "./DesignPage.module.css";

export const AdminFormDesignPage = () => {
	const [selectedColor, setSelectedColor] = useState("#ff5555");
	return (
		<>
			<section className={styles.container}>
				<div>
					<p className={styles.label}>主題顏色</p>
					<ColorPicker value={selectedColor} onChange={setSelectedColor} allowCustom={false} />
				</div>
				<FileUpload label="封面圖片" />
				<h3>表單外觀</h3>
				<Input label="頁首字體" type="text" placeholder="請輸入文字" />
				<Input label="問題字體" type="text" placeholder="請輸入文字" />
				<Input label="文字字體" type="text" placeholder="請輸入文字" />

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
