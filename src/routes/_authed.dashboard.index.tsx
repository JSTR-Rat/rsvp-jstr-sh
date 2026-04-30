import { StandardFormPanel } from '@/forms/standard-form';
import {
  sfFontSans,
  sfFontSerif,
} from '@/forms/standard-form/shared-classes';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/dashboard/')({
  staticData: {
    title: 'Dashboard',
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <StandardFormPanel>
        <div className="space-y-2 text-left">
          <h2
            className="text-[1.25rem] font-medium tracking-tight text-white sm:text-[1.375rem]"
            style={{ fontFamily: sfFontSerif }}
          >
            Dashboard
          </h2>
          <p
            className="text-[0.9375rem] leading-relaxed text-white/65"
            style={{ fontFamily: sfFontSans }}
          >
            You&apos;re signed in. Add RSVP tools and guest management here when
            you&apos;re ready.
          </p>
        </div>
      </StandardFormPanel>
    </div>
  );
}
