import { useTitle } from '@/hooks/use-title';
import {
  GOOGLE_FONTS_CSS_HREF,
  sfAuthedAppRoot,
  sfFontSans,
  sfFontSerif,
  sfPageBackdrop,
  sfPageRadial,
} from '@/forms/standard-form/shared-classes';
import { requireAuth } from '@/utils/auth.functions';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import clsx from 'clsx';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    await requireAuth({ data: { currentPath: location.href } });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const title = useTitle();

  return (
    <>
      <link rel="stylesheet" href={GOOGLE_FONTS_CSS_HREF} />
      <div className={sfAuthedAppRoot}>
        <div className={sfPageBackdrop} aria-hidden />
        <div className={sfPageRadial} aria-hidden />

        <nav className="sticky top-0 z-20 border-b border-white/12 bg-black/40 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between gap-4 sm:h-16">
              <h1
                className="truncate text-[1.125rem] font-medium tracking-tight text-white sm:text-[1.25rem]"
                style={{ fontFamily: sfFontSerif }}
              >
                {title}
              </h1>
              <Link
                to="/signout"
                className={clsx(
                  'inline-flex shrink-0 items-center justify-center rounded-md border border-white/[0.2] bg-white/[0.07] px-3.5 py-2',
                  'text-[0.8125rem] font-medium text-white/92 transition-[border-color,background-color]',
                  'hover:border-white/[0.3] hover:bg-white/[0.11]',
                  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/24',
                )}
                style={{ fontFamily: sfFontSans }}
              >
                Sign out
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </>
  );
}
