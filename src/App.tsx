import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, KeyboardEvent } from 'react';
import { cards, modes, getMode, getPositionLabels, isDailyMode, menuModeId } from './data/tarot';
import type { ModeId } from './data/tarot';
import { CardArt } from './components/CardArt';
import { Atlas } from './components/Atlas';
import { History } from './components/History';
import { ReadingResult } from './components/ReadingResult';
import { SceneBackground } from './components/SceneBackground';
import { initialState, readingReducer, localDay, shuffleDeck } from './lib/reading';
import type { ReadingRecord } from './lib/reading';
import { addRecord, browserStorage, dailyFor, loadSaved, saveData } from './lib/storage';
import { useWebMCP } from './lib/webmcp';

function readRoute() {
  const match = window.location.hash.match(/^#\/atlas(?:\/(\d+))?$/);
  return { atlas: !!match, selectedId: match?.[1] && Number(match[1]) < 22 ? Number(match[1]) : 9 };
}
const previewCards: Record<ModeId, number[]> = {
  flow: [1, 18, 17],
  gun: [7, 1, 19, 11],
  crepe: [17, 8, 14, 12],
  gate: [21, 9, 7, 0],
  halo: [17, 8, 14, 12, 7],
  coin: [8, 9],
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
  const [state, dispatch] = useReducer(readingReducer, initialState('flow'));
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [today, setToday] = useState(localDay);
  const completionLock = useRef(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const closeHistory = useCallback(() => setHistoryOpen(false), []);
  const mode = getMode(state.mode);
  const menuId = menuModeId(state.mode);
  const count = mode.positions.length;
  const labels = getPositionLabels(
    state.mode,
    state.record?.optionA ?? optionA,
    state.record?.optionB ?? optionB,
  );

  useEffect(() => {
    let previousPage = readRoute().atlas;
    const change = () => {
      const next = readRoute();
      setRoute(next);
      if (next.atlas !== previousPage) window.scrollTo({ top: 0 });
      previousPage = next.atlas;
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
    if (today !== previousDay.current && isDailyMode(state.mode)) {
      completionLock.current = false;
      const record = dailyFor(saved, today);
      dispatch({ type: 'reset', mode: record?.mode ?? 'coin', record });
      setQuestion('');
    }
    previousDay.current = today;
  }, [today, state.mode, saved]);
  useEffect(() => {
    if (state.phase !== 'shuffling') return;
    const timer = window.setTimeout(
      () => dispatch({ type: 'ready' }),
      !motionEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 1800,
    );
    return () => clearTimeout(timer);
  }, [state.phase, motionEnabled]);
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
      if (menuModeId(id) === menuModeId(state.mode)) return;
      completionLock.current = false;
      const record = isDailyMode(id) ? dailyFor(saved, localDay()) : undefined;
      dispatch({ type: 'reset', mode: record?.mode ?? id, record });
      setQuestion('');
      setOptionA('');
      setOptionB('');
    },
    [state.mode, saved],
  );
  function start(event: FormEvent) {
    event.preventDefault();
    if (state.phase !== 'setup') return;
    const daily = isDailyMode(state.mode) ? dailyFor(saved, localDay()) : undefined;
    if (daily) {
      dispatch({ type: 'reset', mode: daily.mode, record: daily });
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
    const columns = getComputedStyle(event.currentTarget).gridTemplateColumns.split(' ').length;
    const keys: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -columns,
      ArrowDown: columns,
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
    <div
      className={'app-shell ' + (route.atlas ? 'atlas-shell' : '')}
      data-motion={motionEnabled ? 'on' : 'off'}
    >
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
          <button
            className="motion-toggle"
            aria-label={motionEnabled ? '暂停动效' : '开启动效'}
            aria-pressed={motionEnabled}
            onClick={() => setMotionEnabled((current) => !current)}
          >
            <i aria-hidden="true">{motionEnabled ? 'Ⅱ' : '▷'}</i>{' '}
            <span>动效{motionEnabled ? '开' : '关'}</span>
          </button>
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
          <Atlas selectedId={route.selectedId} motionEnabled={motionEnabled} />
        ) : (
          <main className={'reading-page phase-' + state.phase + ' mode-' + menuId}>
            <SceneBackground
              group={isDailyMode(state.mode) ? 'daily' : 'the'}
              motionEnabled={motionEnabled}
            />
            <section className="reading-workspace">
              <div className="section-eyebrow">
                <span className="live-dot" /> THE MOMENT IS YOURS{' '}
                <span className="serial">
                  NO. {String(modes.findIndex((m) => m.id === menuId) + 1).padStart(2, '0')} / 06
                </span>
              </div>
              <div className="reading-title" key={state.mode}>
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
                    <b>{isDailyMode(state.mode) ? '今天的专属指引' : '此刻的答案，已经展开'}</b>
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
                        style={{ '--deal-index': i } as CSSProperties}
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
                  <div className="shuffle-tunnel" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                  <span className="shuffle-callout" aria-hidden="true">
                    倾听内心的声音
                  </span>
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
                        style={{ '--deal-index': i } as CSSProperties}
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
                            <span className="reveal-glint" aria-hidden="true" />
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
                    {isDailyMode(state.mode) && '每天一份指引，当天结果保持不变。'}
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
                      document.getElementById('result-title')?.scrollIntoView({
                        behavior:
                          !motionEnabled ||
                          window.matchMedia('(prefers-reduced-motion: reduce)').matches
                            ? 'instant'
                            : 'smooth',
                        block: 'start',
                      });
                    }}
                  >
                    查看牌阵解读 <span>↓</span>
                  </a>
                  {!isDailyMode(state.mode) ? (
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
                TAROT SELECT <span>选择你的牌阵</span>
              </div>
              <div className="mode-list">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    className={
                      'mode-button ' +
                      (m.id === 'coin' ? 'daily-mode ' : '') +
                      (menuId === m.id ? 'active' : '')
                    }
                    aria-label={`${m.english} ${m.name}，${m.positions.length}张牌`}
                    aria-pressed={menuId === m.id}
                    onClick={() => chooseMode(m.id)}
                  >
                    <span className="mode-type">
                      {m.id === 'coin' ? (
                        <>
                          <span>DAILY</span>
                          <span>READING</span>
                        </>
                      ) : (
                        <>
                          <small>THE</small> {m.english.replace('THE ', '')}
                        </>
                      )}
                    </span>
                    <span className="mode-cn">{m.id === 'coin' ? '日常占卜' : m.name}</span>
                  </button>
                ))}
              </div>
              <div className="sidebar-bottom">
                ALL SPREADS AVAILABLE <span>全部牌阵已开放</span>
              </div>
            </aside>
            {state.phase === 'complete' && state.record && <ReadingResult record={state.record} />}
          </main>
        )}
      </div>
      <footer>
        <span>
          BLUE HOUR · 非官方同人作品{' '}
          <a href="https://asia.sega.com/p3r/cn/" target="_blank" rel="noreferrer">
            角色素材 © ATLUS / SEGA ↗
          </a>
        </span>
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
