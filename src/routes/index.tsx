import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { Lightbox } from '@/components/lightbox';
import { MosaicGallery } from '@/components/mosaic-gallery';
import {
  ENGAGEMENT_GALLERY_ITEMS,
  ENGAGEMENT_MOSAIC_IMAGES,
} from '@/lib/engagement-gallery-data';
import { Button } from '@headlessui/react';

const PAGE_TITLE = 'Wade & Vada - RSVP';
const PAGE_DESCRIPTION =
  "We'd love to share our special day with you. Formal invitation to follow.";
/** 1200×630 — large OG / Discord / Twitter preview card */
const OG_IMAGE_URL = '/wada-og.jpg';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const OG_IMAGE_ALT =
  'Wade and Vada seated together in front of a silver Toyota Crown at golden hour.';

/** Portrait / phone — tiny placeholder, then full WebP */
const BACKGROUND_PLACEHOLDER_MOBILE =
  '/images/generated/gallery/engagement_01_gallery.webp';
const BACKGROUND_FULL_MOBILE =
  '/images/generated/lightbox/engagement_01_lightbox.webp';
/** Wider layouts — matching pair */
const BACKGROUND_PLACEHOLDER_DESKTOP =
  '/images/generated/gallery/engagement_04_gallery.webp';
const BACKGROUND_FULL_DESKTOP =
  '/images/generated/lightbox/engagement_04_lightbox.webp';

const SAVE_THE_DATE = {
  month: 'NOVEMBER',
  weekday: 'SATURDAY',
  day: '21',
  time: '4:00 PM',
  year: '2026',
  tagline: PAGE_DESCRIPTION,
} as const;

const fontSans = "'Jost', system-ui, sans-serif";
const fontSerif = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";

export type HomeSearch = {
  image?: string;
};

export const Route = createFileRoute('/')({
  validateSearch: (raw: Record<string, unknown>): HomeSearch => ({
    image:
      typeof raw.image === 'string' && raw.image.length > 0
        ? raw.image
        : undefined,
  }),
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: 'description', content: PAGE_DESCRIPTION },
      { name: 'og:title', content: PAGE_TITLE },
      { name: 'og:description', content: PAGE_DESCRIPTION },
      { name: 'og:type', content: 'website' },
      { name: 'og:image', content: OG_IMAGE_URL },
      { name: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
      { name: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
      { name: 'og:image:type', content: 'image/jpeg' },
      { name: 'og:image:alt', content: OG_IMAGE_ALT },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: PAGE_TITLE },
      { name: 'twitter:description', content: PAGE_DESCRIPTION },
      { name: 'twitter:image', content: OG_IMAGE_URL },
      { name: 'twitter:image:alt', content: OG_IMAGE_ALT },
    ],
    links: [
      {
        rel: 'preload',
        as: 'image',
        href: BACKGROUND_PLACEHOLDER_MOBILE,
        media: '(max-width: 767px)',
        fetchPriority: 'high',
      },
      {
        rel: 'preload',
        as: 'image',
        href: BACKGROUND_PLACEHOLDER_DESKTOP,
        media: '(min-width: 768px)',
        fetchPriority: 'high',
      },
    ],
  }),
});

