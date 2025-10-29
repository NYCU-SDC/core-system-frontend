// Documentation structure and content
export const docCategories = [
  {
    category: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using Core UI',
    docs: [
      { slug: 'installation', title: 'Installation', description: 'How to install and set up Core UI' },
      { slug: 'quick-start', title: 'Quick Start', description: 'Get up and running in minutes' },
      { slug: 'theming', title: 'Theming', description: 'Customize colors and styles' },
    ],
  },
  {
    category: 'guides',
    title: 'Guides',
    description: 'In-depth guides for common use cases',
    docs: [
      { slug: 'css-modules', title: 'CSS Modules', description: 'How we use CSS modules for styling' },
      { slug: 'accessibility', title: 'Accessibility', description: 'Making your app accessible' },
      { slug: 'best-practices', title: 'Best Practices', description: 'Recommended patterns and practices' },
    ],
  },
  {
    category: 'advanced',
    title: 'Advanced',
    description: 'Advanced topics and customization',
    docs: [
      { slug: 'custom-components', title: 'Custom Components', description: 'Build your own components' },
      { slug: 'performance', title: 'Performance', description: 'Optimize your app' },
      { slug: 'migration', title: 'Migration Guide', description: 'Migrate from other libraries' },
    ],
  },
];

export const docContent = {
  'getting-started': {
    installation: {
      title: 'Installation',
      content: `
## Installation

Install Core UI via npm or pnpm:

\`\`\`bash
npm install @orange-ui/components
# or
pnpm add @orange-ui/components
\`\`\`

### Prerequisites

- React 18 or later
- Node.js 16 or later

### Peer Dependencies

Core UI depends on:
- \`react\` >= 18.0.0
- \`react-dom\` >= 18.0.0
- \`@radix-ui/react-*\` (installed automatically)

### Import Styles

Import the CSS variables in your main entry file:

\`\`\`jsx
import '@orange-ui/components/styles.css';
\`\`\`

You're now ready to use Core UI components!
      `,
    },
    'quick-start': {
      title: 'Quick Start',
      content: `
## Quick Start

Get started with Core UI in just a few minutes.

### 1. Import Components

Import components directly from the package:

\`\`\`jsx
import { Button, Card, Dialog } from '@orange-ui/components';
\`\`\`

### 2. Use Components

All components follow a consistent API:

\`\`\`jsx
function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello Core UI</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Get started with beautiful components</p>
      </CardContent>
      <CardFooter>
        <Button>Click me</Button>
      </CardFooter>
    </Card>
  );
}
\`\`\`

### 3. Customize

All components use CSS variables for easy theming. See the Theming guide for details.
      `,
    },
    theming: {
      title: 'Theming',
      content: `
## Theming

Customize Core UI to match your brand with CSS variables.

### CSS Variables

Override these variables in your CSS:

\`\`\`css
:root {
  --color-primary: #ff8c00;
  --color-background: #ffffff;
  --color-text: #1a1a1a;
  --border-radius: 8px;
  --border-width: 2px;
}
\`\`\`

### Dark Mode

Create a dark theme by overriding variables:

\`\`\`css
.dark {
  --color-primary: #ffa500;
  --color-background: #1a1a1a;
  --color-text: #ffffff;
}
\`\`\`

### Custom Colors

Want a different accent color? Just change \`--color-primary\`:

\`\`\`css
:root {
  --color-primary: #0066ff; /* Blue instead of orange */
}
\`\`\`
      `,
    },
  },
  guides: {
    'css-modules': {
      title: 'CSS Modules',
      content: `
## CSS Modules

Core UI uses CSS Modules for scoped, maintainable styles.

### Why CSS Modules?

- **Scoped styles**: No naming conflicts
- **Type-safe**: Works with TypeScript
- **Performance**: Only loads needed styles
- **Maintainable**: Co-located with components

### Using CSS Modules

Each component has a corresponding \`.module.css\` file:

\`\`\`jsx
import styles from './MyComponent.module.css';

function MyComponent() {
  return <div className={styles.container}>Hello</div>;
}
\`\`\`

### Combining Classes

Use template literals to combine classes:

\`\`\`jsx
<div className={\`\${styles.base} \${styles.active}\`}>
  Content
</div>
\`\`\`
      `,
    },
    accessibility: {
      title: 'Accessibility',
      content: `
## Accessibility

Core UI is built on Radix UI primitives for full accessibility.

### Keyboard Navigation

All components support keyboard navigation:

- **Tab**: Move focus
- **Enter/Space**: Activate
- **Esc**: Close dialogs/overlays
- **Arrow keys**: Navigate lists/tabs

### Screen Readers

Components include proper ARIA attributes:

- Labels and descriptions
- Role attributes
- Live regions for updates
- Focus management

### Best Practices

1. Always provide labels
2. Use semantic HTML
3. Test with keyboard only
4. Test with screen readers
5. Ensure color contrast

\`\`\`jsx
// Good: Has accessible label
<Switch label="Enable notifications" />

// Bad: No label
<Switch />
\`\`\`
      `,
    },
    'best-practices': {
      title: 'Best Practices',
      content: `
## Best Practices

Follow these guidelines for optimal results.

### Component Usage

**Do:**
- Use semantic HTML
- Provide accessible labels
- Follow component APIs
- Keep styles in CSS modules

**Don't:**
- Override component internals
- Use inline styles unnecessarily
- Ignore TypeScript warnings

### Performance

1. **Code splitting**: Import components dynamically
2. **Lazy loading**: Use React.lazy for routes
3. **Memoization**: Use React.memo when needed

### File Structure

Organize your components:

\`\`\`
src/
  features/
    components/
      Button/
        Button.jsx
        Button.module.css
    Card/
      Card.jsx
      Card.module.css
\`\`\`
      `,
    },
  },
  advanced: {
    'custom-components': {
      title: 'Custom Components',
      content: `
## Custom Components

Build your own components using Core UI patterns.

### Component Template

\`\`\`jsx
// MyComponent.jsx
import styles from './MyComponent.module.css';

export const MyComponent = ({ children, ...props }) => {
  return (
    <div className={styles.root} {...props}>
      {children}
    </div>
  );
};
\`\`\`

\`\`\`css
/* MyComponent.module.css */
.root {
  background-color: var(--color-background);
  border: var(--border-width) solid var(--color-primary);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
}
\`\`\`

### Using Radix Primitives

Extend Radix UI components:

\`\`\`jsx
import * as RadixTooltip from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.css';

export const Tooltip = ({ children, content }) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Content className={styles.content}>
          {content}
        </RadixTooltip.Content>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
\`\`\`
      `,
    },
    performance: {
      title: 'Performance',
      content: `
## Performance

Optimize your Core UI application.

### Code Splitting

Split routes for faster initial load:

\`\`\`jsx
import { lazy, Suspense } from 'react';

const Components = lazy(() => import('./pages/ComponentsPage'));

<Suspense fallback={<Loading />}>
  <Components />
</Suspense>
\`\`\`

### Tree Shaking

Import only what you need:

\`\`\`jsx
// Good: Tree-shakeable
import { Button, Card } from '@orange-ui/components';

// Avoid: Imports everything
import * as OrangeUI from '@orange-ui/components';
\`\`\`

### Memoization

Memoize expensive computations:

\`\`\`jsx
import { useMemo, memo } from 'react';

const MyComponent = memo(({ data }) => {
  const processed = useMemo(() => {
    return expensiveOperation(data);
  }, [data]);

  return <div>{processed}</div>;
});
\`\`\`

### Bundle Analysis

Check your bundle size:

\`\`\`bash
npm run build -- --analyze
\`\`\`
      `,
    },
    migration: {
      title: 'Migration Guide',
      content: `
## Migration Guide

Migrate from other UI libraries to Core UI.

### From Material-UI

| Material-UI | Core UI |
|------------|-----------|
| Button | Button |
| Card | Card |
| Dialog | Dialog |
| Tabs | Tabs |
| Switch | Switch |

Key differences:
- Core UI uses CSS modules instead of styled-components
- Props are slightly different (check component docs)
- Core UI is lighter and more performant

### From Chakra UI

Core UI follows similar composition patterns:

\`\`\`jsx
// Chakra
<Box border="1px" borderRadius="md">
  Content
</Box>

// Core UI
<Card>
  <CardContent>Content</CardContent>
</Card>
\`\`\`

### Migration Steps

1. Install Core UI
2. Replace component imports
3. Update prop names (check docs)
4. Update styling (CSS modules)
5. Test thoroughly
6. Remove old library

### Codemods

Use our codemods for automatic migration:

\`\`\`bash
npx @orange-ui/codemod migrate-from-mui
\`\`\`
      `,
    },
  },
};
