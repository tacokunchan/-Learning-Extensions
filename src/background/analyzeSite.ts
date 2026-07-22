import type { PageContent, SiteAnalysis } from '../shared/pageContent';
import { getStorageValue } from '../shared/storage';

/**
 * 【Phase 4で作ったモック実装】
 * ルールベースでカテゴリを判定するだけの版。本物のAPI実装が動くようになった後も
 * 「APIキー未設定のときのフォールバック」や「動作比較用」として残しておくと便利。
 */
async function analyzeSiteMock(pageContent: PageContent): Promise<SiteAnalysis> {
  const categoryKeywords: Record<string, string[]> = {
    ニュースサイト: ['ニュース', 'news'],
    ECサイト: ['カート', '価格', 'ショップ', '購入'],
    個人ブログ: ['blog', 'ブログ'],
  };
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const text = `${pageContent.title} ${pageContent.headings.join('')}`.toLowerCase();

  let category = '不明';
  for (const [name, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      category = name;
      break;
    }
  }
  return { category, summary: `(モック) ${pageContent.title} の分析結果です。` };
}

/**
 * ページ情報からサイトの分析結果を作る(Phase 5: 本物のClaude APIを呼ぶ版)。
 *
 * 全体の流れは5ステップ。上から順にTODOを埋めていけば動くはず。
 * 詰まったら AI_BOT_GUIDE.md の Phase 5-3 と、各TODOのヒントを見返すこと。
 */
export async function analyzeSite(pageContent: PageContent): Promise<SiteAnalysis> {
  // ---------------------------------------------------------------------
  // ステップ1: APIキーをstorageから取得する
  // ---------------------------------------------------------------------
  // ヒント:
  // - getStorageValue('apiKey') は Promise<string> を返す(このファイルの先頭でimport済み)
  // - キーが空文字("")なら「Optionsページで設定してください」のようなエラーをthrowする
  //   → fetchする前にここでガードしておくと、原因不明のネットワークエラーで
  //     ハマらずに済む
  //
  // const apiKey = await getStorageValue('apiKey');
  // if (!apiKey) {
  //   throw new Error('APIキーが設定されていません。Optionsページで設定してください。');
  // }
  const apikey = await getStorageValue('apiKey');
  if(!apikey){
    throw new Error('APIキーが設定されていません。Optionsページで設定してください。')
  }

  // ---------------------------------------------------------------------
  // ステップ2: pageContentからプロンプト(AIへの指示文)を組み立てる
  // ---------------------------------------------------------------------
  // ヒント:
  // - 使えるフィールド: pageContent.title / description / headings / bodyText
  // - bodyTextはページによってはかなり長くなるので、
  //   pageContent.bodyText.slice(0, 2000) のように先頭だけ使うのがおすすめ
  //   (トークン数の節約にもなる)
  // - headingsは配列なので headings.join('\n') などで文字列化する
  // - 「サイトのカテゴリと要約を判定して」という指示文の中に、上の情報を埋め込む
  //   テンプレートリテラルを作るイメージ
  //
  // const prompt = `以下のWebページを分析し、カテゴリと要約を判定してください。
  //
  // タイトル: ${pageContent.title}
  // 説明: ${pageContent.description ?? '(なし)'}
  // 見出し: ${pageContent.headings.join('\n')}
  // 本文抜粋: ${pageContent.bodyText.slice(0, 2000)}`;
  const prompt = `以下のwebページを分析し、カテゴリと要約を判定してください。
  タイトル; ${pageContent.title}
  説明: ${pageContent.description ?? '(なし)'}
  見出し: ${pageContent.headings.join('\n')}
  本文抜粋: ${pageContent.bodyText.slice(0,2000)}`;
  // ---------------------------------------------------------------------
  // ステップ3: fetch()でClaude APIを呼び出す
  // ---------------------------------------------------------------------
  // ヒント:
  // - URL: https://api.anthropic.com/v1/messages
  // - headers に必要なもの:
  //     'x-api-key': apiKey,
  //     'anthropic-version': '2023-06-01',
  //     'content-type': 'application/json',
  //     'anthropic-dangerous-direct-browser-access': 'true',  ← 拡張機能から直接呼ぶ場合に必須
  // - body(JSON.stringify対象)の形:
  //     {
  //       model: 'claude-opus-4-8',
  //       max_tokens: 300,
  //       // output_config.format でJSON Schemaを指定すると、
  //       // 「必ずこの形のJSONで返ってくる」ことが保証されるのでパースが安全になる
  //       output_config: {
  //         format: {
  //           type: 'json_schema',
  //           schema: {
  //             type: 'object',
  //             properties: {
  //               category: { type: 'string' },
  //               summary: { type: 'string' },
  //             },
  //             required: ['category', 'summary'],
  //             additionalProperties: false,
  //           },
  //         },
  //       },
  //       messages: [{ role: 'user', content: prompt }],
  //     }
  // - response.ok が false のときは、後続処理に進まずエラーをthrowする
  //   (例: `Claude API error: ${response.status}`)
  //
  // const response = await fetch('https://api.anthropic.com/v1/messages', {
  //   method: 'POST',
  //   headers: { ... },
  //   body: JSON.stringify({ ... }),
  // });
  // if (!response.ok) {
  //   throw new Error(`Claude API error: ${response.status}`);
  // }
  const response = await fetch('https://api.anthropic.com/v1/messages',{
    method: 'post',
    headers: {
      'x-api-key': apikey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 300,
      output_config: {
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              summary: { type: 'string' },
            },
            required: ['category', 'summary'],
            additionalProperties: false,
          },
        },
      },
      messages: [{ role: 'user', content: prompt }],
    })
  })
  if(!response.ok){
    throw new Error(`claude API error: ${response.status}`)
  }



  
  // ---------------------------------------------------------------------
  // ステップ4: レスポンスをパースして SiteAnalysis の形にする
  // ---------------------------------------------------------------------
  // ヒント:
  // - レスポンス全体の形は { content: [{ type: 'text', text: '...' }], ... }
  // - output_config.format を使っている場合、text の中身は
  //   スキーマ通りのJSON文字列になっているはず → JSON.parse() でそのまま SiteAnalysis にできる
  // - 型を確認したいときは一度 console.log(JSON.stringify(data, null, 2)) して
  //   Service WorkerのDevTools(chrome://extensions → Service Worker)で中身を見るとよい
  // - JSON.parseはそれでも失敗する可能性があるので try/catch で囲み、
  //   失敗したら分かりやすいエラーをthrowする(呼び出し元でANALYSIS_ERRORになる)
  //
  // const data = await response.json();
  // const text = data.content[0].text;
  // try {
  //   const result = JSON.parse(text) as SiteAnalysis;
  //   return result;
  // } catch {
  //   throw new Error('AIの返答をJSONとして解析できませんでした。');
  // }
  const data = await response.json();
  const text = data.content[0].text;
  try{
    const result = JSON.parse(text) as SiteAnalysis;
    return result;
  } catch{
    throw new Error('AIの返答をJSONとして解析できませんでした。');
  }
  // ---------------------------------------------------------------------
  // ステップ5(任意・発展): モックへのフォールバック
  // ---------------------------------------------------------------------
  // APIキー未設定時だけ analyzeSiteMock() にフォールバックする、といった
  // 使い分けも可能。ただし「エラーを握りつぶして気づかない」状態にならないよう、
  // フォールバックしたことが分かるログ(console.warnなど)は出しておくのがおすすめ。

  throw new Error(`TODO: analyzeSite を実装してください (title: ${pageContent.title})`);
}
