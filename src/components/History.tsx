import { useEffect, useRef, useState } from 'react';
import { cards, getMode } from '../data/tarot';
import type { ReadingRecord } from '../lib/reading';
import { ReadingResult } from './ReadingResult';

export function History({
  records,
  open,
  onClose,
  onClear,
}: {
  records: ReadingRecord[];
  open: boolean;
  onClose: () => void;
  onClear: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<ReadingRecord | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  useEffect(() => {
    if (open) {
      setSelected(null);
      setConfirmClear(false);
      dialog.current?.showModal();
    } else dialog.current?.close();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const listener = () => onClose();
    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  }, [open, onClose]);
  return (
    <dialog
      ref={dialog}
      className="history-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="history-title"
    >
      <div className="history-inner">
        <div className="history-header">
          <div>
            <span className="section-eyebrow">ECHOES OF YOUR MOMENTS</span>
            <h2 id="history-title">{selected ? '那一刻的回响' : '历史记录'}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="关闭历史记录">
            ×
          </button>
        </div>
        {selected ? (
          <>
            <button className="text-button" onClick={() => setSelected(null)}>
              ← 返回记录列表
            </button>
            <p className="history-date">
              {formatDate(selected.date)} · {getMode(selected.mode).name}
            </p>
            <ReadingResult record={selected} compact />
          </>
        ) : (
          <>
            <div className="history-toolbar">
              <p>保存在此浏览器，最多保留最近 30 次。</p>
              {records.length > 0 && (
                <button className="text-button" onClick={() => setConfirmClear(true)}>
                  清空记录
                </button>
              )}
            </div>
            {confirmClear && (
              <div className="clear-confirm" role="group" aria-label="确认清空">
                <p>清空所有历史记录？今天的每日一牌仍会保留。</p>
                <div>
                  <button onClick={() => setConfirmClear(false)}>取消</button>
                  <button
                    className="danger-button"
                    onClick={() => {
                      onClear();
                      setConfirmClear(false);
                    }}
                  >
                    确认清空
                  </button>
                </div>
              </div>
            )}
            {records.length === 0 ? (
              <div className="empty-history">
                <span aria-hidden="true">✳</span>
                <h3>你的故事，正要开始。</h3>
                <p>完成一次抽牌后，这一刻就会留在这里。</p>
                <button className="primary-button" onClick={onClose}>
                  回到此刻 <span>↗</span>
                </button>
              </div>
            ) : (
              <div className="history-list">
                {records.map((record) => (
                  <button
                    key={record.id}
                    className="history-entry"
                    onClick={() => setSelected(record)}
                  >
                    <span className="history-entry-type">{getMode(record.mode).english}</span>
                    <span className="history-entry-title">
                      {record.question || getMode(record.mode).name}
                    </span>
                    <span className="history-entry-cards">
                      {record.cards
                        .map(
                          (c) =>
                            `${cards[c.cardId].name} · ${c.orientation === 'upright' ? '正位' : '逆位'}`,
                        )
                        .join(' / ')}
                    </span>
                    <time dateTime={record.date}>{formatDate(record.date)}</time>
                    <span className="entry-arrow">↗</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
function formatDate(iso: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}
