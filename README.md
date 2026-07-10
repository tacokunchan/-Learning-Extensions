# -Learning-Extensions

このプロジェクトは拡張機能の作り方を学び、実際にデプロイしてみるところまでを学ぶ場です。

React 18 + TypeScript + Vite([@crxjs/vite-plugin](https://crxjs.dev/vite-plugin))で構築した、Chrome拡張機能(Manifest V3)の開発用テンプレートです。

## 技術スタック

- React 18 / TypeScript
- Vite + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)(popup/options/background/content scriptすべてでHMRが効くMV3向けViteプラグイン)
- npm
- ESLint(flat config) + Prettier
- `@types/chrome`(Chrome拡張APIの型)

### なぜNext.jsではなくVite + CRXJSなのか

Chrome拡張は静的ファイルのみで動作し、Next.jsのサーバー機能(SSR/API Routesなど)は使えません。仮にNext.jsを使うなら`output: 'export'`による静的エクスポート構成になりますが、その場合でもbackground service workerやcontent scriptのHMR、manifest.jsonの生成といった拡張機能特有の面倒事は自前で用意する必要があります。CRXJSはこれらをまとめて面倒見てくれるため、本プロジェクトではVite + CRXJSを採用しています。

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

Viteの開発サーバーが起動し、popup/options/content script/background scriptすべてでHMR(ホットリロード)が効きます。ソースを変更すると、Chromeに読み込んだ拡張機能に自動で反映されます(content scriptなど一部はページの再読み込みが必要な場合があります)。

## ビルド

```bash
npm run build
```

`tsc -b`で型チェックした後、`dist/`ディレクトリに本番用ファイル一式が出力されます。

## Chromeへの読み込み方法

1. `npm run build`を実行し、`dist/`ディレクトリを生成する
2. Chromeで`chrome://extensions`を開く
3. 右上の「デベロッパーモード」をONにする
4. 「パッケージ化されていない拡張機能を読み込む」をクリックし、`dist/`ディレクトリを選択する
5. 拡張機能一覧に「Learning Extensions Template」が表示されれば読み込み完了

`npm run dev`で開発する場合も同様の手順で、生成される`dist/`(Viteの開発サーバーが書き出す一時ビルド)を読み込みます。

## 動作確認のポイント

- **Popup**: ツールバーの拡張機能アイコンをクリックして開く。カウンターの`+1`ボタンで`chrome.storage`への保存を確認できる。「Ping content script」で現在のタブのcontent scriptと、「Get tab info via background」でbackground経由の`chrome.tabs`取得(`tabs`権限)をそれぞれ確認できる
- **Options**: Popupの「設定を開く」、または拡張機能の詳細画面から開く。バッジ文言やON/OFFを変更すると、開いている全ページのバッジ表示に即座に反映される(`chrome.storage.onChanged`)
- **Content Script**: 任意のWebページを開くと、右下にバッジが表示される(Shadow DOMでページのCSSから隔離して描画)
- **Background**: `chrome://extensions`の拡張機能詳細から「Service Worker」のリンクをクリックするとDevToolsが開き、`console.log`の出力を確認できる

## ディレクトリ構成

```
├── manifest.config.ts   # defineManifestで型安全にmanifest.jsonを生成する設定
├── vite.config.ts        # Vite + CRXJSの設定
├── public/
│   └── icons/             # 拡張機能アイコン(プレースホルダーの単色PNG。差し替えてください)
└── src/
    ├── background/        # Service Worker。メッセージ受信(PING/GET_TAB_INFO)のサンプル
    ├── content/            # Content Script。Shadow DOM上にReactでバッジUIを注入
    ├── popup/              # ツールバーアイコンクリックで開くPopup(React)
    ├── options/            # 拡張機能の設定ページ(React)
    └── shared/             # popup/options/content/background共通の型・ユーティリティ
        ├── storage.ts       # chrome.storage.syncの型付きget/set + Reactフック
        └── messages.ts      # 拡張全体で共有する型付きメッセージ定義+送信ヘルパー
```

## 権限について

- `storage`: Popup/Optionsで設定・カウンターを保存するために使用
- `tabs`: Backgroundがアクティブタブの情報(URL/タイトル)を取得するサンプルのために使用
- `content_scripts.matches: ["<all_urls>"]`: 汎用テンプレートとしてすべてのサイトにバッジを注入するため。特定サイトのみで良い場合は`manifest.config.ts`の`matches`を絞り込んでください

## アイコンについて

`public/icons/`のPNGはビルド確認用のプレースホルダー(単色画像)です。実際に配布する際は、16x16・48x48・128x128の実アイコンに差し替えてください。
