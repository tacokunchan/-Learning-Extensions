/**
 * AIボットが扱う「ページ情報」と「分析結果」のデータ契約(型)。
 * Content Script(抽出) → Background(分析) → UI(表示) と受け渡す共通の形。
 */

/** Content Scriptがページから抽出する情報。 */
export interface PageContent {
  url: string;
  title: string;
  description?: string;
  headings: string[];
  bodyText: string;
}

/** AIによる分析結果。 */
export interface SiteAnalysis {
  /** サイトの種類(例: "ニュースサイト", "ECサイト", "個人ブログ" など)。 */
  category: string;
  /** サイトの内容を2〜3行程度で要約したテキスト。 */
  summary: string;
}
