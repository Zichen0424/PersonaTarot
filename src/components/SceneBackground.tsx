import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

export type SceneGroup = 'the' | 'daily';
export const RIPPLE_DURATION = 2200;
export const sceneImages: Record<SceneGroup, string> = {
  the: './assets/emptybackground1.jpg',
  daily: './assets/emptybackground2.jpg',
};
const imageLoads = new Map<string, Promise<void>>();
function preload(src: string) {
  if (!imageLoads.has(src)) {
    imageLoads.set(
      src,
      new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = () => {
          void image
            .decode()
            .catch(() => {})
            .then(resolve);
        };
        image.onerror = () => resolve();
        image.src = src;
      }),
    );
  }
  return imageLoads.get(src)!;
}

/** Only a change between THE and DAILY creates a ripple; mounting a page never does. */
export function SceneBackground({
  group,
  motionEnabled,
}: {
  group: SceneGroup;
  motionEnabled: boolean;
}) {
  const [scene, setScene] = useState<{
    base: SceneGroup;
    incoming: SceneGroup | null;
    serial: number;
  }>(() => ({ base: group, incoming: null, serial: 0 }));
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const host = useRef<HTMLDivElement>(null);
  const previous = useRef(group);
  const running = useRef(false);
  const duration = `${RIPPLE_DURATION}ms`;

  useLayoutEffect(() => {
    const node = host.current;
    if (!node) return;
    const measure = () => {
      const { width, height } = node.getBoundingClientRect();
      // Radius reaches the farthest corner even on very tall mobile scenes.
      const radius = Math.ceil(Math.hypot(width * 0.54, height * 0.54)) + 8;
      node.style.setProperty('--ripple-radius', `${radius}px`);
      node.style.setProperty('--ripple-diameter', `${radius * 2}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    Object.values(sceneImages).forEach((src) => void preload(src));
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const changed = previous.current !== group;
    previous.current = group;
    let cancelled = false;
    let timer: number | undefined;
    if (!motionEnabled || reduced || (changed && running.current)) {
      // Rapid reversals settle on the latest selection, never a stale delayed scene.
      running.current = false;
      setScene((current) => ({ ...current, base: group, incoming: null }));
    } else if (changed) {
      running.current = true;
      void preload(sceneImages[group]).then(() => {
        if (cancelled) return;
        setScene((current) => ({ ...current, incoming: group, serial: current.serial + 1 }));
        timer = window.setTimeout(() => {
          running.current = false;
          setScene((current) => ({ ...current, base: group, incoming: null }));
        }, RIPPLE_DURATION);
      });
    }
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [group, motionEnabled, reduced]);

  return (
    <div
      className="scene-background"
      ref={host}
      aria-hidden="true"
      data-scene={group}
      data-transitioning={scene.incoming !== null}
      style={{ '--ripple-duration': duration } as CSSProperties}
    >
      <img
        className="scene-image"
        src={sceneImages[scene.base]}
        alt=""
        width="2730"
        height="1536"
        fetchPriority="high"
      />
      {scene.incoming && (
        <div className="scene-ripple" key={scene.serial}>
          <img
            className="scene-image ripple-reveal"
            src={sceneImages[scene.incoming]}
            alt=""
            width="2730"
            height="1536"
          />
          <span className="ripple-ring ripple-ring-outer" />
          <span className="ripple-ring ripple-ring-inner" />
          <span className="ripple-ring ripple-ring-trailing" />
        </div>
      )}
    </div>
  );
}
