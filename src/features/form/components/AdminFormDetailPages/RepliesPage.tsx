import { Badge, Button, Input } from "@/shared/components";
import { Repeat2, SquareArrowOutUpRight } from "lucide-react";
import styles from "./RepliesPage.module.css";

export const AdminFormRepliesPage = () => {
	return (
		<div className={styles.container}>
			<div className={styles.wrapper}>
				<h2>回覆蒐集</h2>
				<Badge className={styles.status} variant="success" showDot>
					已連結 Google Sheets
				</Badge>
			</div>
			<p>請將以下服務帳號加入您的 Google Sheets 編輯權限：</p>
			<Input value="your-service-account@example.com" readOnly></Input>
			<Input value="sss" readOnly></Input>
			<div className={styles.wrapper}>
				<Button className={styles.checkButton} variant="primary">
					<Repeat2 />
					檢查狀態
				</Button>
				<Button variant="primary">
					<SquareArrowOutUpRight />
					檢視表單
				</Button>
			</div>
		</div>
	);
};
