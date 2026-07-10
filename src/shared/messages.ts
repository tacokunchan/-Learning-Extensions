/** Popup / Content Script / Background間でやり取りする型付きメッセージ定義。 */

export interface TabInfo {
  url?: string;
  title?: string;
}

export type ExtensionMessage =
  | { type: 'PING' }
  | { type: 'PONG'; payload: { respondedAt: number } }
  | { type: 'GET_TAB_INFO' }
  | { type: 'TAB_INFO_RESPONSE'; payload: TabInfo };

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
