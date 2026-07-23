import { useStorageValue } from '../shared/storage';

/**
 * ここで変更した値はchrome.storage.syncに保存され、
 * Content Script(AIボットアイコン)にchrome.storage.onChanged経由でリアルタイム反映される。
 */
export default function Options() {
  const [aiBotEnabled, setAiBotEnabled, loaded] = useStorageValue('aiBotEnabled');
  const [apiKey, setApiKey, apiKeyLoaded] = useStorageValue('apiKey');

  return (
    <main className="options">
      <h1>Learning Extensions - 設定</h1>
      <p className="hint">
        変更内容は開いているすべてのページのAIボットアイコンに即座に反映されます(chrome.storage.onChanged)。
      </p>

      {!loaded || !apiKeyLoaded ? (
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
          <label className="field">
            Claude APIキー
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="sk-ant-..."
            />
          </label>
        </form>
        
      )}

      
      {/*
        TODO(発展): APIキーの入力欄をここに追加しよう。
        StorageSchemaへの apiKey: string 追加は済んでいるので、あとはUI側だけでOK。
        全体は3ステップ。上の aiBotEnabled のコード(8行目・21〜28行目)が
        そのままお手本になっているので、見比べながら進めるとやりやすい。

        ---------------------------------------------------------------
        ステップ1: stateを取得する
        ---------------------------------------------------------------
        - 8行目の const [aiBotEnabled, setAiBotEnabled, loaded] = ... と全く同じ形。
          コンポーネント関数のトップレベル(8行目の下あたり)に1行追加するだけ:

          const [apiKey, setApiKey, apiKeyLoaded] = useStorageValue('apiKey');

        - useStorageValueは [値, 更新関数, 読み込み済みかどうか] の3つを返す
          (storage.tsのuseStorageValueの型定義を見てみると分かりやすい)

        ---------------------------------------------------------------
        ステップ2: 入力欄のJSXを書く
        ---------------------------------------------------------------
        - 21〜28行目の <label className="field field-checkbox"> ブロックの
          直後(</label>の後、</form>の前)に、同じ<form>の中の要素として追加する
        - 構造は checkbox版とほぼ同じで、typeとvalue/checkedの扱いだけ違う:

          <label className="field">
            Claude APIキー
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="sk-ant-..."
            />
          </label>

        - checkboxは checked={aiBotEnabled} だったが、textやpasswordの入力欄は
          value={apiKey} を使う(この違いに注意)

        ---------------------------------------------------------------
        ステップ3(任意): 読み込み中の見た目を統一する
        ---------------------------------------------------------------
        - 今は17行目の {!loaded ? ... : ...} の条件が aiBotEnabled 用の loaded だけを見ている
        - apiKeyの読み込みも待ちたい場合は !loaded && !apiKeyLoaded のように
          両方をチェックする形に変えるとよい(必須ではない、余裕があれば)

        ---------------------------------------------------------------
        動作確認のヒント
        ---------------------------------------------------------------
        - 保存されたかどうかは、拡張機能のService Worker DevTools(Consoleタブ)で
          chrome.storage.sync.get('apiKey', console.log) を実行して確認できる
        - background/analyzeSite.ts 側は既に getStorageValue('apiKey') で
          この値を読み出す実装になっている(ステップ1)ので、繋げば完了

      */
      
      }
    </main>
  );
}
