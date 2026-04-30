import { useCallback, useEffect, useId, useRef, type TouchEvent } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Description,
  CloseButton,
  Button,
} from '@headlessui/react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import {
  InteractiveViewport,
  type InteractiveViewportHandle,
} from '@/components/interactive-viewport';
import { useFullImageReady } from '@/lib/use-full-image-ready';

import type { LightboxImage } from './types';
import { useAdjacentImagePreload } from './use-adjacent-image-preload';
import { useBodyScrollLock } from './use-body-scroll-lock';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const SWIPE_PX = 56;

export type LightboxProps = {
  open: boolean;
  images: readonly LightboxImage[];
  /** Index into `images`; ignored when `open` is false */
  activeIndex: number;
  onClose: () => void;
  /** Called when navigating to another slide (keyboard, swipe, buttons) */
  onNavigate: (index: number) => void;
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function LightboxSlideImage({
  image,
  sizes,
}: {
  image: LightboxImage;
  sizes: string;
}) {
  const { fullReady, imgRef } = useFullImageReady(image.src);
  const hasDims = image.width != null && image.height != null;

  if (hasDims && image.width != null && image.height != null) {
    return (
      <div
        className="relative max-h-[min(85dvh,960px)] w-full max-w-[min(96vw,1400px)]"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        {image.placeholderSrc ? (
          <img
            src={image.placeholderSrc}
            alt=""
            aria-hidden
            width={image.width}
            height={image.height}
            loading="eager"
            decoding="async"
            sizes={sizes}
            className={clsx(
              'absolute inset-0 h-full w-full object-contain blur-md transition-opacity duration-300',
              fullReady ? 'opacity-0' : 'opacity-100',
            )}
          />
        ) : null}
        <img
          ref={imgRef}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="eager"
          decoding="async"
          sizes={sizes}
          draggable={false}
          className={clsx(
            'relative z-10 h-full w-full object-contain transition-opacity duration-300',
            fullReady ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>
    );
  }

  return (
    <div className="relative inline-flex max-h-[85dvh] w-full max-w-[min(96vw,1400px)] justify-center">
      {image.placeholderSrc ? (
        <img
          src={image.placeholderSrc}
          alt=""
          aria-hidden
          loading="eager"
          decoding="async"
          sizes={sizes}
          className={clsx(
            'relative z-0 block max-h-[85dvh] max-w-full object-contain blur-md transition-opacity duration-300',
            fullReady ? 'opacity-0' : 'opacity-100',
          )}
        />
      ) : null}
      <img
        ref={imgRef}
        src={image.src}
        alt={image.alt}
        loading="eager"
        decoding="async"
        sizes={sizes}
        draggable={false}
        className={clsx(
          image.placeholderSrc
            ? 'absolute inset-0 z-10 m-auto max-h-[85dvh] max-w-full object-contain transition-opacity duration-300'
            : 'relative z-10 block max-h-[85dvh] max-w-full object-contain transition-opacity duration-300',
          fullReady ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
}

/**
 * Accessible image lightbox: navigation, pinch/double-tap zoom (`InteractiveViewport`), swipe between slides.
 * Modal shell uses Headless UI `Dialog`; routing stays outside this component.
 */
export function Lightbox({
  open,
  images,
  activeIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const safeIndex = clamp(activeIndex, 0, Math.max(0, images.length - 1));
  const current = images[safeIndex];
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const viewportRef = useRef<InteractiveViewportHandle>(null);

  useBodyScrollLock(open);
  useAdjacentImagePreload(images, safeIndex);

  const goPrev = useCallback(() => {
    if (safeIndex <= 0) return;
    onNavigate(safeIndex - 1);
  }, [onNavigate, safeIndex]);

  const goNext = useCallback(() => {
    if (safeIndex >= images.length - 1) return;
    onNavigate(safeIndex + 1);
  }, [images.length, onNavigate, safeIndex]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, open]);

  const touchStartNav = useRef<{ x: number; y: number } | null>(null);

  const canSwipeNavigate = () => (viewportRef.current?.getScale() ?? 1) <= 1.02;

  const onTouchStartCaptureNav = (e: TouchEvent) => {
    if (e.touches.length >= 2) {
      touchStartNav.current = null;
    }
  };

  const onTouchStartNav = (e: TouchEvent) => {
    if (!canSwipeNavigate() || e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartNav.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEndNav = (e: TouchEvent) => {
    if (e.touches.length > 0) return;

    if (e.changedTouches.length !== 1) return;

    if (!canSwipeNavigate()) {
      touchStartNav.current = null;
      return;
    }

    const t = e.changedTouches[0];
    const start = touchStartNav.current;
    touchStartNav.current = null;
    if (!start) return;

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (ay > ax && dy < -SWIPE_PX) {
      onClose();
      return;
    }

    if (ax > ay) {
      if (dx > SWIPE_PX) goPrev();
      else if (dx < -SWIPE_PX) goNext();
    }
  };

  if (!current) {
    return null;
  }

  const labelBase = current.title ?? current.alt;
  const headingText =
    images.length > 1
      ? `${labelBase} (${safeIndex + 1} of ${images.length})`
      : labelBase;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      transition
      initialFocus={closeRef}
      className="relative z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div className="fixed inset-0 flex items-center justify-center p-0 sm:p-4">
        <DialogPanel className="flex h-dvh max-h-dvh w-full max-w-[1600px] flex-col overflow-hidden rounded-none shadow-2xl sm:rounded-xl">
          <DialogTitle id={titleId} className="sr-only">
            {headingText}
          </DialogTitle>

          <div className="flex shrink-0 items-center justify-between gap-2 bg-black/80 px-3 py-3 sm:px-4">
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-white/95 sm:text-base">
              {current.title ?? current.alt}
            </p>
            <CloseButton
              ref={closeRef}
              aria-label="Close lightbox"
              className="flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            >
              <span className="sr-only">Close</span>
              <span aria-hidden className="text-2xl leading-none">
                ×
              </span>
            </CloseButton>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden"
            onTouchStartCapture={onTouchStartCaptureNav}
            onTouchStart={onTouchStartNav}
            onTouchEnd={onTouchEndNav}
          >
            <InteractiveViewport
              key={current.id}
              ref={viewportRef}
              className="aspect-auto h-full min-h-0 w-full max-w-none flex-1"
              scaleBounds={{ min: MIN_ZOOM, max: MAX_ZOOM }}
            >
              <LightboxSlideImage
                image={current}
                sizes="(max-width: 640px) 96vw, (max-width: 1024px) 90vw, min(1400px, 96vw)"
              />
            </InteractiveViewport>

            {images.length > 1 ? (
              <>
                <Button
                  onClick={goPrev}
                  disabled={safeIndex <= 0}
                  aria-label="Previous image"
                  className="absolute top-1/2 left-0 z-10 flex size-14 -translate-y-1/2 touch-manipulation items-center justify-center rounded-r-2xl bg-black/55 text-white hover:bg-black/70 disabled:opacity-30 sm:size-18"
                >
                  <ChevronLeft className="size-8 sm:size-9" aria-hidden />
                </Button>
                <Button
                  onClick={goNext}
                  disabled={safeIndex >= images.length - 1}
                  aria-label="Next image"
                  className="absolute top-1/2 right-0 z-10 flex size-14 -translate-y-1/2 touch-manipulation items-center justify-center rounded-l-2xl bg-black/55 text-white hover:bg-black/70 disabled:opacity-30 sm:size-18"
                >
                  <ChevronRight className="size-8 sm:size-9" aria-hidden />
                </Button>
              </>
            ) : null}
          </div>

          {(current.description || images.length > 1) && (
            <div className="shrink-0 border-t border-white/10 bg-black/85 px-4 py-3">
              {current.description ? (
                <Description className="text-sm leading-relaxed text-white/85">
                  {current.description}
                </Description>
              ) : null}
              {images.length > 1 ? (
                <p className="mt-2 text-xs text-white/55 sm:hidden">
                  Swipe to browse or up to close. Pinch or double-tap to zoom.
                </p>
              ) : null}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
