import { AccountButton } from "@/shared/components";
import type { FormsQuestionResponse } from "@nycu-sdc/core-system-sdk";
import { Chrome, Github } from "lucide-react";
import styles from "../FormFilloutPage.module.css";

export const OAuthConnectRenderer = ({
	question,
	value,
	responseId,
	onAnswerChange
}: {
	question: FormsQuestionResponse;
	value: string;
	responseId?: string;
	onAnswerChange: (questionId: string, value: string) => void;
}) => {
	return (
		<>
			<p className={styles.caption}>
				綁定平台：
				{question.oauthConnect === "GOOGLE" ? "Google" : "GitHub"}
			</p>
			<div className={styles.oauthConnectActions}>
				<AccountButton
					type="button"
					logo={question.oauthConnect === "GOOGLE" ? <Chrome size={20} /> : <Github size={20} />}
					connected={Boolean(value)}
					connectedLabel={value || ""}
					responseId={responseId}
					questionId={question.id}
					onConnect={username => onAnswerChange(question.id, username)}
				>
					{value ? "重新綁定帳號" : "綁定帳號"}
				</AccountButton>
				<p className={styles.uploadHint}>{value ? `已綁定帳號：${value}` : "尚未綁定，點擊上方按鈕開始 OAuth 綁定流程。"}</p>
			</div>
		</>
	);
};
