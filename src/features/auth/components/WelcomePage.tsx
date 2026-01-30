import { UserLayout } from "@/layouts";
import { Button, Input } from "@/shared/components";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NameMarquee } from "./NameMarquee";
import styles from "./WelcomePage.module.css";

export const WelcomePage = () => {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [nickName, setNickName] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			console.log("Saving name:", name);
			navigate("/forms");
		}
	};
	const displayName = `${nickName.trim() || "Welcome"}!`;

	return (
		<UserLayout isCenter>
			<div className={styles.container}>
				<div className={styles.marqueeBackground}>
					<NameMarquee name={displayName} />
				</div>
				<div className={styles.content}>
					<h1 className={styles.title}>很高興認識您，Andrew!</h1>
					<form className={styles.form} onSubmit={handleSubmit}>
						<Input id="nickName" label="暱稱" placeholder="Enter your nickname" value={nickName} onChange={e => setNickName(e.target.value)} required />
						<Input id="name" label="使用者名稱" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required />
						<div className={styles.actions}>
							<Button type="submit" icon={ArrowRight} disabled={!name.trim()}>
								繼續
							</Button>
						</div>
					</form>
				</div>
			</div>
		</UserLayout>
	);
};
