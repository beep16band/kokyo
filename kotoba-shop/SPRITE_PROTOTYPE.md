# 3D背景＋2Dキャラの統合状況

開発ブランチの通常index.htmlとoffline.htmlへ統合済み。本番mainには未反映。
屋外12地区と、自宅・お店・久庵・学校・カフェ・魚屋・射撃場・模型店の室内8か所が対象。

- town-sprites.js: 共通の2Dキャラ描画。既存3D背景・既存2D絵・既存ゲーム処理を継承。
- index.html: 通常セーブを使う開発版。試作の比較UIを表示しない。
- offline.html: 通常entryから生成。新描画、素材、フォントを埋込。
- sprite-prototype.html: 比較用。sprite-prototype-storage.jsで通常セーブと分離し、town-sprite-prototype.jsで比較UIを追加。TownSpritePrototypeは検証互換のためTownSpritesを参照する。

既存正投影カメラを維持。キャラ画像64×84は元の64×80へ上余白4pxを追加。幅1.552・高さ2.037、中心(0.5,4/84)、配置高さ0.07で縮尺と接地を維持。4方向の絵を切替え、歩行フレームは移動距離に同期。深度・透過判定、手元への竿・網接続、じょうろ表示、root別の画像解放を行う。

## 検証
Node.js、Python3、Playwright、Chromiumが必要。WORK_PROGRESS.mdの検証環境準備を参照。

```bash
python3 kotoba-shop/tools/build_offline.py
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium node kotoba-shop/tools/sprite_integration_quality.cjs
KOTOBA_ENTRY=index.html PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium node kotoba-shop/tools/sprite_services_quality.cjs
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium node kotoba-shop/tools/sprite_prototype_quality.cjs
```

統合7・通常版の生活機能11・表示回帰8の計26項目合格。結果はqa/sprite-integration-20261018.json、sprite-standard-services-20261018.json、sprite-integrated-regression-20261018.json。
旧entryのfixtureと共通ゲーム機能で3難易度・3場面の代表セーブを生成して検証。すべての過去セーブを網羅したものではない。

景観・遮蔽物の目視、導入と通しプレイ、全機能・実機・公開確認は残工程。詳しくはWORK_PROGRESS.md。
