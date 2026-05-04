export const HERO_BLURRED_BG_MOBILE =
  '/images/generated/gallery/engagement_01_gallery.webp';
export const HERO_BLURRED_BG_DESKTOP =
  '/images/generated/gallery/engagement_04_gallery.webp';

export const HeroBlurredBackground = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0">
        <picture className="absolute inset-0 block">
          <source media="(min-width: 768px)" srcSet={HERO_BLURRED_BG_DESKTOP} />
          <img
            src={HERO_BLURRED_BG_MOBILE}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full origin-center scale-110 object-cover object-center blur-lg"
          />
        </picture>
      </div>
      <div
        className="absolute inset-0 bg-linear-to-b from-black/65 via-black/55 to-black/85"
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(95% 58% at 50% 42%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.18) 52%, rgba(0,0,0,0.42) 100%)',
        }}
        aria-hidden
      />
    </div>
  );
};
