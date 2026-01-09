import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/components";
import styles from "./LoginPage.module.css";

export const LoginPage = () => {
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Welcome</h1>
			<p className={styles.subtitle}>Sign in to your account</p>

			<div className={styles.card}>
				<div className={styles.form}>
					<div className={styles.field}>
						<label className={styles.label}>Email</label>
						<input type="email" placeholder="Enter your email" className={styles.input} />
					</div>

					<div className={styles.field}>
						<label className={styles.label}>Password</label>
						<input type="password" placeholder="Enter your password" className={styles.input} />
					</div>

					<Link to="/admin" className={styles.link}>
						<Button icon={LogIn} style={{ width: "100%" }}>
							Sign In
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};
