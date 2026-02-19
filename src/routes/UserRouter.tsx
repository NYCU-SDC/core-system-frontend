import { CallbackPage } from "@/features/auth/components/CallbackPage";
import { HomePage } from "@/features/auth/components/HomePage";
import { LogoutPage } from "@/features/auth/components/LogoutPage";
import { NotFoundPage } from "@/features/auth/components/NotFoundPage";
import { WelcomePage } from "@/features/auth/components/WelcomePage";
import { FormDetailPage, FormsListPage } from "@/features/form/components";
// ⚠️ 這裡先沿用你現有的 import；下一步我會教你怎麼避免 barrel 拉到 admin
import { UserLayout } from "@/layouts";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RequireLogin from "./RequireLogin";

export const UserRouter = () => {
	return (
		<BrowserRouter>
			<Routes>
				{/* Public routes */}
				<Route path="/" element={<HomePage />} />
				<Route path="/callback" element={<CallbackPage />} />
				<Route path="/welcome" element={<WelcomePage />} />
				<Route path="/logout" element={<LogoutPage />} />

				{/* User form routes（把 SmartLayout 換成 UserLayout，避免把 Admin 牽進來） */}
				<Route element={<RequireLogin />}>
					<Route
						path="/forms"
						element={
							<UserLayout>
								<FormsListPage />
							</UserLayout>
						}
					/>
					<Route
						path="/forms/:formId/:responseId"
						element={
							<UserLayout>
								<FormDetailPage />
							</UserLayout>
						}
					/>
				</Route>

				{/* 404 */}
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	);
};
