import { type CSSProperties, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';

import { useFullImageReady } from '@/lib/use-full-image-ready';

/** Recognizes TanStack Router paths (`/…`), hash links (`#…`), and external/protocol URLs. */
export type MosaicGalleryHrefKind = 'internal' | 'external' | 'hash';

export function getHrefKind(href: string): MosaicGalleryHrefKind {
  const t = href.trim();
  if (t.startsWith('#')) return 'hash';
  if (t.startsWith('//')) return 'external';
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return 'external';
  if (t.startsWith('/')) return 'internal';
  return 'external';
}

/**
 * Normalized rectangle (0–1) relative to the full image’s width and height.
 * Used to show only a region inside the mosaic tile via CSS (no image file changes).
 */
export type MosaicNormalizedCrop = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type MosaicGalleryImage = {
  /** Full-resolution image URL */
  src: string;
  /** Optional tiny/low-res image shown until `src` has loaded */
  placeholderSrc?: string;
  /** Accessible description (required) */
  alt: string;
  /** Intrinsic dimensions — strongly recommended to reduce layout shift */
  width?: number;
  height?: number;
  /**
   * When set, the tile clip shows this region only (CSS positioning + overflow).
   * Tile aspect ratio follows the crop for a more varied mosaic.
   */
  mosaicCrop?: MosaicNormalizedCrop;
  /** Wrap tile in a link: internal app routes use `Link`, others use `<a>` */
  href?: string;
};

type MosaicGalleryBaseProps = {
  images: readonly MosaicGalleryImage[];
  className?: string;
  /** Applied to each tile wrapper (column item) */
  itemClassName?: string;
};

/**
 * Link tiles: `(index) => href`; merge with each image's `href` when you return `undefined`.
 * Mutual exclusion with {@link MosaicGalleryPropsOnClick.onTileClick `onTileClick`}.
 */
export type MosaicGalleryPropsWithHref = MosaicGalleryBaseProps & {
  getTileHref?: (index: number) => string | undefined;
  onTileClick?: undefined;
};

/**
 * Action tiles: tiles are `<button>`s, not links. Overrides per-image `href`.
 * Mutual exclusion with {@link MosaicGalleryPropsWithHref.getTileHref `getTileHref`}.
 */
export type MosaicGalleryPropsOnClick = MosaicGalleryBaseProps & {
  getTileHref?: undefined;
  onTileClick?: (index: number) => void;
};

export type MosaicGalleryProps =
  | MosaicGalleryPropsWithHref
  | MosaicGalleryPropsOnClick;

function GallerySurfaceLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const kind = getHrefKind(href);

  if (kind === 'internal') {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  const openInNewTab =
    /^https?:\/\//i.test(href.trim()) || href.trim().startsWith('//');

  return (
    <a
      href={href}
      className={className}
      {...(openInNewTab
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {children}
    </a>
  );
}

/** CSS-only crop: container clips; image is scaled and offset so [x,y,w,h] fills the tile. */
function mosaicCropImgStyle(crop: MosaicNormalizedCrop): CSSProperties {
  const { x, y, w, h } = crop;
  return {
    width: `${100 / w}%`,
    height: 'auto',
    maxWidth: 'none',
    left: `${(-x / w) * 100}%`,
    top: `${(-y / h) * 100}%`,
  };
}

function ProgressiveTile({
  src,
  placeholderSrc,
  alt,
  width,
  height,
  mosaicCrop,
}: Pick<
  MosaicGalleryImage,
  | 'src'
  | 'placeholderSrc'
  | 'alt'
  | 'width'
  | 'height'
  | 'mosaicCrop'
>) {
  const { fullReady, imgRef } = useFullImageReady(src);
  const sized = width != null && height != null;
  const cropStyle =
    sized && mosaicCrop ? mosaicCropImgStyle(mosaicCrop) : undefined;
  const cropAspect =
    sized && mosaicCrop
      ? `${mosaicCrop.w * width} / ${mosaicCrop.h * height}`
      : null;

  if (sized) {
    return (
      <div
        className="relative w-full overflow-hidden"
        style={
          cropAspect
            ? { aspectRatio: cropAspect }
            : { aspectRatio: `${width} / ${height}` }
        }
      >
        {placeholderSrc ? (
          <img
            src={placeholderSrc}
            alt=""
            aria-hidden
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={clsx(
              'absolute scale-[1.02] blur-sm transition-opacity duration-500 ease-out',
              mosaicCrop
                ? 'max-w-none h-auto'
                : 'inset-0 h-full w-full object-cover',
              fullReady ? 'opacity-0' : 'opacity-100',
            )}
            style={mosaicCrop ? cropStyle : undefined}
          />
        ) : null}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={clsx(
            'absolute z-10 transition-opacity duration-500 ease-out',
            mosaicCrop
              ? 'max-w-none h-auto'
              : 'inset-0 h-full w-full object-cover',
            fullReady ? 'opacity-100' : 'opacity-0',
          )}
          style={mosaicCrop ? cropStyle : undefined}
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden',
        !fullReady && 'min-h-48 bg-slate-800/50',
      )}
    >
      {placeholderSrc ? (
        <>
          <img
            src={placeholderSrc}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={clsx(
              'relative z-0 block h-auto w-full blur-sm transition-opacity duration-500 ease-out',
              fullReady ? 'opacity-0' : 'opacity-100',
            )}
          />
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={clsx(
              'absolute top-0 left-0 z-10 h-full w-full object-cover transition-opacity duration-500 ease-out',
              fullReady ? 'opacity-100' : 'opacity-0',
            )}
          />
        </>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={clsx(
            'relative z-10 block h-auto w-full transition-opacity duration-500 ease-out',
            fullReady ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  );
}

const tileShellClasses =
  'overflow-hidden rounded-xl bg-slate-800/40 shadow-sm ring-1 ring-white/10 transition-[filter,transform] duration-300 ease-out';

const linkRingClasses =
  'group block w-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900';

const interactiveButtonExtras =
  'cursor-pointer appearance-none border-0 bg-transparent p-0 text-left';

function MosaicTile({
  image,
  itemClassName,
  tileHref,
  onTilePress,
}: {
  image: MosaicGalleryImage;
  itemClassName?: string;
  tileHref?: string;
  onTilePress?: () => void;
}) {
  const figure = (
    <figure
      className={clsx(
        'm-0',
        tileShellClasses,
        (tileHref || onTilePress) &&
          'group-hover:shadow-md group-hover:brightness-110 group-active:brightness-95',
        itemClassName,
      )}
    >
      <ProgressiveTile
        src={image.src}
        placeholderSrc={image.placeholderSrc}
        alt={image.alt}
        width={image.width}
        height={image.height}
        mosaicCrop={image.mosaicCrop}
      />
    </figure>
  );

  const body = onTilePress ? (
    <button
      type="button"
      aria-label={image.alt}
      className={clsx(linkRingClasses, interactiveButtonExtras)}
      onClick={onTilePress}
    >
      {figure}
    </button>
  ) : tileHref ? (
    <GallerySurfaceLink href={tileHref} className={linkRingClasses}>
      {figure}
    </GallerySurfaceLink>
  ) : (
    figure
  );

  return (
    <div className="mb-4 break-inside-avoid [page-break-inside:avoid]">
      {body}
    </div>
  );
}

/**
 * Responsive CSS-column mosaic gallery with lazy-loaded images and optional LQIP-style placeholders.
 *
 * @example
 * ```tsx
 * import { MosaicGallery } from '@/components/mosaic-gallery';
 *
 * <MosaicGallery
 *   images={[{ src: '/photo.webp', alt: 'Party', width: 1200, height: 800 }]}
 * />
 * ```
 */
export function MosaicGallery({
  images,
  className,
  itemClassName,
  getTileHref,
  onTileClick,
}: MosaicGalleryProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        'columns-2 gap-x-4 sm:columns-3 sm:gap-x-5 lg:columns-4 lg:gap-x-6',
        className,
      )}
    >
      {images.map((image, index) => (
        <MosaicTile
          key={`${image.src}::${image.alt}::${index}`}
          image={image}
          itemClassName={itemClassName}
          tileHref={
            onTileClick
              ? undefined
              : (getTileHref?.(index) ?? image.href)
          }
          onTilePress={
            onTileClick ? () => onTileClick(index) : undefined
          }
        />
      ))}
    </div>
  );
}
