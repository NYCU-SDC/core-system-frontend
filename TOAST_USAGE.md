# Toast 通知組件使用指南

## 安裝的組件

我們已經在專案中安裝並設定了 `sonner` toast 通知系統。

## 使用方式

### 1. 在 App.tsx 中已加入 Toaster 組件

```tsx
import { Toaster } from "@/components/ui/sonner";
import { LoginPromptDialog } from "@/components/ui/login-prompt-dialog";
import { useGlobalAuthError } from "@/hooks/useAuthError";

const App = () => {
	const { showLoginPrompt, handleLogin, closeLoginPrompt } = useGlobalAuthError();

	return (
		<>
			<AppContent />
			<Toaster />
			<LoginPromptDialog
				open={showLoginPrompt}
				onOpenChange={closeLoginPrompt}
				onLogin={handleLogin}
			/>
		</>
	);
};
```

### 2. 使用 useToast Hook

```tsx
import { useToast } from "@/hooks/useToast";

const MyComponent = () => {
	const { showSuccess, showError, showInfo, showWarning } = useToast();

	const handleSave = async () => {
		try {
			await saveData();
			showSuccess("儲存成功", "資料已成功儲存");
		} catch (error) {
			showError("儲存失敗", "無法儲存資料，請稍後再試");
		}
	};

	return <button onClick={handleSave}>儲存</button>;
};
```

### 3. Toast 類型

- **showSuccess(message, description?)** - 成功通知（綠色）
- **showError(message, description?)** - 錯誤通知（紅色，顯示 5 秒）
- **showInfo(message, description?)** - 資訊通知（藍色）
- **showWarning(message, description?)** - 警告通知（黃色）

### 4. 處理 401 未授權錯誤

當 API 回應 401 錯誤時，系統會自動顯示登入提示 Dialog：

#### API 層級處理 (api.ts)

```tsx
// API 會自動檢測 401 錯誤並拋出 UnauthorizedError
export class UnauthorizedError extends Error {
	constructor(public detail: string) {
		super(detail);
		this.name = "UnauthorizedError";
	}
}
```

#### 在組件中處理認證錯誤

```tsx
import { useAuthError } from "@/hooks/useAuthError";
import { LoginPromptDialog } from "@/components/ui/login-prompt-dialog";

const MyComponent = () => {
	const { showLoginPrompt, handleAuthError, handleLogin, closeLoginPrompt } = useAuthError();

	const myMutation = useMutation({
		mutationFn: myApiCall,
		onError: error => {
			// 檢查是否為認證錯誤
			if (handleAuthError(error)) return;

			// 處理其他錯誤
			showError("操作失敗", "請稍後再試");
		}
	});

	return (
		<>
			{/* Your component JSX */}
			<LoginPromptDialog
				open={showLoginPrompt}
				onOpenChange={closeLoginPrompt}
				onLogin={handleLogin}
			/>
		</>
	);
};
```

#### 401 錯誤回應格式

當 API 回應 401 時，預期的 JSON 格式：

```json
{
	"title": "Unauthorized",
	"status": 401,
	"detail": "missing access token"
}
```

### 5. 在 Edit.tsx 中的實際應用

已更新所有錯誤處理使用 toast 通知和認證檢查：

```tsx
const { showSuccess, showError } = useToast();
const { showLoginPrompt, handleAuthError, handleLogin, closeLoginPrompt } = useAuthError();

// 儲存失敗
updateFormMutation: {
	onError: error => {
		if (handleAuthError(error)) return; // 處理認證錯誤
		showError("儲存失敗", "無法更新表單，請稍後再試");
	};
}

// 刪除成功
deleteFormMutation: {
	onSuccess: () => {
		showSuccess("刪除成功", "表單已成功刪除");
	};
}
```

## 環境變數設定

在 `.env` 檔案中設定登入 URL：

```env
VITE_LOGIN_URL=/api/auth/login
```

如果未設定，預設使用 `/api/auth/login`。

## Toast 位置

Toast 通知會出現在畫面**右下角**，並會自動消失（錯誤訊息顯示 5 秒，其他顯示 3-4 秒）。

## 樣式

Toast 使用 shadcn/ui 的樣式系統，會自動適配你的主題色彩。

## LoginPromptDialog 功能

- 顯示友善的登入提示訊息
- 提供「取消」和「前往登入」按鈕
- 點擊「前往登入」會導向設定的登入 URL
- 自動儲存當前頁面位置，登入後可返回
