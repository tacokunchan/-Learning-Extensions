# AIボット機能 実装ガイド

「どのサイトを開いても右下にAIボットアイコンが現れ、クリックするとそのページがどんなサイトかをAIが分析してくれる」機能を、自分の手で実装していくためのガイドです。

## この機能の全体像

```
[ページ]
   │ アイコンをクリック
   ▼
Content Script (AiBotWidget.tsx)
   │ 1. extractPageContent() でページ情報を集める
   │ 2. chrome.runtime.sendMessage({ type: 'ANALYZE_PAGE', payload }) で送信
   ▼
Background Service Worker (index.ts → analyzeSite.ts)
   │ 3. analyzeSite() でサイトを分析する(最初はモック、後でAI API)
   │ 4. 結果を sendResponse で返す
   ▼
Content Script (AiBotWidget.tsx)
   │ 5. 結果を state にセットしてパネルに表示する
   ▼
[ページ上にパネル表示]
```

Popupで作った「Ping content script」「Get tab info via background」と同じ
**「メッセージを送って、返事を待つ」**パターンの応用です。迷ったら`src/popup/Popup.tsx`の
`handlePing` / `handleGetTabInfo`を見返してみてください。

## 用意したもの / 自分で実装するもの

| 種類 | ファイル | 状態 |
| --- | --- | --- |
| データの型 | `src/shared/pageContent.ts` | 完成済み |
| メッセージの型 | `src/shared/messages.ts` | 完成済み(ANALYZE_PAGE等を追加済み) |
| storageのスキーマ | `src/shared/storage.ts` | 完成済み(aiBotEnabledに変更済み) |
| Background側の配線 | `src/background/index.ts` | 完成済み(ANALYZE_PAGEのハンドラを追加済み) |
| **ページ情報の抽出ロジック** | `src/content/extractPageContent.ts` | **TODO(自分で実装)** |
| **サイト分析ロジック** | `src/background/analyzeSite.ts` | **TODO(自分で実装)** |
| **アイコン+パネルのUI** | `src/content/AiBotWidget.tsx` | **TODO(自分で実装)** |
| 見た目 | `src/content/ai-bot.css` | 完成済み |

型やメッセージの配線は「決まった形」なので用意してあります。自分で実装するのは、
**ページから何を読み取るか(抽出ロジック)**、**AIにどう判断させるか(分析ロジック)**、
**結果をどう見せるか(UIの状態管理)** という、このアプリならではの部分です。

## Phase 1: 型を読んで全体設計を理解する

まずはコードを書く前に、以下の2ファイルを読んで「どんなデータが、どんな形でやり取りされるか」を掴んでください。

- `src/shared/pageContent.ts` … `PageContent`(抽出したページ情報)と`SiteAnalysis`(分析結果)の形
- `src/shared/messages.ts` … `ANALYZE_PAGE` / `ANALYSIS_RESULT` / `ANALYSIS_ERROR` の3つのメッセージ

「Content Scriptが`PageContent`を作ってBackgroundに送り、Backgroundが`SiteAnalysis`を作って返す」という役割分担を意識しておくと、この後の実装で迷いません。

## Phase 2: ページ情報の抽出を実装する

**ファイル: `src/content/extractPageContent.ts`**

ファイル内のコメントに沿って、`document`からタイトル・説明文・見出し・本文を集める関数を実装してください。

動作確認のやり方:
1. `npm run dev`を実行し、`chrome://extensions`で`dist/`を読み込む(またはリロード)
2. 適当なWebページを開き、右クリック→「検証」→Consoleタブを開く
3. 一時的に`main.tsx`の`mount()`呼び出しの下あたりに`console.log(extractPageContent())`を書き足して、
   Consoleに正しい形のオブジェクトが出力されるか確認する
4. 確認できたら、デバッグ用の`console.log`は消してOK

## Phase 3: Content Script側のUIを実装する

**ファイル: `src/content/AiBotWidget.tsx`**

ファイル内のコメントに沿って、以下を実装してください。

1. `isOpen` / `status` / `result` / `errorMessage` の状態(`useState`)
2. アイコンクリック時の処理(`handleClick`): ページ情報の抽出 → メッセージ送信 → 結果をstateに反映
3. `isOpen`が`true`のときだけ結果パネル(`ai-bot__panel`)を表示するJSX

