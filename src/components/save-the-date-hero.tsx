import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import {
  SAVE_THE_DATE,
  SAVE_THE_DATE_BG_FULL_DESKTOP,
  SAVE_THE_DATE_BG_FULL_MOBILE,
  SAVE_THE_DATE_BG_PLACEHOLDER_DESKTOP,
  SAVE_THE_DATE_BG_PLACEHOLDER_MOBILE,
  SAVE_THE_DATE_FONT_STYLESHEET,
  saveTheDateFontSans,
  saveTheDateFontSerif,
} from '@/lib/save-the-date-constants';

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
            srcSet={SAVE_THE_DATE_BG_PLACEHOLDER_DESKTOP}
          />
          <img
            src={SAVE_THE_DATE_BG_PLACEHOLDER_MOBILE}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full origin-center scale-110 object-cover object-center blur-sm"
          />
        </picture>
      </div>
      <picture className="absolute inset-0 block">
        <source
          media="(min-width: 768px)"
          srcSet={SAVE_THE_DATE_BG_FULL_DESKTOP}
        />
        <img
          ref={fullRef}
          src={SAVE_THE_DATE_BG_FULL_MOBILE}
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

type SaveTheDateHeroProps = {
  /** Element id to scroll to when the chevron is clicked. */
  scrollTargetId: string;
};

export function SaveTheDateHero({ scrollTargetId }: SaveTheDateHeroProps) {
  return (
    <>
      <link rel="stylesheet" href={SAVE_THE_DATE_FONT_STYLESHEET} />
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
                style={{ fontFamily: saveTheDateFontSans }}
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
                  style={{ fontFamily: saveTheDateFontSans }}
                >
                  {SAVE_THE_DATE.weekday}
                </p>
                <div className="relative flex justify-center">
                  <p
                    className="relative z-10 text-center text-6xl leading-none font-semibold tracking-tight text-white sm:text-7xl md:text-8xl md:leading-20"
                    style={{ fontFamily: saveTheDateFontSerif }}
                  >
                    {SAVE_THE_DATE.day}
                  </p>
                </div>
                <p
                  className="self-end justify-self-end text-right text-[0.66rem] leading-snug font-medium tracking-[0.18em] text-white uppercase sm:text-[0.76rem]"
                  style={{ fontFamily: saveTheDateFontSans }}
                >
                  {SAVE_THE_DATE.time}
                </p>
              </div>
              <p
                className="text-center text-[0.66rem] font-medium tracking-[0.28em] text-white uppercase sm:text-xs"
                style={{ fontFamily: saveTheDateFontSans }}
              >
                {SAVE_THE_DATE.year}
              </p>
            </div>
            <FloralDivider flip />
          </header>

          <div className="flex flex-1 flex-col items-center justify-center">
            <h1
              className="max-w-[95vw] text-center text-[clamp(3.25rem,12vmin,9.5rem)] leading-[0.92] font-medium tracking-tight"
              style={{ fontFamily: saveTheDateFontSerif }}
            >
              <span className="block">
                Vada <span className="font-normal italic">&amp;</span>
              </span>
              <span className="mt-[0.06em] block">Wade</span>
            </h1>
          </div>

          <Button
            className="mx-auto mt-10"
            onClick={() => {
              const el = document.getElementById(scrollTargetId);
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <ChevronDown className="size-14 animate-pulse cursor-pointer text-slate-200 opacity-70 transition-all hover:scale-125 hover:animate-none hover:text-slate-100" />
          </Button>
        </div>
      </div>
    </>
  );
}
