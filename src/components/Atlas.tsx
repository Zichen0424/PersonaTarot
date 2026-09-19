import { useEffect, useRef, useState } from 'react';
import { cards } from '../data/tarot';
import type { Orientation } from '../data/tarot';
import { CardArt } from './CardArt';
import { SceneBackdrop } from './SceneBackdrop';

export function Atlas({
  selectedId,
  motionEnabled,
}: {
  selectedId: number;
  motionEnabled: boolean;
}) {
  const [orientation, setOrientation] = useState<Orientation>('upright');
  const list = useRef<HTMLDivElement>(null);
  const card = cards[selectedId];
  const meaning = card[orientation];
  function select(id: number) {
    window.location.hash = `/atlas/${(id + cards.length) % cards.length}`;
  }
  useEffect(() => {
    const scrollToSelected = () => {
      const active = list.current?.querySelector<HTMLButtonElement>(
        `[data-card-id="${selectedId}"]`,
      );
      if (active && list.current) {
        const container = list.current;
        const reduced =
          !motionEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (window.innerWidth <= 900)
          container.scrollTo({
            left: active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2,
            behavior: reduced ? 'instant' : 'smooth',
          });
        else
          container.scrollTo({
            top: active.offsetTop - container.clientHeight / 2 + active.clientHeight / 2,
            behavior: reduced ? 'instant' : 'smooth',
          });
      }
    };
    scrollToSelected();
    window.addEventListener('resize', scrollToSelected);
    return () => window.removeEventListener('resize', scrollToSelected);
  }, [selectedId, motionEnabled]);
  return (
    <main className="atlas-page">
      <SceneBackdrop />
      <div className="atlas-heading">
        <a className="back-link" href="#/" aria-label="返回占卜">
          ↙ <span>返回占卜</span>
        </a>
        <span>
          ARCANA ARCHIVE <b>22 / 22</b>
        </span>
      </div>
      <span className="atlas-watermark" aria-hidden="true">
        ARCANA
      </span>
      <div className="atlas-layout">
        <section className="atlas-art-panel" aria-label={`${card.name}牌面`}>
          <div className="atlas-orbit" aria-hidden="true" />
          <div className="atlas-main-card" key={card.id}>
            <CardArt {...card} isReversed={orientation === 'reversed'} />
          </div>
          <button
            className="rotate-card"
            onClick={() => setOrientation((o) => (o === 'upright' ? 'reversed' : 'upright'))}
            aria-label={`切换为${orientation === 'upright' ? '逆位' : '正位'}`}
          >
            ⟳
          </button>
          <div className="atlas-art-caption">
            <span>MAJOR ARCANA</span>
            <span>NO. {String(card.id).padStart(2, '0')}</span>
          </div>
        </section>
        <section className="atlas-info" aria-live="polite">
          <span className="atlas-roman" aria-hidden="true">
            {card.roman}
          </span>
          <div className="atlas-name-block" key={card.id}>
            <span className="section-eyebrow">THE VOICE WITHIN</span>
            <h1>{card.name}</h1>
            <p className="atlas-english">{card.english}</p>
          </div>
          <div className="orientation-toggle" aria-label="牌义方向">
            <button
              className={orientation === 'upright' ? 'active' : ''}
              aria-pressed={orientation === 'upright'}
              onClick={() => setOrientation('upright')}
            >
              ↟ 正位
            </button>
            <button
              className={orientation === 'reversed' ? 'active' : ''}
              aria-pressed={orientation === 'reversed'}
              onClick={() => setOrientation('reversed')}
            >
              ↡ 逆位
            </button>
          </div>
          <span className="position-english">
            {orientation === 'upright' ? 'UPRIGHT POSITION' : 'REVERSED POSITION'}
          </span>
          <div className="atlas-keywords">
            {meaning.keywords.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>
          <p className="atlas-meaning">{meaning.meaning}</p>
          <div className="atlas-advice">
            <span>
              给此刻的你 <i>↗</i>
            </span>
            <p>{meaning.advice}</p>
          </div>
          <div className="atlas-paging">
            <button aria-label="上一张牌" onClick={() => select(selectedId - 1)}>
              ←
            </button>
            <span>
              {String(selectedId + 1).padStart(2, '0')} <i>/ 22</i>
            </span>
            <button aria-label="下一张牌" onClick={() => select(selectedId + 1)}>
              →
            </button>
          </div>
        </section>
        <section className="atlas-rail" aria-label="选择塔罗牌">
          <div className="rail-heading">
            <span>THE COLLECTION</span>
            <span>↕</span>
          </div>
          <div className="atlas-card-list" ref={list}>
            {cards.map((c) => (
              <button
                data-card-id={c.id}
                key={c.id}
                className={`atlas-card-option ${c.id === selectedId ? 'selected' : ''}`}
                aria-label={`${c.roman} ${c.name}`}
                aria-pressed={c.id === selectedId}
                onClick={() => select(c.id)}
              >
                <span className="rail-card-name">
                  <b>{c.name}</b>
                  <small>{c.roman}</small>
                </span>
                <CardArt {...c} />
              </button>
            ))}
          </div>
          <span className="rail-caption">滚动探索全部 22 张牌</span>
        </section>
      </div>
    </main>
  );
}