この時点ではまだ`analyzeSite`が未実装(`throw`する)なので、クリックすると
**エラーパネルが表示される**のが正解です。「配線が正しく動いている」ことの確認になります。

##ここまで完成↑

## Phase 4: Backgroundのモック実装で動きを完成させる

**ファイル: `src/background/analyzeSite.ts`**

まずは固定値や簡単なルールベースの判定を返すモック実装を書いてください。これで
アイコンクリック → ローディング表示 → 分析結果パネル、という一連の流れが完成するはずです。

動作確認:
1. `npm run dev`のままChrome拡張をリロード
2. 任意のページを開き、右下のAIボットアイコンをクリック
3. 「分析中...」→ モックの結果、の順で表示されればOK
4. 拡張機能の詳細画面(`chrome://extensions`)→「Service Worker」リンクから
   BackgroundのDevToolsを開くと、`console.log`やエラーを確認できる

ここまでできれば、AIボット機能の骨組みは完成です。

## Phase 5(発展): 本物のAI APIに差し替える

モックで流れが確認できたら、`analyzeSite.ts`を本物のAI呼び出しに差し替えていきましょう。

### 5-1. APIキーを保存できるようにする

- `src/shared/storage.ts`の`StorageSchema`に`apiKey: string`を追加し、`STORAGE_DEFAULTS`にも空文字を追加する
- `src/options/Options.tsx`の一番下にあるTODOコメントに沿って、APIキー入力欄を追加する

### 5-2. manifest.config.tsにhost_permissionsを追加する

`manifest.config.ts`のTODOコメントを参照し、使うAPIのドメインを`host_permissions`に追加してください。
拡張機能は`host_permissions`で許可したドメインに対して、通常のWebページではできないクロスオリジン通信ができます(CORSの制約を受けない)。これは拡張機能特有の強力な権限なので、必要最小限のドメインだけ許可するのが原則です。

### 5-3. analyzeSite.tsをfetch()で書き換える

**Claude API(Anthropic)を使う場合**

```
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: <APIキー>
  anthropic-version: 2023-06-01
  content-type: application/json
  anthropic-dangerous-direct-browser-access: true   ← ブラウザ/拡張機能から直接呼ぶ場合に必須
Body:
  {
    "model": "claude-sonnet-4-5",
    "max_tokens": 300,
    "messages": [{ "role": "user", "content": "<組み立てたプロンプト>" }]
  }
```

レスポンスは`{ content: [{ type: "text", text: "..." }] }`という形で返ってくるので、
`text`の中身(AIの返答)をパースしてcategory/summaryを取り出します。

**OpenAI APIを使う場合**

```
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer <APIキー>
  Content-Type: application/json
Body:
  {
    "model": "gpt-4o-mini",
    "messages": [{ "role": "user", "content": "<組み立てたプロンプト>" }]
  }
```

レスポンスは`{ choices: [{ message: { content: "..." } }] }`という形です。

**共通のヒント**

- プロンプトの最後に「以下のJSON形式で、日本語で答えてください: `{"category": "...", "summary": "..."}`」
  のように指示しておくと、パースが楽になります
- AIの返答は必ずしも厳密なJSONとは限らないので、`JSON.parse`は`try/catch`で囲み、
  失敗したときは`ANALYSIS_ERROR`になるようにしておくと安全です
- APIキーが未設定のときは、fetchする前に分かりやすいエラーを投げるようにしましょう

## Phase 6(さらに発展): 余裕があれば挑戦

- **同じページの再分析を防ぐ**: `chrome.storage.local`に`url`をキーにして分析結果をキャッシュし、
  同じページなら再度APIを呼ばずにキャッシュを表示する
- **ローディング中はアイコンをアニメーションさせる**: CSSの`@keyframes`でアイコンを回転/点滅させる
- **SPA対応**: URLが変わってもページ全体が再読み込みされないサイト(SPA)では、
  `history.pushState`をフックするか`MutationObserver`でURL変化を検知する必要がある
  (まずは通常のページ遷移で動くところまでを目標にすればOK)
