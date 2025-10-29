import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage, ComponentsPage, ComponentDetailPage, NotFoundPage } from '@/features/components';
import { DocsPage, DocDetailPage } from '@/features/docs';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'components',
        element: <ComponentsPage />,
      },
      {
        path: 'components/:slug',
        element: <ComponentDetailPage />,
      },
      {
        path: 'docs',
        element: <DocsPage />,
      },
      {
        path: 'docs/:category/:slug',
        element: <DocDetailPage />,
      },
    ],
  },
]);

export default router;
