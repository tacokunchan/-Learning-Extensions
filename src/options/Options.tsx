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
        TODO(発展): AI_BOT_GUIDE.md の Phase 5(本物のAI APIに差し替える)まで進んだら、
        ここにAPIキーの入力欄を追加しよう。
        ヒント:
        - StorageSchema(src/shared/storage.ts)に apiKey: string を追加し、
          このコンポーネントで useStorageValue('apiKey') を使って読み書きする
        - <input type="password" /> を使うと画面上でキーが見えなくなる
        - background/analyzeSite.ts 側で getStorageValue('apiKey') を使ってキーを取り出す
      */}
    </main>
  );
}
