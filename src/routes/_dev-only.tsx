import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_dev-only')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
  component: () => <Outlet />,
});
