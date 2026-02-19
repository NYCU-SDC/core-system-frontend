import { UserLayout } from "@/layouts";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import styles from "./LogoutPage.module.css";

export const LogoutPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	useEffect(() => {
		const run = async () => {
			try {
				await authService.logout();
			} catch {
				// ignore
			} finally {
				queryClient.setQueryData(["auth", "user"], null);
				navigate("/", { replace: true });
			}
		};

		run();
	}, [navigate, queryClient]);

	return (
		<UserLayout>
			<div className={styles.container}>
				<h1 className={styles.message}>正在登出...</h1>
				<p className={styles.submessage}>您將會在短時間內被重新導向</p>
			</div>
		</UserLayout>
	);
};
