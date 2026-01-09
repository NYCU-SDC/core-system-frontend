import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "../../../layouts";
import { Button, Input } from "../../../shared/components";
import styles from "./WelcomePage.module.css";

export const WelcomePage = () => {
	const navigate = useNavigate();
	const [name, setName] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			// Save name to user profile
			console.log("Saving name:", name);
			navigate("/forms");
		}
	};

	return (
		<UserLayout>
			<div className={styles.container}>
				<div className={styles.content}>
					<h1 className={styles.title}>Welcome!</h1>
					<p className={styles.subtitle}>Let's get to know you better</p>

					<form className={styles.form} onSubmit={handleSubmit}>
						<Input id="name" label="What's your name?" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required />

						<div className={styles.actions}>
							<Button type="submit" icon={ArrowRight} disabled={!name.trim()}>
								Continue
							</Button>
						</div>
					</form>
				</div>
			</div>
		</UserLayout>
	);
};
