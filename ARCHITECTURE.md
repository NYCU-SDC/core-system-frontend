# Core UI - Feature-Oriented Architecture

This project uses a **feature-oriented folder structure** that organizes code by business domain rather than technical type.

## 📁 Project Structure

```
src/
├── features/              # Feature modules (business domains)
│   ├── components/        # Components showcase feature
│   │   ├── components/    # UI pages for this feature
│   │   │   ├── HomePage.jsx
│   │   │   ├── ComponentsPage.jsx
│   │   │   ├── ComponentDetailPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── index.js
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── services/      # Business logic & data
│   │   │   └── componentData.js
│   │   ├── types/         # TypeScript types (if using TS)
│   │   └── index.js       # Feature public API
│   │
│   └── docs/              # Documentation feature
│       ├── components/    # UI pages for this feature
│       │   ├── DocsPage.jsx
│       │   ├── DocDetailPage.jsx
│       │   └── index.js
│       ├── hooks/         # Feature-specific hooks
│       ├── services/      # Business logic & data
│       │   └── docsData.js
│       ├── types/         # TypeScript types (if using TS)
│       └── index.js       # Feature public API
│
├── shared/                # Shared/common code
│   ├── components/        # Reusable UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Dialog/
│   │   ├── Tabs/
│   │   ├── Switch/
│   │   └── index.js
│   ├── hooks/             # Reusable hooks
│   ├── utils/             # Utility functions
│   ├── types/             # Shared TypeScript types
│   └── styles/            # Global styles & CSS variables
│       └── variables.css
│
├── layouts/               # Layout components
│   └── RootLayout.jsx
│
├── routes/                # Routing configuration
│   └── index.jsx
│
├── assets/                # Static assets (images, fonts, etc.)
│
├── index.css              # Global CSS
└── main.jsx               # Application entry point
```

## 🎯 Benefits of This Structure

### 1. **Feature Isolation**
Each feature is self-contained with its own components, hooks, services, and types.

### 2. **Scalability**
Easy to add new features without affecting existing ones:
```bash
src/features/auth/
src/features/dashboard/
src/features/settings/
```

### 3. **Clear Ownership**
Teams can own specific features with minimal conflicts.

### 4. **Better Imports**
Use path aliases for clean imports:
```javascript
// Before
import { Button } from '../../../shared/components/Button/Button';

// After
import { Button } from '@/shared/components';
```

### 5. **Reusability**
Shared components and utilities are clearly separated from feature-specific code.

## 📦 Feature Module Structure

Each feature follows this pattern:

```
feature-name/
├── components/     # UI components for this feature
├── hooks/          # Custom hooks used by this feature
├── services/       # Business logic, API calls, data management
├── types/          # TypeScript type definitions
└── index.js        # Public API - what the feature exports
```

### Example: Adding a New Feature

1. Create the feature folder:
```bash
mkdir -p src/features/auth/{components,hooks,services,types}
```

2. Create feature components:
```javascript
// src/features/auth/components/LoginPage.jsx
import { Button } from '@/shared/components';
import { useAuth } from '../hooks/useAuth';

export const LoginPage = () => {
  const { login } = useAuth();
  // ...
};
```

3. Create feature services:
```javascript
// src/features/auth/services/authService.js
export const authService = {
  login: async (credentials) => {
    // API call
  },
  logout: async () => {
    // API call
  },
};
```

4. Create feature hooks:
```javascript
// src/features/auth/hooks/useAuth.js
import { authService } from '../services/authService';

export const useAuth = () => {
  // Hook logic
};
```

5. Export from feature index:
```javascript
// src/features/auth/index.js
export { LoginPage, SignupPage } from './components';
export { useAuth } from './hooks/useAuth';
export { authService } from './services/authService';
```

## 🔗 Path Aliases

The project uses `@` alias for cleaner imports:

| Alias | Path |
|-------|------|
| `@/features/*` | `src/features/*` |
| `@/shared/*` | `src/shared/*` |
| `@/layouts/*` | `src/layouts/*` |
| `@/routes/*` | `src/routes/*` |

Configure in `vite.config.js`:
```javascript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## 📋 Guidelines

### ✅ Do:
- Keep features independent
- Share common code via `shared/`
- Use services for business logic
- Export public API from feature `index.js`
- Use path aliases for imports

### ❌ Don't:
- Import from one feature to another directly
- Put feature-specific code in `shared/`
- Create circular dependencies
- Skip the feature `index.js` exports

## 🚀 Current Features

### Components Feature
Manages the component showcase and documentation.
- **Components**: HomePage, ComponentsPage, ComponentDetailPage
- **Services**: Component metadata and examples

### Docs Feature
Manages documentation pages.
- **Components**: DocsPage, DocDetailPage
- **Services**: Documentation content and structure

## 🛠️ Shared Resources

### Shared Components
Reusable UI components used across features:
- Button, Card, Dialog, Tabs, Switch

### Shared Styles
Global CSS variables and themes in `shared/styles/`.

### Layouts
Shared layout components like navigation and footers.

---

Built with ❤️ using feature-oriented architecture
