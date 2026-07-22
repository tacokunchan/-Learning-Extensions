import { useStorageValue } from '../shared/storage';

/**
 * ここで変更した値はchrome.storage.syncに保存され、
 * Content Script(AIボットアイコン)にchrome.storage.onChanged経由でリアルタイム反映される。
 */
export default function Options() {
  const [aiBotEnabled, setAiBotEnabled, loaded] = useStorageValue('aiBotEnabled');

  return (
    <main className="options">
      <h1>Learning Extensions - 設定</h1>
      <p className="hint">
        変更内容は開いているすべてのページのAIボットアイコンに即座に反映されます(chrome.storage.onChanged)。
      </p>

      {!loaded ? (
        <p>読み込み中...</p>
      ) : (
        <form onSubmit={(event) => event.preventDefault()}>
          <label className="field field-checkbox">
            <input
              type="checkbox"
              checked={aiBotEnabled}
              onChange={(event) => setAiBotEnabled(event.target.checked)}
            />
            ページにAIボットアイコンを表示する
          </label>
        </form>
      )}

      {/*
        TODO(発展): APIキーの入力欄をここに追加しよう。
        StorageSchemaへの apiKey: string 追加は済んでいるので、あとはUI側だけでOK。

        ヒント:
        - 上の aiBotEnabled と同じパターンで
          const [apiKey, setApiKey, apiKeyLoaded] = useStorageValue('apiKey');
          のように読み書き用のstateを取得する
        - <label className="field">…</label> の中に
          <input type="password" value={apiKey} onChange={...} /> を置く
          (type="password" にすると画面上でキーが伏字になる)
        - onChange={(event) => setApiKey(event.target.value)} でstorageに保存される
        - background/analyzeSite.ts 側では getStorageValue('apiKey') でこの値を読み出す
      */}
    </main>
  );
}
