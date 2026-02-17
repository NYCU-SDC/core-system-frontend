import { createContext } from "react";
import type { ToastInput } from "./Toast";

export type ToastContextValue = {
	pushToast: (input: ToastInput) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);
