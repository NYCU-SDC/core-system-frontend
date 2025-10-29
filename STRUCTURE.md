# Feature-Oriented Folder Structure

## Current Structure

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
├── App.jsx                      # Legacy (can remove)
├── App.module.css               # Legacy (can remove)
├── index.css                    # Global styles
└── main.jsx                     # 🚀 Entry point
```

## Import Flow

```
┌─────────────────────────────────────────────────────┐
│                    main.jsx                         │
│                  (Entry Point)                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              routes/index.jsx                       │
│           (Routing Configuration)                   │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  layouts/        │    │  features/       │
│  RootLayout      │    │  - components/   │
└──────────────────┘    │  - docs/         │
                        └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  shared/         │
                        │  components/     │
                        │  hooks/          │
                        │  utils/          │
                        └──────────────────┘
```

## Key Principles

### 1. Feature Independence
```
features/
├── auth/           ← Can work independently
├── dashboard/      ← Can work independently
└── settings/       ← Can work independently
```

### 2. Shared Resources
```
shared/
├── components/     ← Used by ALL features
├── hooks/          ← Used by ALL features
└── utils/          ← Used by ALL features
```

### 3. Clean Imports
```javascript
// ✅ Good - Using path alias
import { Button } from '@/shared/components';
import { HomePage } from '@/features/components';

// ❌ Bad - Relative paths
import { Button } from '../../../shared/components/Button/Button';
```

### 4. Feature Public API
```javascript
// features/components/index.js
export { HomePage, ComponentsPage } from './components';
export { componentsData } from './services/componentData';

// Usage elsewhere
import { HomePage, componentsData } from '@/features/components';
```

## Migration Checklist

- [x] Created feature folders structure
- [x] Moved pages to features/*/components/
- [x] Moved shared components to shared/components/
- [x] Moved styles to shared/styles/
- [x] Created service layers (componentData, docsData)
- [x] Set up path aliases in vite.config.js
- [x] Updated all imports to use @/ alias
- [x] Created feature index.js exports
- [x] Created ARCHITECTURE.md documentation

## Next Steps

To add a new feature (e.g., `auth`):

1. **Create structure:**
   ```bash
   mkdir -p src/features/auth/{components,hooks,services,types}
   ```

2. **Add components:**
   ```javascript
   // features/auth/components/LoginPage.jsx
   export const LoginPage = () => { /* ... */ };
   ```

3. **Add services:**
   ```javascript
   // features/auth/services/authService.js
   export const authService = { /* ... */ };
   ```

4. **Add hooks:**
   ```javascript
   // features/auth/hooks/useAuth.js
   export const useAuth = () => { /* ... */ };
   ```

5. **Export public API:**
   ```javascript
   // features/auth/index.js
   export { LoginPage } from './components';
   export { useAuth } from './hooks/useAuth';
   export { authService } from './services/authService';
   ```

6. **Use in routes:**
   ```javascript
   import { LoginPage } from '@/features/auth';
   ```
