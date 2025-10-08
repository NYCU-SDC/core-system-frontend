# 401 錯誤處理測試指南

## 測試前準備

確保已完成以下設定：

1. ✅ 安裝了 `sonner` 套件
2. ✅ `main.tsx` 有 QueryClient 的全局錯誤處理
3. ✅ `App.tsx` 有 LoginPromptDialog
4. ✅ `.env` 設定了 `VITE_LOGIN_URL`（可選）

## 測試場景

### 場景 1：Query 401 錯誤（載入資料失敗）

**測試步驟：**

1. 打開瀏覽器開發者工具（F12）
2. 清除所有 cookies 或 localStorage 中的認證 token
3. 重新整理頁面或導航到需要載入資料的頁面（如表單列表）
4. 觀察行為

**預期結果：**

- Console 顯示：`Query 401 error detected, triggering auth error`
- 自動彈出「請先登入」Dialog
- Dialog 內容正確顯示中文訊息
- 有「取消」和「前往登入」兩個按鈕

**測試通過標準：**

- ✅ Dialog 正確顯示
- ✅ 沒有顯示錯誤 toast（401 不應該觸發 toast）
- ✅ 只顯示一個 Dialog（不重複）

---

### 場景 2：Mutation 401 錯誤（操作失敗）

**測試步驟：**

1. 登入系統
2. 開啟表單編輯頁面
3. 清除 cookies/token（模擬 session 過期）
4. 嘗試儲存表單
5. 觀察行為

**預期結果：**

- Console 顯示：`Mutation 401 error detected, triggering auth error`
- 自動彈出「請先登入」Dialog
- **不會**顯示「儲存失敗」的錯誤 toast

**測試通過標準：**

- ✅ Dialog 正確顯示
- ✅ 沒有其他錯誤訊息
- ✅ 使用者可以點擊「前往登入」

---

### 場景 3：多次 401 錯誤（防止重複 Dialog）

**測試步驟：**

1. 清除認證
2. 快速執行多個需要認證的操作：
   - 載入表單列表
   - 編輯表單
   - 儲存變更
3. 觀察 Dialog 數量

**預期結果：**

- 只顯示**一個** LoginPromptDialog
- 不會有多個 Dialog 疊加

**測試通過標準：**

- ✅ 只有一個 Dialog
- ✅ 後續的 401 錯誤不會重複觸發

---

### 場景 4：登入流程

**測試步驟：**

1. 觸發 401 錯誤（清除 token）
2. 看到 Dialog 後點擊「前往登入」
3. 觀察瀏覽器行為
4. 登入成功後觀察

**預期結果：**

- 瀏覽器導向到登入 URL（環境變數設定的 URL）
- `sessionStorage` 中有 `redirectAfterLogin` 記錄當前路徑
- 登入後可以返回原頁面（需要後端支援）

**測試通過標準：**

- ✅ 正確導向登入頁面
- ✅ 當前路徑被儲存
- ✅ 登入後可以返回（如果後端支援）

---

### 場景 5：取消登入

**測試步驟：**

1. 觸發 401 錯誤
2. 看到 Dialog 後點擊「取消」
3. 觀察行為

**預期結果：**

- Dialog 關閉
- 停留在當前頁面
- 可以再次嘗試操作（會再次觸發 401）

**測試通過標準：**

- ✅ Dialog 正常關閉
- ✅ 不會導向登入頁面
- ✅ 頁面功能仍可使用

---

### 場景 6：其他錯誤（非 401）

**測試步驟：**

1. 確保已登入（有有效 token）
2. 模擬其他類型錯誤（如 500、400）
3. 執行操作（如儲存表單）
4. 觀察行為

**預期結果：**

- **不會**顯示 LoginPromptDialog
- 顯示錯誤 toast（紅色，右下角）
- Toast 內容為「儲存失敗」等相關訊息

**測試通過標準：**

- ✅ 不顯示登入 Dialog
- ✅ 正確顯示錯誤 toast
- ✅ 使用者知道發生了什麼錯誤

---

## 自動化測試（可選）

### 使用 Mock Service Worker (MSW)

```typescript
import { rest } from 'msw';

// Mock 401 response
const handlers = [
  rest.get('/api/forms', (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        title: 'Unauthorized',
        status: 401,
        detail: 'missing access token'
      })
    );
  }),
];
```

### 測試腳本

```typescript
test('shows login dialog on 401 error', async () => {
  render(<App />);
  
  // Trigger API call
  await userEvent.click(screen.getByText('載入表單'));
  
  // Check dialog appears
  expect(screen.getByText('請先登入')).toBeInTheDocument();
  expect(screen.getByText('您的登入狀態已過期')).toBeInTheDocument();
  
  // Check buttons
  expect(screen.getByText('取消')).toBeInTheDocument();
  expect(screen.getByText('前往登入')).toBeInTheDocument();
});
```

---

## 常見問題排查

### ❌ Dialog 沒有顯示

**可能原因：**

1. QueryClient 沒有設定 `queryCache` 和 `mutationCache`
2. `triggerAuthError()` 沒有被呼叫
3. `App.tsx` 沒有使用 `useGlobalAuthError`

**檢查方法：**

```javascript
// 檢查 Console
console.log('Query 401 error detected, triggering auth error');
// 如果沒看到這個訊息，問題在 QueryClient 設定

// 檢查事件監聽
window.addEventListener('authError', () => {
  console.log('Auth error event fired');
});
```

---

### ❌ 顯示了多個 Dialog

**可能原因：**

1. 組件和全局都有 LoginPromptDialog
2. 沒有在 mutation 的 `onError` 中 return

**修正方法：**

```tsx
// 確保只在 App.tsx 有一個 LoginPromptDialog
// 組件的 onError 中要 return
onError: (error) => {
  if (error instanceof UnauthorizedError) return; // 重要！
  showError('操作失敗');
}
```

---

### ❌ 其他錯誤也顯示登入 Dialog

**可能原因：**

錯誤檢查邏輯不正確

**修正方法：**

```tsx
// 確保只檢查 UnauthorizedError
if (error instanceof UnauthorizedError) {
  triggerAuthError();
}
```

---

## 測試檢查清單

在提交前，確保所有項目都通過：

- [ ] Query 401 錯誤顯示 Dialog
- [ ] Mutation 401 錯誤顯示 Dialog
- [ ] 只顯示一個 Dialog（不重複）
- [ ] 「前往登入」正確導向
- [ ] 「取消」正常關閉 Dialog
- [ ] 非 401 錯誤不顯示 Dialog
- [ ] 401 錯誤不顯示錯誤 toast
- [ ] Console 沒有錯誤訊息
- [ ] TypeScript 編譯通過
- [ ] 使用者體驗流暢

---

## 測試環境

建議在以下環境測試：

1. **開發環境**（localhost）
2. **測試環境**（staging）
3. **不同瀏覽器**
   - Chrome
   - Firefox  
   - Safari
   - Edge

---

## 報告問題

如果測試失敗，請提供：

1. 測試場景編號
2. 實際結果（截圖）
3. Console 錯誤訊息
4. 瀏覽器資訊
5. 重現步驟

---

## 成功標準

✅ 所有 6 個測試場景都通過  
✅ 使用者體驗流暢自然  
✅ 沒有 Console 錯誤  
✅ Dialog 文字清晰易懂  
✅ 按鈕操作符合預期  

測試通過後即可部署到生產環境！🎉
