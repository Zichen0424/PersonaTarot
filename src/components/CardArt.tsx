import { useId } from 'react';
import { ArcanaSymbol } from './ArcanaSymbol';

export function CardArt({
  id = 0,
  back = false,
  name = '',
  english = '',
  roman = '',
  isReversed = false,
}: {
  id?: number;
  back?: boolean;
  name?: string;
  english?: string;
  roman?: string;
  isReversed?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const tone = ['#9af3fd', '#dbec59', '#c4b3ff', '#ff9cbe'][id % 4];
  return (
    <svg
      className={`card-art ${isReversed ? 'is-reversed' : ''}`}
      viewBox="0 0 240 400"
      role="img"
      aria-label={back ? '蓝色时刻塔罗牌背' : `${name}，${isReversed ? '逆位' : '正位'}`}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x2="1" y2="1">
          <stop stopColor="#2467bb" />
          <stop offset=".5" stopColor="#8bc9e0" />
          <stop offset="1" stopColor="#244479" />
        </linearGradient>
        <linearGradient id={`${uid}-inner`} x2=".8" y2="1">
          <stop stopColor="#16337c" />
          <stop offset="1" stopColor="#086bd1" />
        </linearGradient>
        <pattern id={`${uid}-lines`} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 0h6" stroke="#d1f4ff" strokeOpacity=".09" />
        </pattern>
      </defs>
      <rect x="1" y="1" width="238" height="398" rx="9" fill={`url(#${uid}-bg)`} />
      <path
        d="M30 15H210Q210 30 225 35V365Q210 370 210 385H30Q30 370 15 365V35Q30 30 30 15Z"
        fill="#050d24"
        stroke="#d1e9ed"
        strokeWidth="2"
      />
      <path
        d="M40 32H200L211 44V354L197 368H43L29 354V44Z"
        fill={`url(#${uid}-inner)`}
        stroke={tone}
        strokeWidth="1"
      />
      {back ? (
        <g fill="none" stroke="#b2edff">
          <path d="M120 65 197 200 120 335 43 200Z" strokeWidth="2" />
          <path d="M120 90 180 200 120 310 60 200Z" strokeOpacity=".5" />
          <circle cx="120" cy="200" r="61" strokeWidth="2" />
          <circle cx="120" cy="200" r="50" />
          <path d="M45 200h150M120 73v254" strokeOpacity=".6" />
          <path d="m132 135-49 80h32l-9 54 50-80h-34z" fill="#a8eeff" stroke="none" />
          {[70, 330].map((y) => (
            <path key={y} d={`m120 ${y - 9} 5 9-5 9-5-9z`} fill="#d4f9ff" />
          ))}
          <text
            x="120"
            y="352"
            textAnchor="middle"
            fill="#c9f8ff"
            stroke="none"
            fontSize="10"
            letterSpacing="4"
          >
            BLUE HOUR
          </text>
        </g>
      ) : (
        <>
          <g stroke={tone} fill="none" opacity=".65">
            <circle cx="120" cy="194" r="78" />
            <circle cx="120" cy="194" r="71" />
            <path d="M37 95 204 298M36 298 204 95M120 57v282" />
          </g>
          <g fill="#070d25">
            <path d="M30 295 211 192v163H30Z" />
            <path d="M30 32 211 132 211 32Z" />
          </g>
          <ArcanaSymbol id={id} tone={tone} />
          <path d="M67 22Q120 75 173 22" fill="#050d24" stroke={tone} strokeWidth="2" />
          <text
            x="120"
            y="47"
            textAnchor="middle"
            fill="#e4fbfc"
            fontFamily="Georgia,serif"
            fontSize="24"
          >
            {roman}
          </text>
          <path d="M39 343H201V368H39Z" fill="#050d24" />
          <text
            x="120"
            y="360"
            textAnchor="middle"
            fill="#e4fbfc"
            fontFamily="Arial,sans-serif"
            fontSize={english.length > 15 ? 11 : 14}
            letterSpacing="1"
          >
            {english}
          </text>
        </>
      )}
      <rect
        x="1"
        y="1"
        width="238"
        height="398"
        rx="9"
        fill={`url(#${uid}-lines)`}
        pointerEvents="none"
      />
      {[
        [16, 17],
        [224, 17],
        [16, 383],
        [224, 383],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="9" fill="#050d24" />
          <circle
            cx={x}
            cy={y}
            r="6"
            fill="none"
            stroke={back ? '#81d7fd' : tone}
            strokeWidth="1.5"
          />
        </g>
      ))}
    </svg>
  );
}
