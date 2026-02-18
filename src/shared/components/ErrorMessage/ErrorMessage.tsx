import { AlertCircle } from "lucide-react";
import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
	message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
	return (
		<div className={styles.error} role="alert">
			<div className={styles.icon}>
				<AlertCircle size={20} />
			</div>
			<div className={styles.message}>{message}</div>
		</div>
	);
};
