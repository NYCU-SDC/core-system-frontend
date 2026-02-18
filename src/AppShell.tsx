import { ToastProvider } from "@/shared/components";

export function AppShell({ children }: { children: React.ReactNode }) {
	return <ToastProvider>{children}</ToastProvider>;
}
