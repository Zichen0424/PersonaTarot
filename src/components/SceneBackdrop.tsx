import type { CSSProperties } from 'react';

/** Decorative layers share a coordinate system and never intercept input. */
export function SceneBackdrop() {
  return (
    <div className="scene-backdrop" aria-hidden="true">
      <div className="scene-light scene-light-one" />
      <div className="scene-light scene-light-two" />
      <svg className="scene-water" viewBox="0 0 1600 500" preserveAspectRatio="none">
        <path d="M-200 160 Q100 10 400 130 T1000 100 T1800 30 L1800 80 Q1450 190 1200 130 T600 185 T-200 230Z" />
        <path d="M-200 260 Q200 110 500 250 T1100 210 T1800 140 L1800 180 Q1450 270 1200 240 T600 300 T-200 320Z" />
        <path d="M-200 370 Q200 240 500 340 T1100 320 T1800 250 L1800 285 Q1500 375 1150 360 T500 390 T-200 420Z" />
      </svg>
      <div className="scene-dial">
        <span className="dial-hand" />
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ '--tick': i } as CSSProperties} />
        ))}
      </div>
      <div className="scene-shards">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} style={{ '--particle': i } as CSSProperties} />
        ))}
      </div>
    </div>
  );
}

export function SceneWipe({ label }: { label: string }) {
  return (
    <div className="scene-wipe" aria-hidden="true">
      <div className="wipe-band wipe-cyan" />
      <div className="wipe-band wipe-blue">
        <span>{label}</span>
      </div>
      <div className="wipe-line" />
    </div>
  );
}
