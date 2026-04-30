import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type MouseEventHandler,
  type TouchEvent,
} from 'react';
import { useSpring, animated } from '@react-spring/web';
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react';
import clsx from 'clsx';

const useGesture = createUseGesture([dragAction, pinchAction]);

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export type InteractiveViewportScaleBounds = {
  min: number;
  max: number;
};

export type InteractiveViewportHandle = {
  getScale: () => number;
};

export type InteractiveViewportProps = {
  children: React.ReactNode;
  /** Defaults to a square box; override for fluid layouts (e.g. lightbox). */
  className?: string;
  scaleBounds?: InteractiveViewportScaleBounds;
  /** Optional hook after pinch/drag releases (e.g. analytics). */
  onScaleCommit?: (scale: number) => void;
  onDoubleClick?: MouseEventHandler<HTMLDivElement>;
};

export const InteractiveViewport = forwardRef<
  InteractiveViewportHandle,
  InteractiveViewportProps
>(function InteractiveViewport(
  {
    children,
    className,
    scaleBounds = { min: 1, max: 8 },
    onScaleCommit,
    onDoubleClick,
  },
  ref,
) {
  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: {
      duration: 100,
    },
  }));

  const surfaceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const boundsMin = scaleBounds.min;
  const boundsMax = scaleBounds.max;

  const getBounds = useCallback((scale?: number) => {
    if (!surfaceRef.current || !containerRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerW = containerRect.width;
    const containerH = containerRect.height;
    if (containerW <= 0 || containerH <= 0) return null;
    const subjectRect =
      scale != null ? null : surfaceRef.current.getBoundingClientRect();
    const subjectW = scale != null ? containerW * scale : subjectRect!.width;
    const subjectH = scale != null ? containerH * scale : subjectRect!.height;
    const overflowX = subjectW - containerW;
    const overflowY = subjectH - containerH;
    const minX = Math.min(0, -overflowX / 2);
    const minY = Math.min(0, -overflowY / 2);
    const maxX = Math.max(0, overflowX / 2);
    const maxY = Math.max(0, overflowY / 2);
    return { minX, minY, maxX, maxY };
  }, []);

  const clampToBounds = useCallback(
    (px: number, py: number, scale?: number) => {
      const b = getBounds(scale);
      if (!b) return [px, py] as const;
      const cx = Math.min(b.maxX, Math.max(b.minX, px));
      const cy = Math.min(b.maxY, Math.max(b.minY, py));
      if (!Number.isFinite(cx) || !Number.isFinite(cy))
        return [px, py] as const;
      return [cx, cy] as const;
    },
    [getBounds],
  );

  const springRef = useRef({
    api,
    style,
    clampToBounds,
    boundsMin,
    boundsMax,
    onScaleCommit,
  });
  springRef.current = {
    api,
    style,
    clampToBounds,
    boundsMin,
    boundsMax,
    onScaleCommit,
  };

  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', handler);
    document.addEventListener('gesturechange', handler);
    document.addEventListener('gestureend', handler);
    return () => {
      document.removeEventListener('gesturestart', handler);
      document.removeEventListener('gesturechange', handler);
      document.removeEventListener('gestureend', handler);
    };
  }, []);

  type PinchMemo = readonly [number, number, number, number];

  const bind = useGesture(
    {
      onDrag: ({ pinching, cancel, offset: [x, y], last }) => {
        if (pinching) return cancel();
        api.start({ x, y });
        if (last) onScaleCommit?.(style.scale.get());
      },
      onPinch: ({
        origin: [ox, oy],
        first,
        movement: [ms],
        offset: [s],
        memo,
        last,
      }) => {
        let m: PinchMemo;
        if (first) {
          const { width, height, x, y } =
            surfaceRef.current!.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          m = [style.x.get(), style.y.get(), tx, ty];
        } else {
          m = memo as PinchMemo;
        }
        const px = m[0] - (ms - 1) * m[2];
        const py = m[1] - (ms - 1) * m[3];
        const [clampedX, clampedY] = clampToBounds(px, py, s);
        api.start({ scale: s, x: clampedX, y: clampedY });
        if (last) onScaleCommit?.(style.scale.get());
        return m;
      },
    },
    {
      drag: {
        filter: () => style.scale.get() > 1.02,
        from: () => [style.x.get(), style.y.get()],
        bounds: () => {
          const b = getBounds();
          if (!b) return {};
          return { left: b.minX, top: b.minY, right: b.maxX, bottom: b.maxY };
        },
        rubberband: true,
      },
      pinch: {
        scaleBounds: { min: boundsMin, max: boundsMax },
        rubberband: true,
      },
    },
  );

  const toggleZoom = useCallback(() => {
    const {
      api: a,
      style: st,
      boundsMin: bm,
      boundsMax: bmx,
      clampToBounds: ctb,
      onScaleCommit: osc,
    } = springRef.current;
    const s = st.scale.get();
    if (s > 1.05) {
      a.start({ scale: bm, x: 0, y: 0, immediate: true });
      osc?.(bm);
      return;
    }
    const target = clamp(Math.min(2, bmx), bm, bmx);
    const [cx, cy] = ctb(0, 0, target);
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;
    a.start({ scale: target, x: cx, y: cy, immediate: true });
    osc?.(target);
  }, []);

  /** True while ≥2 fingers were involved — avoids pinch finger lifts matching “double tap”. */
  const multiTouchSessionRef = useRef(false);

  const lastTapRef = useRef<{ t: number; x: number; y: number } | null>(null);

  const onContainerTouchStartCapture = (e: TouchEvent) => {
    if (e.touches.length >= 2) {
      multiTouchSessionRef.current = true;
    }
  };

  const onContainerTouchEnd = (e: TouchEvent) => {
    if (e.touches.length > 0) return;

    if (multiTouchSessionRef.current) {
      multiTouchSessionRef.current = false;
      lastTapRef.current = null;
      return;
    }

    if (e.changedTouches.length !== 1) return;
    const x = e.changedTouches[0].clientX;
    const y = e.changedTouches[0].clientY;
    const now = performance.now();
    const prev = lastTapRef.current;
    lastTapRef.current = { t: now, x, y };
    if (
      prev &&
      now - prev.t < 280 &&
      Math.abs(x - prev.x) < 28 &&
      Math.abs(y - prev.y) < 28
    ) {
      lastTapRef.current = null;
      toggleZoom();
    }
  };

  const mergedDoubleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    onDoubleClick?.(e);
    if (!e.defaultPrevented) toggleZoom();
  };

  useImperativeHandle(
    ref,
    () => ({
      getScale: () => springRef.current.style.scale.get(),
    }),
    [],
  );

  return (
    <div
      ref={containerRef}
      onTouchStartCapture={onContainerTouchStartCapture}
      onTouchEnd={onContainerTouchEnd}
      className={clsx(
        'relative flex aspect-square w-full touch-none items-center justify-center select-none',
        className,
      )}
    >
      <animated.div
        ref={surfaceRef}
        {...bind()}
        style={style}
        onDoubleClick={mergedDoubleClick}
        className="absolute flex touch-none items-center justify-center"
      >
        {children}
      </animated.div>
    </div>
  );
});
