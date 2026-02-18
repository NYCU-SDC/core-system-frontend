import { Input, Switch } from "@/shared/components";
import type { FormsForm } from "@nycu-sdc/core-system-sdk";
import styles from "./InfoPage.module.css";

interface AdminFormInfoPageProps {
	formData: FormsForm;
}

export const AdminFormInfoPage = ({ formData }: AdminFormInfoPageProps) => {
	return (
		<>
			<div className={styles.container}>
				<h3>表單資訊</h3>
				<section className={styles.seciton}>
					<div className={`${styles.count}`}>
						<div className={`${styles.item}`}>
							<h2 className={`${styles.value}`}>15</h2>
							<p className={styles.value}>填寫中</p>
						</div>
						<div className={`${styles.item}`}>
							<h2 className={`${styles.value}`}>20</h2>
							<p className={styles.value}>已提交</p>
						</div>
					</div>
				</section>
				<h3>表單設定</h3>
				<Input label="確認訊息" placeholder="輸入表單提交後顯示的訊息" defaultValue={formData.messageAfterSubmission || ""} />
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
				<div className={`${styles.switch}`}>
					<p className={`${styles.label}`}>限定回答時間</p>
					<Switch />
				</div>
				<Input label="開始日期" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
				<Input label="結束日期" type="date" defaultValue={new Date().toISOString()} />
			</div>
		</>
	);
};
