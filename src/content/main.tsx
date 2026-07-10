import { createRoot } from 'react-dom/client';
import AiBotWidget from './AiBotWidget';
import shadowStyles from './ai-bot.css?inline';
import type { ExtensionMessage } from '../shared/messages';
// import { extractPageContent } from './extractPageContent';
function mount() {
  const host = document.createElement('div');
  host.id = 'learning-extensions-root';
  document.documentElement.appendChild(host);

  // ホストページのCSSと干渉しないようShadow DOMに隔離して描画する。
  const shadowRoot = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = shadowStyles;
  shadowRoot.appendChild(style);

  const mountPoint = document.createElement('div');
  shadowRoot.appendChild(mountPoint);

  createRoot(mountPoint).render(<AiBotWidget />);
}

mount();
// console.log(extractPageContent())

// PopupからのPING(chrome.tabs.sendMessage)にPONGで応答するサンプル。
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionMessage) => void) => {
    if (message.type === 'PING') {
      sendResponse({ type: 'PONG', payload: { respondedAt: Date.now() } });
    }
    return false;
  },
);
