# 3D背景＋2Dキャラ：町の表示試作

対象は町1地区。既存の機能・3D背景・2D素材を引き継ぐ。公開版には未反映。

## 確認方法
既存のkotoba-shop一式を同じフォルダに置き、HTTPサーバーでsprite-prototype.htmlを開く。
例: リポジトリのルートで python3 -m http.server 8000
URL: http://localhost:8000/kotoba-shop/sprite-prototype.html

PCで開始し、町の中央へ移動する。「キャラ：2D／3D（比較）」で既存表示と比較できる。
試作セーブは通常セーブとは別。ほかの地区や室内はこの工程の対象外。

## 仮の制作基準
- 既存の正投影カメラを継承。注視点から高さ19・奥行15（地面から約51.7度）。
- 背景は既存3D、キャラはカメラへ向くThree.js Sprite。全身を3Dモデルへ作り替えない。
- 既存64×80の透過スタンプを使用。ワールド寸法は幅1.552・高さ1.94、中心は(0.5,0.05)、配置高さ0.07。
- 向きは下・左・右・上の絵で変更し、身体を3D回転させない。
- 影は地面の既存円柱形状。深度テスト・深度書込み・alphaTest=0.12で前後を判定。
- プロフィール付きキャラは既存の待機・歩行等のスタンプに接続。動物住民は待機絵4方向。
- 当面の仮基準。全方向・全動作・全地区・道具・景観・実機の仕上げは後続F2〜F7で行う。

## 構成
- sprite-prototype.html: 試作用エントリ。
- sprite-prototype-storage.js: 通常セーブから分離。
- town-sprite-prototype.js: 試作キャラ表示と比較ボタン。既存モジュールを後段で拡張。
- tools/sprite_prototype_quality.cjs: ブラウザ検証。
- qa/sprite-prototype-20261018.json: 今回の結果。
- qa/sprite-prototype-town-20261018.png: 実際のゲーム画面。生成イメージではない。

## 再検証
Node.js・Python3・Playwright・利用可能なChromiumを準備する。検証環境の準備はWORK_PROGRESS.mdのV2参照。

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium node kotoba-shop/tools/sprite_prototype_quality.cjs
```

出力先はsprite-prototype-audit/。KOTOBA_AUDIT_OUTPUTで変更できる。
