import type { PageContent } from '../shared/pageContent';

/**
 * 現在のページからAIに渡す情報を抽出する。
 * (Content Scriptはページと同じDOMにアクセスできるので、documentを直接触ってよい)
 *
 * 実装のヒント:
 * 1. document.title でタイトルを取得する
 * 2. document.querySelector('meta[name="description"]') の content 属性で
 *    説明文を取得する(タグが無いページもあるので、その場合はundefinedのままでよい)
 * 3. document.querySelectorAll('h1, h2, h3') を使って見出しのテキストを配列にする
 *    - 数が多いページもあるので、先頭5件程度に絞る(Array.prototype.slice)とAPIに送る量を抑えられる
 *    - 各要素からテキストを取り出すには .textContent を使い、前後の空白は .trim() で除く
 * 4. document.body.innerText でページの可視テキストを取得する
 *    - script/styleタグの中身はinnerTextには含まれないので安心してよい
 *    - 文字数が多いとAPIのトークン上限やコストが増えるので、
 *      先頭2000〜3000文字程度に .slice(0, N) で切り詰める
 * 5. location.href をurlとして使う
 *
 * 難しく感じたら、まずは title と bodyText の2つだけ実装して動作確認し、
 * 動くようになってから description / headings を追加していくのがおすすめ。
 */
export function extractPageContent(): PageContent {
  const title = document.title;
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? undefined;
  const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map(element => element.textContent?.trim()).filter(text => !!text).slice(0,5);
  const bodyText = document.body.innerText.slice(0,3000);
  const url = location.href;

  return { url,title,description,headings,bodyText};
}