function FloralDivider({ flip }: { flip?: boolean }) {
  return (
    <svg
      className={`mx-auto w-full max-w-62 text-white/88 sm:max-w-sm ${flip ? 'scale-y-[-1]' : ''}`}
      viewBox="0 0 288 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth={0.65}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          opacity={0.92}
          d="M12 20c14-10 28-10 42 0s28 10 42 0 28-10 42 0 28 10 42 0 28-10 42 0 28 10 42 0 28-10 42 0"
        />
        <path
          opacity={0.55}
          d="M44 14c4-5 10-5 14 0M86 22c4 5 10 5 14 0M128 14c4-5 10-5 14 0M170 22c4 5 10 5 14 0M212 14c4-5 10-5 14 0"
        />
        <path opacity={0.45} d="M58 18c-3-4-9-3-11 1M230 18c3-4 9-3 11 1" />
      </g>
      <g fill="currentColor" stroke="none" opacity={0.88}>
        <circle cx="144" cy="18" r="2.2" />
        <ellipse cx="144" cy="12" rx="2.8" ry="4.2" opacity={0.35} />
        <ellipse
          cx="150"
          cy="16"
          rx="2.6"
          ry="3.8"
          opacity={0.32}
          transform="rotate(55 150 16)"
        />
        <ellipse
          cx="138"
          cy="16"
          rx="2.6"
          ry="3.8"
          opacity={0.32}
          transform="rotate(-55 138 16)"
        />
        <ellipse
          cx="144"
          cy="22"
          rx="2.8"
          ry="3.6"
          opacity={0.3}
          transform="rotate(180 144 22)"
        />
      </g>
    </svg>
  );
}

