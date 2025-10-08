# 認證錯誤處理 (401 Unauthorized)

## 概述

當 API 回應 401 Unauthorized 錯誤時，系統會自動顯示登入提示 Dialog，引導使用者重新登入。

## 錯誤回應格式

後端 API 在認證失敗時應回應以下格式：

```json
{
  "title": "Unauthorized",
  "status": 401,
  "detail": "missing access token"
}
```

## 架構設計

### 1. API 層 (`src/lib/request/api.ts`)

```typescript
export class UnauthorizedError extends Error {
  constructor(public detail: string) {
    super(detail);
    this.name = 'UnauthorizedError';
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  
  if (!res.ok) {
    if (res.status === 401) {
      const errorData = await res.json();
      throw new UnauthorizedError(errorData.detail || 'Unauthorized');
    }
    throw new Error(`API request failed with status ${res.status}`);
  }
  
  return res.json();
}
```

**功能：**
- 攔截所有 401 回應
- 解析錯誤詳情
- 拋出自訂的 `UnauthorizedError`

### 2. 認證錯誤 Hook (`src/hooks/useAuthError.ts`)

提供兩個 Hook：

#### `useAuthError()` - 組件層級

```typescript
const { showLoginPrompt, handleAuthError, handleLogin, closeLoginPrompt } = useAuthError();
```

**用途：** 在個別組件中處理認證錯誤

**方法：**
- `showLoginPrompt`: boolean - 是否顯示登入 Dialog
- `handleAuthError(error)`: 檢查錯誤是否為認證錯誤，是則顯示 Dialog
- `handleLogin()`: 導向登入頁面
- `closeLoginPrompt()`: 關閉 Dialog

#### `useGlobalAuthError()` - 全域層級

```typescript
const { showLoginPrompt, handleLogin, closeLoginPrompt } = useGlobalAuthError();
```

**用途：** 在 App.tsx 中監聽全域認證錯誤事件

### 3. 登入提示 Dialog (`src/components/ui/login-prompt-dialog.tsx`)

```tsx
<LoginPromptDialog
  open={showLoginPrompt}
  onOpenChange={closeLoginPrompt}
  onLogin={handleLogin}
/>
```

**顯示內容：**
- 標題：「請先登入」
- 說明：「您的登入狀態已過期或尚未登入。請重新登入以繼續使用系統。」
- 按鈕：「取消」、「前往登入」

## 使用方式

### 在組件中使用

```tsx
import { useAuthError } from "@/hooks/useAuthError";
import { LoginPromptDialog } from "@/components/ui/login-prompt-dialog";

const MyComponent = () => {
  const { showLoginPrompt, handleAuthError, handleLogin, closeLoginPrompt } = useAuthError();

  const myMutation = useMutation({
    mutationFn: someApiCall,
    onError: (error) => {
      // 優先處理認證錯誤
      if (handleAuthError(error)) return;
      
      // 處理其他錯誤
      showError('操作失敗', '請稍後再試');
    }
  });

  return (
    <>
      {/* 組件內容 */}
      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={closeLoginPrompt}
        onLogin={handleLogin}
      />
    </>
  );
};
```

### 在全域使用 (App.tsx)

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

## 環境變數設定

在 `.env` 或 `.env.local` 檔案中設定：

```env
VITE_LOGIN_URL=https://your-auth-domain.com/login
```

**預設值：** `/api/auth/login`

## 登入流程

1. 使用者操作觸發 API 請求
2. API 回應 401 錯誤
3. `api()` 函數拋出 `UnauthorizedError`
4. Mutation 的 `onError` 捕捉錯誤
5. `handleAuthError()` 檢測到 `UnauthorizedError`
6. 顯示 `LoginPromptDialog`
7. 使用者點擊「前往登入」
8. 儲存當前路徑到 `sessionStorage`
9. 導向登入頁面
10. 登入成功後，可從 `sessionStorage` 讀取路徑並返回

## 登入後返回原頁面

在登入成功後的程式碼中：

```typescript
const redirectPath = sessionStorage.getItem('redirectAfterLogin');
if (redirectPath) {
  sessionStorage.removeItem('redirectAfterLogin');
  navigate(redirectPath);
} else {
  navigate('/'); // 預設首頁
}
```

## 已整合的頁面

- ✅ `src/pages/form/Edit.tsx` - 表單編輯頁面
- ✅ `src/App.tsx` - 全域錯誤處理

## 待整合的頁面

如需在其他頁面加入認證錯誤處理：

1. Import 所需的 hooks 和組件
2. 在每個 mutation 的 `onError` 中加入 `handleAuthError(error)` 檢查
3. 在組件的 JSX 中加入 `LoginPromptDialog`

## 測試

### 手動測試

1. 清除瀏覽器 cookies/token
2. 嘗試執行需要認證的操作（儲存、刪除等）
3. 應該看到登入提示 Dialog
4. 點擊「前往登入」應導向登入頁面

### 模擬 401 錯誤

在 API mock 或測試環境中回應：

```json
{
  "title": "Unauthorized",
  "status": 401,
  "detail": "missing access token"
}
```

## 注意事項

1. **確保所有 API 請求使用 `credentials: 'include'`**（已在 `api.ts` 中設定）
2. **登入 URL 需要在環境變數中正確設定**
3. **登入後端需要支援回傳原路徑**（透過 `redirectAfterLogin`）
4. **使用 `handleAuthError` 時要優先處理**，避免顯示重複的錯誤訊息
