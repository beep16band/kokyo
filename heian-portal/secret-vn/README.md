# 言の葉の檻 ― 千年の約束 ―

第1〜5章の段階実装。添付v1.2統合稿を使用。最終台本・教師校閲、全7章の完成ではない。

- [第1章「帰れない二人」](https://beep16band.github.io/kokyo/heian-portal/secret-vn/)：7シーン・8問。
- [第2章「消えた故郷」](https://beep16band.github.io/kokyo/heian-portal/secret-vn/chapter2.html)：8シーン・12問。
- [第2章の背景・立ち絵確認](https://beep16band.github.io/kokyo/heian-portal/secret-vn/chapter2-art.html)
- [第1章の顔ワイプ確認](https://beep16band.github.io/kokyo/heian-portal/secret-vn/portrait-check.html)
- [第2章の実装・検証・出典・素材記録](CHAPTER2.md)

GitHub Pagesを生徒用配信先とする。Sitesは生徒用として使用しない。通常編、和歌、ミニゲーム、既存素材、既存保存キーは変更しない。

## 操作

クリック／タップ／Space／Enter／→で全文と次へ。←で戻る、1〜4で4択、Lで履歴。AUTO・既読送りはクイズで停止。章末から次章へ。章ごとに自動保存・手動保存・JSON入出力・回想・学習記録が使える。

## 解放

通常記録`heian-portal-v44`の`storyVersion:53`と5話の読了、ゲーム記録`heian-portal-games-v50`の6種満点を読み取る。出題数8・16・全問別の記録に対応。全問数60／30／86／30／60／24。通常記録への書き込みなし。第2章には第1章の読了も必要。開発用解放フラグは公開しない。

## 保存

第1章の自動保存`heian-portal-secret-vn-v1`、第2章は同`-c02`。手動保存は各々に`-manual`。旧第1章の記録を維持。公開先・端末・ブラウザが変わる場合は、各章の設定からJSONを書き出して読み込む。章の違う記録は受け付けない。

## コード

`core.mjs`が章別のデータ・問題数・問題挿入位置を読み取る。`app.mjs`・`style.css`・`portraits.mjs`を共用し、台本は`chapter1.json`・`chapter2.json`。ワイプは各画像の顔座標をSVG viewBoxへ渡す。降下する桜なし。OSの動きを減らす設定には連動させず、画面内の演出設定を使用。

音響はオリジナルWeb Audio環境音・効果音。専用録音BGMは未制作。忘れの主の本立ち絵も未制作で、第1章は墨と声の試験演出。第6〜7章、記憶図鑑、総合演習は後続工程。通常ポータル本体への入口追加はまだ行っていない。

## 検査

```
node test-core.mjs
node test-chapter2.mjs
```

第1章13項目・第2章7項目合格。旧第1章63地点との互換性も検査。実ブラウザ全編・実機・既存コンテンツ全編の実プレイ回帰は別途必要。自動検査だけで総合デバッグ完了とはしていない。


第3章を追加：`chapter3.html`。実装・未完了事項は[CHAPTER3.md](CHAPTER3.md)、新規素材は[ASSETS-C03.md](ASSETS-C03.md)。通常ポータル本体は変更しない。


第4章を追加：`chapter4.html`。実装・修正・未完了事項は[CHAPTER4.md](CHAPTER4.md)、素材は[ASSETS-C04.md](ASSETS-C04.md)。共通エンジンと第1〜3章の台本・セーブ位置は変更なし。


第5章を追加：`chapter5.html`。9シーン・82行・8問。実装・出典は[CHAPTER5.md](CHAPTER5.md)、素材は[ASSETS-C05.md](ASSETS-C05.md)、公開画面の確認は[QA-C05.md](QA-C05.md)。第4章末から続けて入章できる。通常ポータルと82秒OPには変更なし。
