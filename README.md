# Core UI

## 技術線

* [Radix UI](https://www.radix-ui.com/)
* React
* Vite
* CSS Modules
* 功能導向資料夾結構

## 專案架構

```
src/
├── features/                    # 🎯 Business Domain Features
│   ├── components/              # Components Showcase Feature
│   │   ├── components/          # Feature UI Pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── ComponentsPage.jsx
│   │   │   ├── ComponentDetailPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── *.module.css    # Scoped styles
│   │   │   └── index.js         # Barrel export
│   │   ├── hooks/               # Feature-specific hooks
│   │   ├── services/            # Business logic
│   │   │   └── componentData.js
│   │   ├── types/               # TypeScript types (future)
│   │   └── index.js             # ✅ Public API
│   │
│   └── docs/                    # Documentation Feature
│       ├── components/
│       │   ├── DocsPage.jsx
│       │   ├── DocDetailPage.jsx
│       │   ├── *.module.css
│       │   └── index.js
│       ├── hooks/
│       ├── services/
│       │   └── docsData.js
│       ├── types/
│       └── index.js             # ✅ Public API
│
├── shared/                      # 🔄 Reusable Across Features
│   ├── components/              # UI Component Library
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.module.css
│   │   ├── Card/
│   │   ├── Dialog/
│   │   ├── Tabs/
│   │   ├── Switch/
│   │   └── index.js             # ✅ Public API
│   ├── hooks/                   # Shared hooks
│   ├── utils/                   # Helper functions
│   ├── types/                   # Shared types
│   └── styles/                  # Global styles
│       └── variables.css        # CSS variables
│
├── layouts/                     # 🏗️ Layout Components
│   ├── RootLayout.jsx
│   └── RootLayout.module.css
│
├── routes/                      # 🛣️ Routing Configuration
│   └── index.jsx                # React Router setup
│
├── assets/                      # 📦 Static Assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── index.css                    # Global styles
└── main.jsx                     # 🚀 Entry point
```

## 設計原則

### 1. 獨立功能

```
features/
├── auth/           ← 可以獨立運作
├── dashboard/      ← 可以獨立運作
└── settings/       ← 可以獨立運作
```

### 2. 共享元件

```
shared/
├── components/     ← 所有功能都會用的基本元件
├── hooks/          ← 所有功能都會用的基本元件
└── utils/          ← 所有功能都會用的基本元件
```

### 3. 乾淨的導入路徑

```javascript
// ✅ Good - Using path alias
import { Button } from "@/shared/components";
import { HomePage } from "@/features/components";

// ❌ Bad - Relative paths
import { Button } from "../../../shared/components/Button/Button";
```

### 4. 功能的公共 API

```javascript
// features/components/index.js
export { HomePage, ComponentsPage } from "./components";
export { componentsData } from "./services/componentData";

// Usage elsewhere
import { HomePage, componentsData } from "@/features/components";
```

## 新增功能指南

To add a new feature (e.g., `auth`):

1. **Create structure:**

    ```bash
    mkdir -p src/features/auth/{components,hooks,services,types}
    ```

2. **Add components:**

    ```javascript
    // features/auth/components/LoginPage.jsx
    export const LoginPage = () => {
        /* ... */
    };
    ```

3. **Add services:**

    ```javascript
    // features/auth/services/authService.js
    export const authService = {
        /* ... */
    };
    ```

4. **Add hooks:**

    ```javascript
    // features/auth/hooks/useAuth.js
    export const useAuth = () => {
        /* ... */
    };
    ```

5. **Export public API:**

    ```javascript
    // features/auth/index.js
    export { LoginPage } from "./components";
    export { useAuth } from "./hooks/useAuth";
    export { authService } from "./services/authService";
    ```

6. **Use in routes:**
    ```javascript
    import { LoginPage } from "@/features/auth";
    ```