function SaveTheDateBackground() {
  const fullRef = useRef<HTMLImageElement>(null);
  const [fullReady, setFullReady] = useState(false);

  useLayoutEffect(() => {
    const el = fullRef.current;
    if (el?.complete && el.naturalWidth > 0) setFullReady(true);
  }, []);

  return (
    <div
      className="absolute inset-0 block"
      role="img"
      aria-label="Save the date background"
    >
      <div className="absolute inset-0 overflow-hidden">
        <picture className="absolute inset-0 block">
          <source
            media="(min-width: 768px)"
            srcSet={BACKGROUND_PLACEHOLDER_DESKTOP}
          />
          <img
            src={BACKGROUND_PLACEHOLDER_MOBILE}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full origin-center scale-110 object-cover object-center blur-sm"
          />
        </picture>
      </div>
      <picture className="absolute inset-0 block">
        <source media="(min-width: 768px)" srcSet={BACKGROUND_FULL_DESKTOP} />
        <img
          ref={fullRef}
          src={BACKGROUND_FULL_MOBILE}
          alt=""
          decoding="async"
          fetchPriority="low"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-out ${fullReady ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setFullReady(true)}
        />
      </picture>
    </div>
  );
}

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const activeIndex = search.image
    ? ENGAGEMENT_GALLERY_ITEMS.findIndex((i) => i.id === search.image)
    : -1;
  const lightboxOpen = activeIndex >= 0;
  /** After first paint: if `?image` appears, assume in-app navigation (push); closing can use history.back(). */
  const hasRunSearchUrlEffectOnce = useRef(false);
  const prevImageSearchRef = useRef<string | undefined>(undefined);
  const closeLightboxWithBackRef = useRef(false);

  useEffect(() => {
    if (!hasRunSearchUrlEffectOnce.current) {
      hasRunSearchUrlEffectOnce.current = true;
      prevImageSearchRef.current = search.image;
      return;
    }
    const prev = prevImageSearchRef.current;
    prevImageSearchRef.current = search.image;
    if (!search.image) {
      closeLightboxWithBackRef.current = false;
    } else if (!prev) {
      closeLightboxWithBackRef.current = true;
    }
  }, [search.image]);

  const closeLightbox = () => {
    navigate({ to: '/', search: {}, resetScroll: false });
  };

  const goToImage = (index: number) => {
    const item = ENGAGEMENT_GALLERY_ITEMS[index];
    if (!item) return;
    navigate({
      to: '/',
      search: { image: item.id },
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500&display=swap"
      />
      <div className="relative h-svh min-h-svh w-full overflow-hidden text-white">
        <div className="fixed -z-10 h-svh w-full">
          <SaveTheDateBackground />
        </div>
        <div
          className="absolute inset-0 bg-linear-to-b from-black/40 via-black/22 to-black/58"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(95% 58% at 50% 42%, rgba(0,0,0,0) 25%, rgba(0,0,0,0.18) 52%, rgba(0,0,0,0.42) 100%)',
          }}
          aria-hidden
        />

        <div className="relative z-10 flex min-h-svh flex-col px-6 pt-8 pb-10 text-shadow-black/10 text-shadow-md sm:px-10 sm:pt-10 sm:pb-14">
          <header className="w-full max-w-84 shrink-0 self-center sm:max-w-md">
            <FloralDivider />
            <div className="flex flex-col items-center gap-1 px-1 py-3">
              <p
                className="text-center text-[0.66rem] font-medium tracking-[0.28em] text-white uppercase sm:text-[0.76rem]"
                style={{ fontFamily: fontSans }}
              >
                <span className="text-white/55" aria-hidden>
                  ❧{' '}
                </span>
                {SAVE_THE_DATE.month}
                <span className="text-white/55" aria-hidden>
                  {' '}
                  ❧
                </span>
              </p>
              <div className="grid w-full grid-cols-[1fr_auto_1fr] items-end gap-x-2 sm:gap-x-4">
                <p
                  className="self-end justify-self-start text-left text-[0.66rem] leading-snug font-medium tracking-[0.18em] text-white uppercase sm:text-[0.76rem]"
                  style={{ fontFamily: fontSans }}
                >
                  {SAVE_THE_DATE.weekday}
                </p>
                <div className="relative flex justify-center">
                  <p
                    className="relative z-10 text-center text-6xl leading-none font-semibold tracking-tight text-white sm:text-7xl md:text-8xl md:leading-20"
                    style={{ fontFamily: fontSerif }}
                  >
                    {SAVE_THE_DATE.day}
                  </p>
                </div>
                <p
                  className="self-end justify-self-end text-right text-[0.66rem] leading-snug font-medium tracking-[0.18em] text-white uppercase sm:text-[0.76rem]"
                  style={{ fontFamily: fontSans }}
                >
                  {SAVE_THE_DATE.time}
                </p>
              </div>
              <p
                className="text-center text-[0.66rem] font-medium tracking-[0.28em] text-white uppercase sm:text-xs"
                style={{ fontFamily: fontSans }}
              >
                {SAVE_THE_DATE.year}
              </p>
            </div>
            <FloralDivider flip />
          </header>

          <div className="flex flex-1 flex-col items-center justify-center">
            <h1
              className="max-w-[95vw] text-center text-[clamp(3.25rem,12vmin,9.5rem)] leading-[0.92] font-medium tracking-tight"
              style={{ fontFamily: fontSerif }}
            >
              <span className="block">
                Wade <span className="font-normal italic">&amp;</span>
              </span>
              <span className="mt-[0.06em] block">Vada</span>
            </h1>
          </div>

          <Button
            className="mx-auto my-10"
            onClick={() => {
              const el = document.getElementById('gallery');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <ChevronDown className="size-14 animate-pulse cursor-pointer text-slate-200 opacity-70 transition-all hover:scale-125 hover:animate-none hover:text-slate-100" />
          </Button>

          <p
            className="mx-auto max-w-md shrink-0 text-center text-base leading-snug font-normal text-white/95 italic sm:text-lg"
            style={{ fontFamily: fontSerif }}
          >
            {SAVE_THE_DATE.tagline}
          </p>
        </div>
      </div>
      <div
        id="gallery"
        className="min-h-svh bg-black/80 px-4 py-14 backdrop-blur-lg sm:px-8 sm:py-16"
      >
        <div className="mx-auto max-w-6xl text-white">
          <h2
            className="mb-10 text-center font-serif text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ fontFamily: fontSerif }}
          >
            Gallery
          </h2>
          <MosaicGallery
            images={ENGAGEMENT_MOSAIC_IMAGES}
            onTileClick={(index) => {
              const id = ENGAGEMENT_GALLERY_ITEMS[index]?.id;
              navigate({ to: '.', search: { image: id }, resetScroll: false });
            }}
            className="pb-4"
          />
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        images={ENGAGEMENT_GALLERY_ITEMS}
        activeIndex={lightboxOpen ? activeIndex : 0}
        onClose={closeLightbox}
        onNavigate={goToImage}
      />
    </>
  );
}
