import { createFileRoute } from '@tanstack/react-router';
import { Turnstile } from '@marsidev/react-turnstile';

export const Route = createFileRoute('/test-auth')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Turnstile
        options={{
          theme: 'dark',
          size: 'flexible',
          action: 'test',
        }}
        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
        onSuccess={console.log}
        onError={(error) => {
          console.error(error);
        }}
        onExpire={console.log}
        onTimeout={console.log}
      />
    </div>
  );
}
