import type { PageContent, SiteAnalysis } from '../shared/pageContent';

/**
 * ページ情報からサイトの分析結果を作る。
 *
 * 【ステップ1: まずはモックから】
 * いきなり本物のAI APIを呼ぶ前に、固定値(または簡単なルールベースの判定)を返す
 * モック実装から始めよう。これでContent Script⇔Background⇔UIの配線が
 * 正しく動くかを先に確認できる。
 *
 * ヒント:
 * - async function にして Promise<SiteAnalysis> を返す
 * - 本物のAPI呼び出しっぽい体感にするため、少し待ってから返すのもおすすめ
 *   (setTimeoutをPromiseでラップして1秒待つ、など。 await/async の練習にもなる)
 * - pageContent.title や pageContent.headings の中身を見て、
 *   「titleに"ニュース"が含まれていたらニュースサイト扱いにする」のような
 *   簡単なルールベース判定を作ってみると、動きが分かりやすい
 *
 * 【ステップ2: 本物のAI APIに差し替える(発展)】
 * モックで一通り動いたら、AI_BOT_GUIDE.md の「Phase 5」を見ながら、
 * Claude APIやOpenAI APIをfetch()で呼び出す実装に差し替えよう。
 * その際のヒント:
 * - APIキーは chrome.storage に保存し、getStorageValue() で読み出す
 *   (Optionsページにキー入力欄を追加する必要がある)
 * - fetch先のドメインは manifest.config.ts の host_permissions に追加しないと
 *   ネットワークエラーになる(なぜ必要か調べてみよう → CORSと拡張機能の権限モデル)
 * - pageContent.title / description / headings / bodyText を使ってプロンプトを組み立てる
 * - AIの返答を「サイトのカテゴリと要約をJSONで返して」という指示にしておくと、
 *   パース(JSON.parse)しやすくなる。ただしAIが必ず正しいJSONを返すとは限らないので、
 *   try/catchでのエラー処理も忘れずに
 */
export async function analyzeSite(pageContent: PageContent): Promise<SiteAnalysis> {
  const categoryKeywords:Record<string,string[]> = {
    'ニュースサイト':['ニュース','news'],
    'ECサイト':['カート','価格','ショップ','購入'],
    '個人ブログ':['blog','ブログ']
  }
  await new Promise((resolve) => setTimeout(resolve,3000));
  const text = `${pageContent.title} ${pageContent.headings.join('')}`.toLowerCase();
  let category = '不明';
  if(text.includes('ニュース')||text.includes('news')){
    category = 'ニュースサイト';
  }else if(text.includes('カート')||text.includes('価格')||text.includes('ショップ')||text.includes('購入')){
    category = 'ECサイト'
  }else if(text.includes('blog')||text.includes('ブログ')){
    category = '個人ブログ'
  }
  // こっちの書き方は数が増えてきたタイミングでの仕様
  // let category = '不明';
  // for (const [name, keywords] of Object.entries(categoryKeywords)) {
  //   if (keywords.some((keyword) => text.includes(keyword))) {
  //     category = name;
  //     break; // 最初に見つかったカテゴリで確定させる
  //   }
  // }
  throw new Error(`TODO: analyzeSite を実装してください (title: ${pageContent.title})`);
}
