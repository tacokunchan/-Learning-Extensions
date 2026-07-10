import { useStorageValue } from '../shared/storage';
// TODO: 実装に必要なものをimportしよう
// - useState ('react')
// - extractPageContent ('./extractPageContent')
// - sendMessageToBackground ('../shared/messages')
// - SiteAnalysis (型) ('../shared/pageContent')

/**
 * ページに常駐するAIボットアイコン。
 * クリックすると現在のページを分析し、結果をパネルで表示する。
 *
 * 【状態設計のヒント】
 * - パネルの開閉: isOpen (boolean)
 * - 分析の進行状況: status ('idle' | 'loading' | 'done' | 'error') のようなUnion型がおすすめ
 *   (複数のbooleanで表すより、1つの文字列で管理すると条件分岐がシンプルになる)
 * - 分析結果: result (SiteAnalysis | null)
 * - エラーメッセージ: errorMessage (string | null)
 *
 * 【クリック時の処理の流れ(handleClickの中身)】
 * 1. パネルを開く(isOpen = true)、status を 'loading' にする
 * 2. extractPageContent() で現在のページ情報を取得する
 * 3. sendMessageToBackground({ type: 'ANALYZE_PAGE', payload: pageContent }) を送る
 *    (src/popup/Popup.tsx の handlePing / handleGetTabInfo が同じ
 *    「メッセージを送って結果を待つ」パターンなので、書き方に迷ったら見てみよう)
 * 4. 返ってきたレスポンスの type を見て
 *    - 'ANALYSIS_RESULT' なら result にセットして status を 'done' に
 *    - 'ANALYSIS_ERROR' なら errorMessage にセットして status を 'error' に
 *    - extractPageContent() や sendMessageToBackground() が例外を投げる可能性もあるので
 *      try/catchも検討しよう
 *
 * 【スタイルはai-bot.cssで用意済み】以下のクラス名を使うとそのまま見た目が付く:
 * - 結果パネル: className="ai-bot__panel"
 * - エラーメッセージ: className="error"
 */
export default function AiBotWidget() {
  const [enabled] = useStorageValue('aiBotEnabled');

  // TODO: ここに isOpen / status / result / errorMessage の useState を書く

  const handleClick = async () => {
    // TODO: 上のヒントに沿って実装する
  };

  if (!enabled) return null;

  return (
    <div className="ai-bot">
      <button
        type="button"
        className="ai-bot__icon"
        onClick={handleClick}
        aria-label="AIボットでこのページを分析"
      >
        🤖
      </button>

      {/* TODO: isOpen が true のときだけ ai-bot__panel を表示する */}
      {/* パネルの中身の出し分け:
          - status === 'loading' → 「分析中...」
          - status === 'done' && result → result.category と result.summary を表示
          - status === 'error' → <p className="error">{errorMessage}</p>
      */}
    </div>
  );
}
