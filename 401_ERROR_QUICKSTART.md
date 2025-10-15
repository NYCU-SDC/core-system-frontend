# 快速開始：401 認證錯誤處理

## 🚀 已完成的功能

✅ 自動檢測所有 API 的 401 錯誤回應（包括 queries 和 mutations）  
✅ 全局統一處理，無需每個組件單獨處理  
✅ 顯示友善的登入提示 Dialog  
✅ 一鍵導向登入頁面  
✅ 自動儲存當前位置，登入後可返回  
✅ Toast 錯誤通知系統

## 📋 API 錯誤回應格式

當後端回應 401 時，請使用以下格式：

```json
{
	"title": "Unauthorized",
	"status": 401,
	"detail": "missing access token"
}
```

## 🔧 環境變數設定

在 `.env` 檔案中設定登入 URL：

```env
VITE_LOGIN_URL=https://your-domain.com/login
```

如果不設定，預設使用 `/api/auth/login`

## 🏗️ 架構說明

### 全局錯誤處理 (main.tsx)

所有的 401 錯誤都在 `main.tsx` 的 QueryClient 設定中統一處理：

```tsx
import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { UnauthorizedError } from "./lib/request/api.ts";
import { triggerAuthError } from "./hooks/useAuthError.ts";

const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: error => {
			if (error instanceof UnauthorizedError) {
				triggerAuthError(); // 觸發全局登入提示
			}
		}
	}),
	mutationCache: new MutationCache({
		onError: error => {
			if (error instanceof UnauthorizedError) {
				triggerAuthError(); // 觸發全局登入提示
			}
		}
	})
});
```

### 全局登入 Dialog (App.tsx)

```tsx
import { useGlobalAuthError } from "@/hooks/useAuthError";
import { LoginPromptDialog } from "@/components/ui/login-prompt-dialog";

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

## 💡 在組件中使用

**不需要**在每個組件中處理 401 錯誤！全局已經處理了。

只需要處理**其他類型**的錯誤：

```tsx
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { UnauthorizedError } from "@/lib/request/api.ts";

const MyComponent = () => {
	const { showSuccess, showError } = useToast();

	const saveMutation = useMutation({
		mutationFn: saveData,
		onSuccess: () => {
			showSuccess("儲存成功", "資料已成功儲存");
		},
		onError: error => {
			// 401 錯誤已經被全局處理，這裡只需處理其他錯誤
			if (error instanceof UnauthorizedError) return;

			// 處理其他錯誤
			showError("儲存失敗", "請稍後再試");
		}
	});

	return <button onClick={() => saveMutation.mutate()}>儲存</button>;
};
```

## 📱 使用者體驗流程

1. 使用者執行任何操作（查詢資料、儲存表單等）
2. 如果 token 過期或不存在，API 回應 401
3. **全局錯誤處理**自動捕捉 401 錯誤
4. 自動顯示 Dialog：「請先登入」
5. 使用者點擊「前往登入」按鈕
6. 導向登入頁面
7. 登入成功後自動返回原頁面

## 🎨 Dialog 預覽

```
┌─────────────────────────────────┐
│  請先登入                   ✕  │
├─────────────────────────────────┤
│                                 │
│  您的登入狀態已過期或尚未登入   │
│  請重新登入以繼續使用系統       │
│                                 │
│          [取消]  [前往登入]     │
└─────────────────────────────────┘
```

## 🔍 測試方式

### 1. 模擬 401 錯誤

清除瀏覽器的 token/cookies，然後執行任何需要認證的操作：

- 載入表單列表
- 編輯表單
- 儲存變更
- 等等...

### 2. 檢查 Console

應該會看到：

```
Query 401 error detected, triggering auth error
```

或

```
Mutation 401 error detected, triggering auth error
```

### 3. 檢查 Dialog 顯示

應該會看到「請先登入」的 Dialog 彈出。

### 4. 測試導向

點擊「前往登入」應該正確導向登入頁面。

## 📝 整合狀態

- ✅ **全局處理** - main.tsx (QueryClient 設定)
- ✅ **全局 Dialog** - App.tsx (LoginPromptDialog)
- ✅ **所有 API 請求** - 自動處理，無需額外設定
- ✅ **所有組件** - 自動受益，無需修改

## 🎯 Toast 通知

除了 401 認證錯誤會顯示 Dialog 外，其他操作也會顯示 toast 通知：

- ✅ 儲存成功 → 綠色 toast（右下角）
- ❌ 儲存失敗 → 紅色 toast（右下角，5秒）
- ✅ 刪除成功 → 綠色 toast
- ❌ 刪除失敗 → 紅色 toast
- ✅ 發布成功 → 綠色 toast
- ❌ 發布失敗 → 紅色 toast

## 📚 詳細文件

- [AUTH_ERROR_HANDLING.md](./AUTH_ERROR_HANDLING.md) - 完整的認證錯誤處理說明
- [TOAST_USAGE.md](./TOAST_USAGE.md) - Toast 通知使用指南

## ⚙️ 技術細節

### 核心流程

1. **API 層** (`api.ts`) - 攔截 401，拋出 `UnauthorizedError`
2. **QueryClient** (`main.tsx`) - 捕捉所有 query/mutation 的 401 錯誤
3. **全局事件** - 觸發 `triggerAuthError()` 事件
4. **App 監聽** (`App.tsx`) - `useGlobalAuthError` 監聽事件
5. **顯示 Dialog** - 統一的 `LoginPromptDialog`

### 為什麼選擇全局處理？

✅ **簡潔** - 不用在每個組件重複處理  
✅ **一致** - 所有頁面的體驗統一  
✅ **維護容易** - 只需要在一個地方修改  
✅ **自動涵蓋** - 新增的 API 請求自動受保護

## 🤝 新增頁面

新增的頁面**不需要任何額外設定**，自動就會有 401 錯誤處理！

只需要記得在 mutation 的 `onError` 中過濾掉 401：

```tsx
onError: error => {
	if (error instanceof UnauthorizedError) return; // 已被全局處理
	showError("操作失敗", "請稍後再試");
};
```

## 📞 支援

如有問題，請參考：

- [AUTH_ERROR_HANDLING.md](./AUTH_ERROR_HANDLING.md)
- [TOAST_USAGE.md](./TOAST_USAGE.md)
