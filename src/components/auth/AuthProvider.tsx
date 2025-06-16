import { useCallback } from "react";
import { authContext } from "@/lib/auth/authContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const login = useCallback((provider: "google") => {
        const callbackUrl = `${window.location.protocol}//${window.location.host}/callback`;
        const redirectUrl = `${window.location.protocol}//${window.location.host}/`;
        const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

        const urlMap: Record<"google", string> = {
            google: `${baseUrl}/api/login/oauth/google?c=${callbackUrl}&r=${redirectUrl}`,
        };
        window.location.href = urlMap[provider];
    }, []);

    return (
        <authContext.Provider
            value={{
                login,
                logout: () => {
                    console.warn("Logout function not implemented");
                },
                isLoggedIn: () => false, // Placeholder implementation
            }}
        >
            {children}
        </authContext.Provider>
    );
};
