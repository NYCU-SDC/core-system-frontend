import { createContext } from "react";

type AuthContextType = {
    login: (provider: "google") => void;
    logout: () => void;
    isLoggedIn: () => boolean;
};

export const authContext = createContext<AuthContextType>({
    login: () => {
        console.warn("login() called without provider");
    },
    logout: () => {
        console.warn("Logout function not implemented");
    },
    isLoggedIn: () => false,
});
