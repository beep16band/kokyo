# 工程㉗・㉘への着手：Phase 1 予備監査

> これは統合仕様受領前の監査記録です。その後2026-10-17に全文を受領し、Phase 2以降を実装しました。現在の実装・検証範囲は[UPDATE_REPORT_V3.md](UPDATE_REPORT_V3.md)を参照してください。以下の「仕様未取得・本番保留」は予備監査時点の記録です。

実施日：2026-10-17（日本時間）

## 位置づけと公開判断

- 調査基準：GitHub main `38c9c503be7e0bcd5cae135a366df0c3f3365227`（v2.2）。着手時にremoteを再取得し、最新版であることを確認。
- 開発ブランチ：`dev/kotoba-shop-phase27-20261017`。
- 工程㉗「ChatGPT Work実装指示書 Ver.1.0」と工程㉘「品質テスト完全仕様 Ver.1.0」の原文全文は、着手時点でこの作業環境に提供されていない。関連ファイルの検索と過去対話の取得を試したが、概要・一部の数値しか取得できなかった。
- この文書は現行ソースに基づく予備監査であり、工程㉗・㉘の正式なPhase 1合格を意味しない。次Phase、新規施設・8章・新素材の実装を推測で開始しない。
- 本番mainおよびGitHub Pagesは変更しない。全文取得後に要件対応表とテスト条件を確定する。

## 現行の構成

index.htmlのscript読込順は以下。外部ライブラリに依存しないclassic scriptで、グローバルの関数・状態を共有し、後から関数をラップ・上書きする構成。

| ファイル | 担当 |
| --- | --- |
| core.js | 初期化、商売・在庫・会計・評判、家具、農園、図鑑、住民交流、季節、設備、設定、保存、学習・教師レポート、旧描画 |
| world.js | 9地区の生成、建物・道・橋・水・木・出入口と通行判定 |
| movement.js | 移動補間、通常155ms/ダッシュ95ms、NPC移動、地区移動、屋内への出入り、座標移行 |
| activities.js | 地区の施設と既存機能の接続、発見、依頼、保存位置の検証、バックアップ復元 |
| ui.js | HUD、メニュー、地区図、設定とセーブUI |
| navigation.js | ミニマップ、目印、キーボードによる選択 |
| tutorial.js | 7段階の初回操作ガイド、進捗と中断・再開 |
| render.js | 地区・屋内描画と更新ループ、カメラ、定期保存 |
| play.js | フィールドの虫・釣り・網、採集補助、拠点、近道、効果音 |
| cozy.js | v2.2のオリジナルCanvas描画、描画キャッシュ、温かい配色 |
| base.css / assets/ | 基本CSS、地形・住民PNG、埋込用日本語フォントとライセンス |
| offline.html | 全コード・画像・フォントを内包する単一HTML版 |
| tools/build_offline.py | index.htmlからオフライン版を再生成 |
| tools/generate_original_art.py | 既存の住民・補助地形PNGの生成 |

9地区：町、商店通り、住宅街、森、丘、農園、川、湖、遺跡。屋内sceneはtown/shop/home。章管理の8章進行、クレー射撃場、ギャラクシー先生、よろづ処久庵・阪本先生に相当する実装は、現行kotoba-shop/内のJSを検索した範囲では確認できない。

既存の国語難易度はeasy/normal/hard/expertの4値。core.jsの表示学年は小学1〜2年/小学3〜4年/小学5〜6年/小学校高学年〜中学1年の発展。新仕様の原文を確認するまでは難易度の削除・再割当をしない。

## セーブ形式と保全

