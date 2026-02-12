import { authService } from "@/features/auth/services/authService";
import { UserLayout } from "@/layouts";
import { Button, Input } from "@/shared/components";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NameMarquee } from "./NameMarquee";
import styles from "./WelcomePage.module.css";

export const WelcomePage = () => {
	const navigate = useNavigate();
	const isWelcomeGuardMuted = import.meta.env.VITE_MUTE_WELCOME_GUARD === "true"; // true = allow everyone in, false = protect this page.
	const [nickname, setNickname] = useState("");
	const [username, setUsername] = useState("");
	const [isUsernameFocused, setIsUsernameFocused] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");

	useEffect(() => {
		let isMounted = true;

		const loadUser = async () => {
			try {
				const user = await authService.getCurrentUser();
				if (!isMounted || !user) return;

				const hasGuardFlags = typeof user.isMember === "boolean" && typeof user.isFirstLogin === "boolean";
				const isMember = user.isMember === true;
				const isFirstLogin = user.isFirstLogin === true;
				// TODO: Align with backend contract and switch to fail-close once isMember/isFirstLogin are guaranteed.
				if (!isWelcomeGuardMuted && hasGuardFlags && (!isMember || !isFirstLogin)) {
					navigate("/", { replace: true });
					return;
				}

				setNickname(typeof user.name === "string" ? user.name : "");
				setUsername(typeof user.username === "string" ? user.username : "");
			} catch {
				if (!isWelcomeGuardMuted && isMounted) {
					navigate("/", { replace: true });
				}
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		loadUser();
		return () => {
			isMounted = false;
		};
	}, [isWelcomeGuardMuted, navigate]);

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
			setSubmitError("");
			setIsSubmitting(true);

			await authService.updateOnboarding({
				username: username.trim(),
				name: nickname.trim()
			});

			navigate("/forms");
		} catch {
			setSubmitError("儲存失敗，請稍後再試");
		} finally {
			setIsSubmitting(false);
		}
	};

	const displayName = `${nickname.trim() || "Welcome"}！`;

	return (
		<UserLayout>
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
					{submitError && <p>{submitError}</p>}
				</form>
			</div>
		</UserLayout>
	);
};
