/** Popup / Content Script / Background間でやり取りする型付きメッセージ定義。 */

import type { PageContent, SiteAnalysis } from './pageContent';

export interface TabInfo {
  url?: string;
  title?: string;
}

export type ExtensionMessage =
  | { type: 'PING' }
  | { type: 'PONG'; payload: { respondedAt: number } }
  | { type: 'GET_TAB_INFO' }
  | { type: 'TAB_INFO_RESPONSE'; payload: TabInfo }
  // AIボット: Content Script → Background。ページ情報を渡して分析を依頼する。
  | { type: 'ANALYZE_PAGE'; payload: PageContent }
  // AIボット: Background → Content Script。分析成功時の結果。
  | { type: 'ANALYSIS_RESULT'; payload: SiteAnalysis }
  // AIボット: Background → Content Script。分析失敗時のエラー内容。
  | { type: 'ANALYSIS_ERROR'; payload: { message: string } };

/** Backgroundへメッセージを送る(chrome.runtime.sendMessage)。 */
export function sendMessageToBackground(message: ExtensionMessage): Promise<ExtensionMessage> {
  return chrome.runtime.sendMessage(message);
}

/** アクティブタブのContent Scriptへメッセージを送る(chrome.tabs.sendMessage)。 */
export async function sendMessageToActiveTab(
  message: ExtensionMessage,
): Promise<ExtensionMessage | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return undefined;
  return chrome.tabs.sendMessage(tab.id, message);
}
