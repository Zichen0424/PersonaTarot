import { cards, getMode, getPositionLabels } from '../data/tarot';
import type { ReadingRecord } from '../lib/reading';
import { CardArt } from './CardArt';

export function ReadingResult({
  record,
  compact = false,
}: {
  record: ReadingRecord;
  compact?: boolean;
}) {
  const mode = getMode(record.mode);
  const positions = getPositionLabels(record.mode, record.optionA, record.optionB);
  return (
    <section className={`reading-result ${compact ? 'compact-result' : ''}`} aria-label="牌阵解读">
      <div className="result-heading">
        <div>
          <span className="section-eyebrow">YOUR INNER VOICE</span>
          <h2 tabIndex={-1} id={compact ? undefined : 'result-title'}>
            此刻，牌想对你说
          </h2>
        </div>
        <span className="result-star" aria-hidden="true">
          ✳
        </span>
      </div>
      {record.question && <p className="record-question">“{record.question}”</p>}
      <div className="result-items">
        {record.cards.map((drawn, i) => {
          const card = cards[drawn.cardId];
          const meaning = card[drawn.orientation];
          return (
            <article className="result-item" key={card.id}>
              <a
                className="result-thumbnail"
                href={`#/atlas/${card.id}`}
                aria-label={`在图鉴查看${card.name}`}
              >
                <CardArt {...card} isReversed={drawn.orientation === 'reversed'} />
              </a>
              <div className="result-copy">
                <span className="result-position">
                  {String(i + 1).padStart(2, '0')} / {positions[i]}
                </span>
                <h3>
                  {card.name}
                  <span className={`orientation-tag ${drawn.orientation}`}>
                    {drawn.orientation === 'upright' ? '正位' : '逆位'}
                  </span>
                </h3>
                <div className="keywords">{meaning.keywords.join(' / ')}</div>
                <p>{meaning.readings[record.mode]}</p>
                {mode.positionPrompts?.[i] && (
                  <p className="position-prompt">{mode.positionPrompts[i]}</p>
                )}
                <div className="advice">
                  <span>行动建议</span>
                  {meaning.advice}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="reading-summary">
        <span className="section-eyebrow">CONNECT THE DOTS</span>
        <h3>{mode.name} · 你的思考线索</h3>
        <p>
          {record.cards
            .map(
              (drawn, i) =>
                `${positions[i]}指向「${cards[drawn.cardId][drawn.orientation].keywords[0]}」`,
            )
            .join('；')}
          。
        </p>
        <p>
          {mode.summary ??
            (record.mode === 'daily'
              ? '把这条线索带进今天，今晚再回看：哪一个小行动让你更接近想要的状态？'
              : record.mode === 'timeline'
                ? '把三张牌连成一条线：从过去保留一条经验，为现在选择一个行动，并给未来留出调整的空间。趋势是反思的方向，不是确定的预言。'
                : record.mode === 'relationship'
                  ? '分别记录自己的感受、你对对方的观察，以及希望共同调整的一件事。对方牌位提供另一种思考角度，无法得知他人的真实想法。'
                  : `分别为「${record.optionA || '选择A'}」与「${record.optionB || '选择B'}」写下一项可利用的助力、一项需要面对的挑战，再核对现实条件。牌阵不会替你决定。`)}
        </p>
      </div>
      <p className="result-note">
        解读来自预先编写的牌义，不根据问题生成答案。仅供娱乐与自我探索。
      </p>
    </section>
  );
}
