import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../Toast/useToast";
import styles from "./AccountButton.module.css";

export interface AccountButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
	logo: ReactNode;
	children: ReactNode;
	connected?: boolean;
	connectedLabel?: string;
	responseId?: string;
	questionId?: string;
	onConnect?: (username: string) => void;
	onConnectError?: (error: string) => void;
}

export const AccountButton = ({ logo, children, connected = false, connectedLabel, className, responseId, questionId, onConnect, onConnectError, disabled, ...props }: AccountButtonProps) => {
	const { pushToast } = useToast();
	const [isConnecting, setIsConnecting] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState<string>("");
	const [resolvedLabel, setResolvedLabel] = useState<string>(connectedLabel ?? "");
	const popupRef = useRef<Window | null>(null);
	const timerRef = useRef<number | null>(null);
	const onConnectRef = useRef(onConnect);
	const onConnectErrorRef = useRef(onConnectError);
	useEffect(() => {
		onConnectRef.current = onConnect;
	}, [onConnect]);
	useEffect(() => {
		onConnectErrorRef.current = onConnectError;
	}, [onConnectError]);

	useEffect(() => {
		setResolvedLabel(connectedLabel ?? "");
	}, [connectedLabel]);

	const clearTimer = () => {
		if (timerRef.current !== null) {
			window.clearInterval(timerRef.current);
			timerRef.current = null;
		}
	};

	useEffect(() => {
		return () => {
			clearTimer();
			if (popupRef.current && !popupRef.current.closed) {
				popupRef.current.close();
			}
		};
	}, []);
	const fetchAndApply = useCallback(
		async (opts: { showToast: boolean }): Promise<boolean> => {
			if (!responseId || !questionId) return false;
			try {
				const resp = await fetch(`/api/responses/${responseId}/questions/${questionId}`, {
					credentials: "include"
				});
				if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
				const data = (await resp.json()) as {
					answer?: {
						value?: { username?: string; avatarUrl?: string };
					};
					displayValue?: string;
				};

				const oauthUsername = data?.answer?.value?.username ?? "";
				const fetchedAvatarUrl = data?.answer?.value?.avatarUrl ?? "";
				const displayValue = data?.displayValue ?? "";
				const finalValue = oauthUsername || displayValue;

				if (finalValue) {
					setResolvedLabel(finalValue);
					setAvatarUrl(fetchedAvatarUrl);
					onConnectRef.current?.(finalValue);
					if (opts.showToast) {
						pushToast({ title: "綁定成功", description: `已綁定帳號：${finalValue}`, variant: "success" });
					}
					return true;
				} else if (opts.showToast) {
					pushToast({ title: "綁定完成", description: "已完成授權，但尚未取得帳號資訊", variant: "warning" });
					onConnectRef.current?.("");
				}
			} catch (error) {
				const errMsg = (error as Error).message;
				if (opts.showToast) {
					pushToast({ title: "讀取綁定結果失敗", description: errMsg, variant: "error" });
					onConnectErrorRef.current?.(errMsg);
				}
			}
			return false;
		},
		[responseId, questionId, pushToast]
	);

	useEffect(() => {
		if (!connected || !responseId || !questionId) return;
		fetchAndApply({ showToast: false });
	}, [connected, responseId, questionId, fetchAndApply]);

	const handleClick = () => {
		if (!responseId || !questionId) return;

		const callbackUrl = new URL("/forms/oauth-callback", window.location.origin);
		callbackUrl.searchParams.set("questionId", questionId);
		callbackUrl.searchParams.set("responseId", responseId);

		const oauthBase = `/api/responses/${responseId}/questions/${questionId}/oauth`;
		const connectUrl = `${oauthBase}?r=${encodeURIComponent(callbackUrl.toString())}`;

		const popupWidth = 520;
		const popupHeight = 760;
		const screenLeft = window.screenLeft ?? window.screenX;
		const screenTop = window.screenTop ?? window.screenY;
		const left = Math.round(screenLeft + (window.outerWidth - popupWidth) / 2);
		const top = Math.round(screenTop + (window.outerHeight - popupHeight) / 2);
		const popup = window.open(connectUrl, "form-oauth-connect", `popup=yes,width=${popupWidth},height=${popupHeight},left=${left},top=${top}`);
		if (!popup) {
			pushToast({ title: "無法開啟綁定視窗", description: "請確認瀏覽器未封鎖彈出視窗", variant: "error" });
			onConnectErrorRef.current?.("無法開啟綁定視窗");
			return;
		}

		popupRef.current = popup;
		setIsConnecting(true);
		clearTimer();

		const handleMessage = async (event: MessageEvent) => {
			// Only handle messages from this popup and same origin
			if (event.source !== popup) return;
			if (event.origin !== window.location.origin) return;

			const data = event.data as { type?: string; questionId?: string; responseId?: string; error?: string | unknown };
			if (!data || data.type !== "FORM_OAUTH_CONNECTED") return;
			if (data.questionId !== questionId || data.responseId !== responseId) return;

			// Mark this popup as handled so the interval callback does not re-fetch
			(popup as Window & { __oauthHandled?: boolean }).__oauthHandled = true;

			clearTimer();
			window.removeEventListener("message", handleMessage);

			try {
				if (data.error) {
					const errorMessage = typeof data.error === "string" ? data.error : "綁定失敗，請再試一次";
					pushToast({ title: "綁定失敗", description: errorMessage, variant: "error" });
					onConnectErrorRef.current?.(errorMessage);
				} else {
					await fetchAndApply({ showToast: true });
				}
			} finally {
				setIsConnecting(false);
				try {
					popup.close();
				} catch {
					// ignore
				}
			}
		};

		window.addEventListener("message", handleMessage);

		timerRef.current = window.setInterval(async () => {
			if (popup.closed) {
				clearTimer();
				window.removeEventListener("message", handleMessage);
				// If no FORM_OAUTH_CONNECTED message was handled, fall back to fetching
				if (!(popup as Window & { __oauthHandled?: boolean }).__oauthHandled) {
					await fetchAndApply({ showToast: true });
				}
				setIsConnecting(false);
			}
		}, 500);

		popup.focus();
	};

	const logoNode = connected && avatarUrl ? <img src={avatarUrl} alt={resolvedLabel} className={styles.avatar} /> : logo;

	const contentNode = isConnecting ? "綁定中..." : connected && resolvedLabel ? resolvedLabel : children;

	return (
		<button className={`${styles.button} ${connected ? styles.connected : ""} ${className || ""}`} onClick={handleClick} disabled={disabled || isConnecting || !responseId || !questionId} {...props}>
			<div className={styles.logo}>{logoNode}</div>
			<div className={styles.content}>{contentNode}</div>
			{connected && <span className={styles.badge}>Connected</span>}
		</button>
	);
};
