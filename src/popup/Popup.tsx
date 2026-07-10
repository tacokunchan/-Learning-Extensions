import { useState } from 'react';
import { useStorageValue } from '../shared/storage';
import { sendMessageToActiveTab, sendMessageToBackground } from '../shared/messages';

export default function Popup() {
  const [counter, setCounter, counterLoaded] = useStorageValue('counter');
  const [pingResult, setPingResult] = useState('');
  const [tabInfoResult, setTabInfoResult] = useState('');

  const handlePing = async () => {
    setPingResult('送信中...');
    const response = await sendMessageToActiveTab({ type: 'PING' });
    if (response?.type === 'PONG') {
      setPingResult(`PONG受信 (${new Date(response.payload.respondedAt).toLocaleTimeString()})`);
    } else {
      setPingResult('応答なし(このページではContent Scriptが動作していない可能性があります)');
    }
  };

  const handleGetTabInfo = async () => {
    setTabInfoResult('取得中...');
    const response = await sendMessageToBackground({ type: 'GET_TAB_INFO' });
    if (response.type === 'TAB_INFO_RESPONSE') {
      setTabInfoResult(`${response.payload.title ?? '(no title)'} / ${response.payload.url ?? '(no url)'}`);
    }
  };

  return (
    <main className="popup">
      <h1>Learning Extensions</h1>

      <section>
        <h2>chrome.storage サンプル</h2>
        <p>
          カウンター: <strong>{counterLoaded ? counter : '...'}</strong>
        </p>
        <button type="button" onClick={() => setCounter(counter + 1)}>
          +1
        </button>
      </section>

      <section>
        <h2>メッセージパッシング サンプル</h2>
        <button type="button" onClick={handlePing}>
          Ping content script
        </button>
        <p>{pingResult}</p>

        <button type="button" onClick={handleGetTabInfo}>
          Get tab info via background
        </button>
        <p>{tabInfoResult}</p>
      </section>

      <button type="button" onClick={() => chrome.runtime.openOptionsPage()}>
        設定を開く
      </button>
      <p className="hint">Options画面でバッジ文言や表示ON/OFFを変更できます。</p>
    </main>
  );
}
