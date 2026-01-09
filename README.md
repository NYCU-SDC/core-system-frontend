# Core System Frontend

A modern React TypeScript application with Radix UI components, React Router, and feature-oriented architecture.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Radix UI** - Headless UI components
- **Lucide React** - Icons
- **Highlight.js** - Code highlighting
- **CSS Modules** - Scoped styling
- **pnpm** - Package manager

## Project Structure

```
src/
├── features/           # Feature-oriented modules
│   ├── auth/          # Authentication features
│   │   ├── components/ # Auth pages (Home, Login, Callback, etc.)
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── dashboard/     # Dashboard features
│       ├── components/ # Form pages and admin pages
│       ├── hooks/
│       ├── services/
│       └── types/
├── shared/            # Shared resources
│   ├── components/    # Reusable UI components
│   ├── hooks/
│   ├── utils/
│   └── types/
├── layouts/           # Layout templates
│   ├── UserLayout.tsx    # User layout (max-width: 640px)
│   └── AdminLayout.tsx   # Admin layout (sidebar + max-width: 1200px)
├── routes/            # Route configuration
│   └── AppRouter.tsx
└── assets/            # Static assets
```

## Shared Components

All components use CSS modules and support theme colors via props:

- **Button** - Flexible button with icon support
- **Input** - Text input with label and error states
- **TextArea** - Multi-line text input
- **Checkbox** - Checkbox with label
- **Radio** - Radio button group
- **Select** - Dropdown select with Radix UI

### Component Usage

```tsx
import { Button, Input, TextArea, Checkbox, Radio, Select } from './shared/components';
import { Plus } from 'lucide-react';

// Button with icon and custom theme
<Button icon={Plus} themeColor="var(--purple)">
  Create
</Button>

// Input with label and error
<Input 
  label="Email" 
  error="Invalid email"
  themeColor="var(--cyan)"
/>

// Radio group
<Radio
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
  ]}
  themeColor="var(--green)"
/>
```

## Routes

### User Routes (UserLayout)
- `/` - Home page with OAuth login buttons
- `/callback` - OAuth callback handler
- `/welcome` - First-time user onboarding
- `/forms` - Available forms list
- `/forms/:id` - Form detail and submission
- `/logout` - Logout page

### Admin Routes (AdminLayout)
- `/orgs/sdc/forms` - Forms management dashboard
- `/orgs/sdc/forms/:formid/info` - Form information
- `/orgs/sdc/forms/:formid/edit` - Form editor
- `/orgs/sdc/forms/:formid/reply` - Form replies
- `/orgs/sdc/forms/:formid/design` - Form design
- `/orgs/sdc/settings` - Organization settings

### Redirects
- `/orgs/xxx/*` → `/orgs/sdc/forms`
- `/orgs` → `/orgs/sdc/forms`
- `/orgs/sdc` → `/orgs/sdc/forms`

## Color System

The app uses a comprehensive color system with CSS variables:

```css
--background: #282a36
--foreground: #f8f8f2
--cyan: #8be9fd
--green: #50fa7b
--orange: #ffb86c (default theme color)
--pink: #ff79c6
--purple: #bd93f9
--red: #ff5555
--yellow: #f1fa8c
```

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

## Layouts

### UserLayout
- No navigation bar
- Centered content with max-width: 640px
- Used for public pages and user forms

### AdminLayout
- Fixed left sidebar navigation
- Centered content with max-width: 1200px
- Used for admin dashboard and management pages

## Styling Guidelines

- All units use `rem` for scalability
- No box shadows by default
- Default theme color is orange (`--orange`)
- CSS reset applied globally
- Heading sizes: h1 (3rem), h2 (2.5rem), h3 (2rem), h4 (1.5rem), h5 (1.25rem), h6 (1rem)

## License

Licensed under the terms specified in [LICENSE](./LICENSE).
