import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { modes } from '../data/tarot';
import type { ModeId } from '../data/tarot';
import type { Phase } from './reading';

interface Tool {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean };
  execute(input: unknown): unknown;
}
interface ModelContext {
  registerTool(tool: Tool, options: { signal: AbortSignal }): void | Promise<void>;
}
interface AppActions {
  mode: ModeId;
  phase: Phase;
  atlas: boolean;
  selectedCard: number;
  chooseMode(mode: ModeId): void;
}

export function useWebMCP(actions: AppActions) {
  const current = useRef(actions);
  current.current = actions;
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools: Tool[] = [
      {
        name: 'read_tarot_state',
        description: '读取当前页面、牌阵模式和抽牌阶段；不会抽牌或保存记录。',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true },
        execute() {
          const { mode, phase, atlas, selectedCard } = current.current;
          return {
            mode,
            phase,
            page: atlas ? 'atlas' : 'reading',
            selectedCard: atlas ? selectedCard : null,
          };
        },
      },
      {
        name: 'configure_tarot_mode',
        description:
          '切换占卜模式并重置未完成牌阵。不洗牌，不完成占卜；如果每日一牌已完成会恢复当天结果。仅在占卜页面使用。',
        inputSchema: {
          type: 'object',
          properties: { mode: { type: 'string', enum: modes.map((m) => m.id) } },
          required: ['mode'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute(input) {
          if (
            !input ||
            typeof input !== 'object' ||
            Object.keys(input).some((k) => k !== 'mode') ||
            !modes.some((m) => m.id === (input as { mode?: unknown }).mode)
          )
            throw new Error('请选择一个有效的占卜模式。');
          if (current.current.atlas) throw new Error('请先返回占卜页面。');
          const mode = (input as { mode: ModeId }).mode;
          flushSync(() => current.current.chooseMode(mode));
          return { mode: current.current.mode, phase: current.current.phase };
        },
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(
          () => {},
        );
      } catch {
        /* Optional API must not block the application. */
      }
    }
    return () => lifecycle.abort();
  }, []);
}
