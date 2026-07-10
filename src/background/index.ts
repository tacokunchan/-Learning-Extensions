import type { ExtensionMessage, TabInfo } from '../shared/messages';
import { analyzeSite } from './analyzeSite';

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[background] installed:', details.reason);
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionMessage) => void) => {
    switch (message.type) {
      case 'PING': {
        sendResponse({ type: 'PONG', payload: { respondedAt: Date.now() } });
        return false;
      }
      case 'GET_TAB_INFO': {
        // chrome.tabs.query はtabs権限が必要な非同期API。
        // 非同期でsendResponseを呼ぶので listener からは true を返す。
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
          const payload: TabInfo = { url: tab?.url, title: tab?.title };
          sendResponse({ type: 'TAB_INFO_RESPONSE', payload });
        });
        return true;
      }
      case 'ANALYZE_PAGE': {
        // AIボット: Content Scriptから届いたページ情報をanalyzeSite()に渡し、
        // 結果 or エラーをContent Scriptへ返す。
        // (analyzeSite自体の中身はTODOなので、実装するまではANALYSIS_ERRORが返る)
        analyzeSite(message.payload)
          .then((result) => {
            sendResponse({ type: 'ANALYSIS_RESULT', payload: result });
          })
          .catch((error: unknown) => {
            const messageText = error instanceof Error ? error.message : 'unknown error';
            sendResponse({ type: 'ANALYSIS_ERROR', payload: { message: messageText } });
          });
        return true;
      }
      default:
        return false;
    }
  },
);
