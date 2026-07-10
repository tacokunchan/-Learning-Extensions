import { createRoot } from 'react-dom/client';
import ContentApp from './ContentApp';
import shadowStyles from './content.css?inline';
import type { ExtensionMessage } from '../shared/messages';

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

  createRoot(mountPoint).render(<ContentApp />);
}

mount();

// PopupからのPING(chrome.tabs.sendMessage)にPONGで応答するサンプル。
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionMessage) => void) => {
    if (message.type === 'PING') {
      sendResponse({ type: 'PONG', payload: { respondedAt: Date.now() } });
    }
    return false;
  },
);
