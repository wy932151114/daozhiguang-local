// ============================================================
// DZS-OS V2 — 所有 Prompt 注册中心
// ============================================================

import { PromptEntry } from './index';
import { baziPrompt } from './bazi.prompt';
import { wuxingPrompt } from './wuxing.prompt';

/** Prompt Registry — 所有 Prompt 在此注册 */
export class PromptRegistry {
  private static prompts: Map<string, PromptEntry> = new Map();

  static {
    this.register(baziPrompt);
    this.register(wuxingPrompt);
    // 注册更多 Prompt...
  }

  private static register(entry: PromptEntry): void {
    this.prompts.set(entry.id, entry);
  }

  static get(id: string): PromptEntry | undefined {
    return this.prompts.get(id);
  }

  static getAll(): PromptEntry[] {
    return Array.from(this.prompts.values());
  }

  static getByType(reportType: string): PromptEntry | undefined {
    const id = `${reportType}-analysis`;
    return this.prompts.get(id);
  }

  static listByCategory(): Record<string, PromptEntry[]> {
    return {
      bazi: [baziPrompt],
      wuxing: [wuxingPrompt],
    };
  }
}
