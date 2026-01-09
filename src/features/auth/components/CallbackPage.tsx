import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "../../../layouts";
import styles from "./CallbackPage.module.css";

export const CallbackPage = () => {
	const navigate = useNavigate();

	useEffect(() => {
		// Simulate OAuth callback processing
		const processCallback = async () => {
			// Process OAuth code/token
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Check if first time user
			const isFirstTime = true; // Replace with actual check

			if (isFirstTime) {
				navigate("/welcome");
			} else {
				navigate("/forms");
			}
		};

		processCallback();
	}, [navigate]);

	return (
		<UserLayout>
			<div className={styles.container}>
				<div className={styles.spinner} />
				<p className={styles.message}>Authenticating...</p>
			</div>
		</UserLayout>
	);
};
