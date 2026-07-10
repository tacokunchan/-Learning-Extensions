import { useStorageValue } from '../shared/storage';

/**
 * ここで変更した値はchrome.storage.syncに保存され、
 * Content Script(バッジ表示)にchrome.storage.onChanged経由でリアルタイム反映される。
 */
export default function Options() {
  const [badgeEnabled, setBadgeEnabled, enabledLoaded] = useStorageValue('badgeEnabled');
  const [badgeLabel, setBadgeLabel, labelLoaded] = useStorageValue('badgeLabel');
  const loaded = enabledLoaded && labelLoaded;

  return (
    <main className="options">
      <h1>Learning Extensions - 設定</h1>
      <p className="hint">
        変更内容は開いているすべてのページのバッジに即座に反映されます(chrome.storage.onChanged)。
      </p>

      {!loaded ? (
        <p>読み込み中...</p>
      ) : (
        <form onSubmit={(event) => event.preventDefault()}>
          <label className="field field-checkbox">
            <input
              type="checkbox"
              checked={badgeEnabled}
              onChange={(event) => setBadgeEnabled(event.target.checked)}
            />
            ページにバッジを表示する
          </label>

          <label className="field">
            バッジの文言
            <input
              type="text"
              value={badgeLabel}
              onChange={(event) => setBadgeLabel(event.target.value)}
              disabled={!badgeEnabled}
            />
          </label>
        </form>
      )}
    </main>
  );
}
