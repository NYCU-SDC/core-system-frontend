import { useMe } from "@/features/auth/hooks/useAuth";
import { authService } from "@/features/auth/services/authService";
import { UserLayout } from "@/layouts";
import { SEO_CONFIG } from "@/seo/seo.config";
import { useSeo } from "@/seo/useSeo";
import { Button, Input, useToast } from "@/shared/components";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NameMarquee } from "./NameMarquee";
import styles from "./WelcomePage.module.css";

export const WelcomePage = () => {
	const navigate = useNavigate();
	const meQuery = useMe();
	const meta = useSeo({ rule: SEO_CONFIG.welcome });
	const [nickname, setNickname] = useState("");
	const [username, setUsername] = useState("");
	const [isUsernameFocused, setIsUsernameFocused] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { pushToast } = useToast();

	const isLoading = meQuery.isLoading;

	useEffect(() => {
		if (meQuery.isError) {
			navigate("/", { replace: true });
			return;
		}
		if (!meQuery.data) return;
		setNickname(typeof meQuery.data.name === "string" ? meQuery.data.name : "");
		setUsername(typeof meQuery.data.username === "string" ? meQuery.data.username : "");
	}, [meQuery.data, meQuery.isError, navigate]);

	const nicknameError = useMemo(() => {
		if (!nickname) return "";
		if (nickname.length > 15) return "暱稱需為 15 字以下";
		if (nickname.length === 15) return "已達上限 15 字！";
		return "";
	}, [nickname]);

	const usernameError = useMemo(() => {
		if (!username.trim()) return "請輸入使用者名稱";
		if (username.length < 4 || username.length > 15) return "使用者名稱需為 4~15 位";
		if (!/^[A-Za-z0-9_]+$/.test(username)) return "使用者名稱只能包含英數與底線";
		return "";
	}, [username]);

	const canSubmit = Boolean(nickname.trim() && nickname.trim().length <= 15 && username.trim() && !usernameError && !isSubmitting);
	const displayedUsernameError = isUsernameFocused || username.trim() ? usernameError : "";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;

		try {
			setIsSubmitting(true);

			await authService.updateOnboarding({
				username: username.trim(),
				name: nickname.trim()
			});

			navigate("/forms");
		} catch (err) {
			pushToast({ title: "儲存失敗", description: (err as Error).message, variant: "error" });
		} finally {
			setIsSubmitting(false);
		}
	};

	const displayName = `${nickname.trim() || "Welcome"}！`;

	return (
		<UserLayout>
			{meta}
			<NameMarquee name={displayName} />
			<div className={styles.content}>
				<h1 className={styles.title}>很高興認識您，{displayName}</h1>
				<form className={styles.form} onSubmit={handleSubmit}>
					<Input
						id="nickname"
						label="暱稱"
						placeholder="Enter your nickname"
						value={nickname}
						onChange={e => setNickname(e.target.value)}
						error={nicknameError}
						disabled={isLoading}
						maxLength={15}
						className={styles.inputField}
						required
					/>
					<Input
						id="username"
						label="使用者名稱"
						placeholder="Becomes your user URL"
						value={username}
						onChange={e => setUsername(e.target.value.replace(/\s/g, ""))}
						onFocus={() => setIsUsernameFocused(true)}
						onBlur={() => setIsUsernameFocused(false)}
						error={displayedUsernameError}
						disabled={isLoading}
						minLength={4}
						maxLength={15}
						className={styles.inputField}
						required
					/>
					<div className={styles.actions}>
						<Button type="submit" icon={ArrowRight} disabled={!canSubmit} iconPosition="right">
							繼續
						</Button>
					</div>
				</form>
			</div>
		</UserLayout>
	);
};
