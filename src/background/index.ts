import type { ExtensionMessage, TabInfo } from '../shared/messages';

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
      default:
        return false;
    }
  },
);
