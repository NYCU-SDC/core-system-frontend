import { useState, useCallback, useEffect } from "react";
import { UnauthorizedError } from "@/lib/request/api";

export const useAuthError = () => {
	const [showLoginPrompt, setShowLoginPrompt] = useState(false);

	const handleAuthError = useCallback((error: unknown) => {
		if (error instanceof UnauthorizedError) {
			setShowLoginPrompt(true);
			return true;
		}
		return false;
	}, []);

	const handleLogin = useCallback(() => {
		// Get the login URL from environment or use default
		const loginUrl = import.meta.env.VITE_LOGIN_URL || "/api/auth/login";

		// Save current location to return after login
		sessionStorage.setItem("redirectAfterLogin", window.location.pathname);

		// Redirect to login page
		window.location.href = loginUrl;
	}, []);

	const closeLoginPrompt = useCallback(() => {
		setShowLoginPrompt(false);
	}, []);

	return {
		showLoginPrompt,
		handleAuthError,
		handleLogin,
		closeLoginPrompt
	};
};

// Global auth error event
export const AUTH_ERROR_EVENT = "authError";

export const triggerAuthError = () => {
	window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
};

// Hook to listen for global auth errors
export const useGlobalAuthError = () => {
	const [showLoginPrompt, setShowLoginPrompt] = useState(false);

	useEffect(() => {
		const handleAuthErrorEvent = () => {
			setShowLoginPrompt(true);
		};

		window.addEventListener(AUTH_ERROR_EVENT, handleAuthErrorEvent);
		return () => {
			window.removeEventListener(AUTH_ERROR_EVENT, handleAuthErrorEvent);
		};
	}, []);

	const handleLogin = useCallback(() => {
		const loginUrl = import.meta.env.VITE_LOGIN_URL || "/api/auth/login";
		sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
		window.location.href = loginUrl;
	}, []);

	const closeLoginPrompt = useCallback(() => {
		setShowLoginPrompt(false);
	}, []);

	return {
		showLoginPrompt,
		handleLogin,
		closeLoginPrompt
	};
};
