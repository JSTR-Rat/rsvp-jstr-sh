import clsx from 'clsx';
import { Globe, MapPin } from 'lucide-react';

const venueIconLinkClass = clsx(
  'inline-flex size-10 shrink-0 items-center justify-center rounded-md',
  'text-white/72',
  'transition-[color,transform,scale]',
  'hover:scale-110 hover:text-white/92',
  'focus-visible:ring-[3px] focus-visible:ring-white/24 focus-visible:outline-none',
  'active:scale-95',
);

type VenueIconLinkProps = {
  href: string;
  label: string;
  icon: 'maps' | 'website';
};

function VenueIcon({ icon }: { icon: VenueIconLinkProps['icon'] }) {
  const className = 'size-5';
  if (icon === 'maps') {
    return <MapPin className={className} aria-hidden />;
  }
  return <Globe className={className} aria-hidden />;
}

export function VenueIconLink({ href, label, icon }: VenueIconLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={venueIconLinkClass}
    >
      <VenueIcon icon={icon} />
    </a>
  );
}
