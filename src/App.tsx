import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { cards, modes, getMode, getPositionLabels } from './data/tarot';
import type { ModeId } from './data/tarot';
import { CardArt } from './components/CardArt';
import { Atlas } from './components/Atlas';
import { History } from './components/History';
import { ReadingResult } from './components/ReadingResult';
import { initialState, readingReducer, localDay, shuffleDeck } from './lib/reading';
import type { ReadingRecord } from './lib/reading';
import { addRecord, browserStorage, dailyFor, loadSaved, saveData } from './lib/storage';
import { useWebMCP } from './lib/webmcp';

function readRoute() {
  const match = window.location.hash.match(/^#\/atlas(?:\/(\d+))?$/);
  return { atlas: !!match, selectedId: match?.[1] && Number(match[1]) < 22 ? Number(match[1]) : 9 };
}
const previewCards: Record<ModeId, number[]> = {
  daily: [17],
  timeline: [1, 18, 17],
  relationship: [6, 14, 2],
  crossroads: [20, 1, 8, 17, 11],
};

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [loaded] = useState(() => loadSaved(browserStorage()));
  const [saved, setSaved] = useState(loaded.data);
  const [storageAvailable, setStorageAvailable] = useState(loaded.available);
  const [state, dispatch] = useReducer(readingReducer, initialState('timeline'));
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [today, setToday] = useState(localDay);
  const completionLock = useRef(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);
  const mode = getMode(state.mode);
  const count = mode.positions.length;
  const labels = getPositionLabels(
    state.mode,
    state.record?.optionA ?? optionA,
    state.record?.optionB ?? optionB,
  );

  useEffect(() => {
    const change = () => {
      setRoute(readRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    document.title = route.atlas
      ? cards[route.selectedId].name + ' · 塔罗图鉴 | BLUE HOUR'
      : 'BLUE HOUR · 蓝色时刻';
  }, [route]);
  useEffect(() => {
    if (!saveData(browserStorage(), saved)) setStorageAvailable(false);
  }, [saved]);
  useEffect(() => {
    const checkDay = () => setToday(localDay());
    const timer = window.setInterval(checkDay, 15_000);
    window.addEventListener('focus', checkDay);
    document.addEventListener('visibilitychange', checkDay);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', checkDay);
      document.removeEventListener('visibilitychange', checkDay);
    };
  }, []);
  const previousDay = useRef(today);
  useEffect(() => {
    if (today !== previousDay.current && state.mode === 'daily') {
      completionLock.current = false;
      dispatch({ type: 'reset', mode: 'daily', record: dailyFor(saved, today) });
      setQuestion('');
    }
    previousDay.current = today;
  }, [today, state.mode, saved]);
  useEffect(() => {
    if (state.phase !== 'shuffling') return;
    const timer = window.setTimeout(
      () => dispatch({ type: 'ready' }),
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 1050,
    );
    return () => clearTimeout(timer);
  }, [state.phase]);
  useEffect(() => {
    if (state.phase !== 'revealing' || state.revealed.length !== count || completionLock.current)
      return;
    completionLock.current = true;
    const now = new Date();
    const record: ReadingRecord = {
      id: crypto.randomUUID(),
      date: now.toISOString(),
      localDay: localDay(now),
      mode: state.mode,
      question: question.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      cards: state.selected.map((i) => state.deck[i]),
    };
    dispatch({ type: 'complete', record });
    setSaved((current) => addRecord(current, record));
  }, [state, count, question, optionA, optionB]);
  useEffect(() => {
    if (route.atlas) return;
    if (state.phase === 'selecting')
      deckRef.current
        ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
        ?.focus({ preventScroll: true });
    if (state.phase === 'revealing')
      document
        .querySelector<HTMLButtonElement>('.flip-button:not(:disabled)')
        ?.focus({ preventScroll: true });
    if (state.phase === 'complete')
      document.getElementById('result-title')?.focus({ preventScroll: true });
  }, [state.phase, state.revealed.length, route.atlas]);

  const chooseMode = useCallback(
    (id: ModeId) => {
      if (id === state.mode) return;
      completionLock.current = false;
      dispatch({
        type: 'reset',
        mode: id,
        record: id === 'daily' ? dailyFor(saved, localDay()) : undefined,
      });
      setQuestion('');
      setOptionA('');
      setOptionB('');
    },
    [state.mode, saved],
  );
  function start(event: FormEvent) {
    event.preventDefault();
    if (state.phase !== 'setup') return;
    const daily = state.mode === 'daily' ? dailyFor(saved, localDay()) : undefined;
    if (daily) {
      dispatch({ type: 'reset', mode: 'daily', record: daily });
      return;
    }
    completionLock.current = false;
    dispatch({ type: 'shuffle', deck: shuffleDeck() });
  }
  function restart() {
    completionLock.current = false;
    dispatch({ type: 'reset', mode: state.mode });
  }
  function deckKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -11,
      ArrowDown: 11,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let next = current + keys[event.key];
    while (next >= 0 && next < buttons.length && buttons[next].disabled)
      next += Math.sign(keys[event.key]);
    buttons[next]?.focus();
  }
  useWebMCP({
    mode: state.mode,
    phase: state.phase,
    atlas: route.atlas,
    selectedCard: route.selectedId,
    chooseMode,
  });

  return (
    <div className={'app-shell ' + (route.atlas ? 'atlas-shell' : '')}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        跳转至主要内容
      </a>
      <header className="topbar">
        <a className="brand" href="#/" aria-label="蓝色时刻，占卜首页">
          <span className="brand-mark" aria-hidden="true">
            ϟ
          </span>
          <span>
            BLUE HOUR<small>蓝 色 时 刻</small>
          </span>
        </a>
        <span className="top-coordinate">ARCANA / INNER VOICE</span>
        <nav aria-label="主导航">
          <button onClick={() => setHistoryOpen(true)}>
            历史记录 <span>↗</span>
          </button>
          <a className="atlas-link" href={route.atlas ? '#/' : '#/atlas'}>
            {route.atlas ? '回到占卜' : '塔罗图鉴'} <span>↗</span>
          </a>
        </nav>
      </header>
      <div id="main-content" tabIndex={-1} className="main-content">
        {route.atlas ? (
          <Atlas selectedId={route.selectedId} />
        ) : (
          <main className={'reading-page phase-' + state.phase}>
            <section className="reading-workspace">
              <div className="section-eyebrow">
                <span className="live-dot" /> THE MOMENT IS YOURS{' '}
                <span className="serial">
                  NO. {String(modes.indexOf(mode) + 1).padStart(2, '0')} / 04
                </span>
              </div>
              <div className="reading-title">
                <span className="mini-cross" aria-hidden="true">
                  ✳
                </span>
                <h1>
                  {mode.title}
                  <small>{mode.description}</small>
                </h1>
              </div>
              <div className="reading-progress" role="status" aria-live="polite">
                {state.phase === 'setup' ? (
                  <>
                    <span>01 — 静心</span>
                    <span>02 — 选牌</span>
                    <span>03 — 揭晓</span>
                  </>
                ) : state.phase === 'shuffling' ? (
                  <span>正在洗牌，让思绪慢下来……</span>
                ) : state.phase === 'selecting' ? (
                  <>
                    <span>02 — 选牌</span>
                    <b>
                      已选 {state.selected.length} / {count}
                    </b>
                    <span>下一张：{labels[state.selected.length]}</span>
                  </>
                ) : state.phase === 'revealing' ? (
                  <>
                    <span>03 — 揭晓</span>
                    <b>
                      已翻开 {state.revealed.length} / {count}
                    </b>
                    <span>点击牌背，逐张揭晓</span>
                  </>
                ) : (
                  <>
                    <span>READING COMPLETE</span>
                    <b>{state.mode === 'daily' ? '今天的专属指引' : '此刻的答案，已经展开'}</b>
                  </>
                )}
              </div>

              {state.phase === 'selecting' ? (
                <section className="deck-selection" aria-label="选牌区">
                  <div className="selected-slots">
                    {labels.map((label, i) => (
                      <div className={state.selected[i] !== undefined ? 'filled' : ''} key={i}>
                        <span>
                          {state.selected[i] !== undefined ? '✓' : String(i + 1).padStart(2, '0')}
                        </span>
                        <small>{label}</small>
                      </div>
                    ))}
                  </div>
                  <div
                    className="deck-grid"
                    ref={deckRef}
                    onKeyDown={deckKeyboard}
                    role="group"
                    aria-label="从22张牌中选择"
                  >
                    {state.deck.map((_, i) => (
                      <button
                        className={'deck-card ' + (state.selected.includes(i) ? 'picked' : '')}
                        key={i}
                        disabled={state.selected.includes(i)}
                        aria-label={
                          '选择第' +
                          (i + 1) +
                          '张牌' +
                          (state.selected.includes(i) ? '，已选择' : '')
                        }
                        onClick={() => dispatch({ type: 'select', index: i })}
                      >
                        <CardArt back />
                        <span>{String(i + 1).padStart(2, '0')}</span>
                      </button>
                    ))}
                  </div>
                  <p className="selection-hint">凭直觉选择 · 每张牌只会出现一次</p>
                </section>
              ) : state.phase === 'shuffling' ? (
                <div className="shuffle-stage" aria-label="正在洗牌">
                  <div className="shuffle-orbit" />
                  {[0, 1, 2].map((i) => (
                    <div className={'shuffle-card shuffle-' + i} key={i}>
                      <CardArt back />
                    </div>
                  ))}
                  <span>FIND YOUR MOMENT</span>
                </div>
              ) : (
                <div
                  className={
                    'card-stage ' +
                    (state.phase === 'setup' ? 'preview-stage' : 'drawn-stage') +
                    ' spread-' +
                    count
                  }
                  aria-label={state.phase === 'setup' ? '牌阵示意，非抽牌结果' : '你的牌阵'}
                >
                  {labels.map((label, i) => {
                    const drawn =
                      state.phase === 'setup' ? undefined : state.deck[state.selected[i]];
                    const card = cards[drawn?.cardId ?? previewCards[state.mode][i]];
                    const revealed = state.phase === 'complete' || state.revealed.includes(i);
                    return (
                      <div
                        className={'spread-card slot-' + i + (revealed ? ' revealed' : '')}
                        key={state.mode + '-' + i}
                      >
                        {state.phase === 'setup' ? (
                          <CardArt {...card} />
                        ) : (
                          <button
                            className={'flip-button ' + (revealed ? 'flipped' : '')}
                            onClick={() => dispatch({ type: 'reveal', index: i })}
                            disabled={revealed}
                            aria-label={
                              revealed
                                ? label +
                                  '：' +
                                  card.name +
                                  '，' +
                                  (drawn?.orientation === 'upright' ? '正位' : '逆位')
                                : '翻开' + label
                            }
                          >
                            <span className="flip-inner">
                              <span className="flip-back" aria-hidden={revealed}>
                                <CardArt back />
                              </span>
                              <span className="flip-front" aria-hidden={!revealed}>
                                <CardArt {...card} isReversed={drawn?.orientation === 'reversed'} />
                              </span>
                            </span>
                            {!revealed && <span className="flip-prompt">点击揭晓 ↗</span>}
                          </button>
                        )}
                        <div className="card-position">
                          <strong>{label}</strong>
                          <span>
                            {revealed
                              ? card.name +
                                ' / ' +
                                (drawn?.orientation === 'upright' ? '正位' : '逆位')
                              : mode.positionEnglish[i]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {state.phase === 'setup' && (
                <form className="setup-panel" onSubmit={start}>
                  <span className="preview-note">牌阵示意 · 洗牌后揭晓你的牌</span>
                  <label htmlFor="question">
                    此刻，你在思考什么？ <span>选填</span>
                  </label>
                  <div className="question-row">
                    <input
                      id="question"
                      autoComplete="off"
                      maxLength={200}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="把问题留在这里，让思绪慢下来……"
                    />
                    <button className="primary-button" type="submit">
                      开始洗牌 <span>↗</span>
                    </button>
                  </div>
                  {state.mode === 'crossroads' && (
                    <div className="option-fields">
                      <label htmlFor="option-a">
                        选择 A
                        <input
                          id="option-a"
                          maxLength={24}
                          value={optionA}
                          onChange={(e) => setOptionA(e.target.value)}
                          placeholder="例如：留在现在的城市"
                        />
                      </label>
                      <label htmlFor="option-b">
                        选择 B
                        <input
                          id="option-b"
                          maxLength={24}
                          value={optionB}
                          onChange={(e) => setOptionB(e.target.value)}
                          placeholder="例如：去新的城市生活"
                        />
                      </label>
                    </div>
                  )}
                  <p>
                    静下心来，从 22 张牌中选出属于你的 {count} 张。
                    {state.mode === 'daily' && '每天一份指引，当天结果保持不变。'}
                  </p>
                </form>
              )}
              {state.phase === 'complete' && state.record && (
                <div className="complete-actions">
                  <a
                    className="primary-button"
                    href="#result-title"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById('result-title')
                        ?.scrollIntoView({
                          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                            ? 'instant'
                            : 'smooth',
                          block: 'start',
                        });
                    }}
                  >
                    查看牌阵解读 <span>↓</span>
                  </a>
                  {state.mode !== 'daily' ? (
                    <button className="text-button" onClick={restart}>
                      ↻ 再抽一次
                    </button>
                  ) : (
                    <span className="daily-note">{state.record.localDay} · 明天再见</span>
                  )}
                </div>
              )}
              {!storageAvailable && (
                <p className="storage-note" role="status">
                  浏览器暂时无法保存记录，本次抽牌仍可正常使用；刷新后记录可能丢失。
                </p>
              )}
              <span className="watermark" aria-hidden="true">
                MOMENT
              </span>
            </section>
            <aside className="mode-sidebar" aria-label="占卜模式">
              <div className="sidebar-top">
                CHOOSE YOUR
                <br />
                <b>READING.</b>
                <span>选择你的牌阵</span>
              </div>
              <div className="mode-list">
                {modes.map((m, i) => (
                  <button
                    key={m.id}
                    className={'mode-button ' + (state.mode === m.id ? 'active' : '')}
                    aria-pressed={state.mode === m.id}
                    onClick={() => chooseMode(m.id)}
                  >
                    <span className="mode-index">0{i + 1}</span>
                    <span className="mode-type">{m.english}</span>
                    <span className="mode-cn">
                      {m.name}
                      <small>{String(m.positions.length).padStart(2, '0')} 张牌</small>
                    </span>
                    {state.mode === m.id && (
                      <span className="mode-arrow" aria-hidden="true">
                        ↗
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="sidebar-bottom">
                <span className="orbital-symbol" aria-hidden="true">
                  ✳
                </span>
                <p>
                  答案不在远方，
                  <br />
                  在你与自己的对话里。
                </p>
                <span>22 ARCANA · INFINITE POSSIBILITIES</span>
              </div>
            </aside>
            {state.phase === 'complete' && state.record && <ReadingResult record={state.record} />}
          </main>
        )}
      </div>
      <footer>
        <span>BLUE HOUR — A MOMENT WITH YOURSELF</span>
        <span>
          仅供娱乐与自我探索 <i aria-hidden="true">✦</i>
        </span>
      </footer>
      <History
        records={saved.history}
        open={historyOpen}
        onClose={closeHistory}
        onClear={() => setSaved((current) => ({ ...current, history: [] }))}
      />
    </div>
  );
}