- ブラウザ保存：`kotoba_shop_v1`。キー名はそのまま保持する。
- 端末内の控え：`kotoba_shop_backup`（読込・初期化前）、`kotoba_shop_pre_world`（world移行前）。
- JSON書出形式：`{game:"kotoba_shop",version:2,state:{...}}`。state内のversion、worldVersion、learning.version、releaseは別の意味で使われ、単一スキーマ版には統一されていない。
- 読込は上記ラッパー付きJSONとstateを直接持つ旧形式を受け付ける。入力は1MiB以下、scene/x/y/day/coins/位置を検証する。
- 位置：屋外は`worldPosition:{area,x,y}`、屋内はscene/x/y、外へ戻る位置はreturnOutdoor。新地区マップでは48×32、旧屋内では20×12。
- 主な継続状態：coins/day/sales/ordersDone、stock/shelfStock/ledger/reports、reputation/customerAffinity/customerVisits、furnitureOwned/furniturePlaced/roomRewards、farm/farmBag/farmHarvest/produceShelf、creatureBag/creatureCatalog、learning、explore、settings、tutorial、travelSites/shortcutEnds。
- 今回はキー、形式、数値、所持品、進行条件、初期資金を変更していない。動作テストは隔離した一時ブラウザの合成データで実施し、利用者本人の実セーブにはアクセスしていない。

## 再現した不具合と最小修正

### P1-SAVE-01：JSON読込で保存に失敗すると、その後の通常保存が停止する

読込確定時にsuspendSave=trueを設定した後、localStorage.setItemが容量超過等で例外になるとcatch内でフラグが戻らなかった。以降save()が早期returnし、新しい進行が保存されなくなる。

### P1-SAVE-02：初期化処理の失敗でも保存停止状態が残る

同様にlocalStorage.removeItemが拒否されるとフラグが戻らなかった。

両方ともcore.jsの該当catchに`suspendSave=false`を追加。保存・削除自体は従来どおり例外時に中止し、失敗メッセージを表示する。バックアップ取得、確認ダイアログ、成功時の再読込は変更していない。offline.htmlにも再生成で反映した。

## 実行した予備回帰テスト

スクリプト：`tools/audit_phase1.cjs`。Playwright/Chromiumを使用。ブラウザ実行ファイルの場所が既定外の場合はPLAYWRIGHT_CHROMIUM_EXECUTABLE_PATHを設定する。テスト依存はゲーム本体には追加していない。

修正前：20項目中18合格、上記2件を再現。修正後：20/20合格、pageerrorなし。

1. 新規開始、保存キーとv2.2の確認
2. 9地区の生成と初期位置の通行可能性（地区ごとに1項目）
3. 壁と水の通行拒否
4. 通常移動とダッシュの時間
5. 店の扉で入室し、国語課題を開始できる
6. 最小の旧形式セーブで金額・日・在庫・名前を保持、移行前控えを作成
7. v2.2の金額・評判・倉庫/棚在庫・好感度・地区・設定・手帳・探索記録を再読込で保持
8. 釣りのアタリから釣果へ進み、網を振った後busy状態が解除される
9. JSON読込の保存例外後に元データを保持し、保存を再開する
10. 初期化の削除例外後に元データを保持し、保存を再開する
11. オフライン単一HTMLをfile URLで初期化、HTTPリクエスト0件
12. 上記操作中のJavaScript実行時エラーなし

地区9項目を別々に数えて合計20項目。構文チェックとgit diff --checkも実施。

## 未検証・要確認

- 工程㉗・㉘の全文、全Phaseと正式な合格条件。
- 8章全体、経済30分の試算、全ミニゲーム・施設・季節イベント等の新要件。現在の9地区を8章の完成と混同しない。
- 実データを含む全世代・全組合せの旧セーブ互換性。合成した代表2ケースの合格を「互換100%」としない。
- JSONのネストされた各状態の厳密スキーマ検証。トップレベル検証だけで全破損データが拒否されることは保証しない。
- Chromebook/iPad実機の性能・長時間プレイ・ストレージ制限。今回のChromiumテストを実機合格の代わりにしない。
- 購買・接客・家具編集・作物成長・住民イベント等の全分岐。今回の限定回帰は全ゲーム網羅ではない。
- 関数ラップの依存が多いため、将来の分割/再編は保存形式・読込順・回帰テストの固定後に別Phaseとして扱う。

**次へ進む条件：工程㉗・㉘の全文を受領し、現在の実装との差分と各Phaseのゲートを対応付けること。本番公開は引き続き保留。**
