# 会話時の画面固定・階段の修正（2026-10-06）

- 原因：dialogue-openでGridの会話行が82px（スマホ105px）になり、その分Canvasの表示領域が縮んでいた。
- 修正：GridはヘッダーとCanvasの2行で固定。会話枠はabsoluteの重ね表示にし、開閉によるCanvasのサイズ変更をなくした。スマホのタッチボタン位置も会話中に変えない。
- 校内階段：背景は奥が狭く手前が広い。以前の主人公は手前ほど小さくなっていた。足元を固定したまま、奥84%→手前100%へ連続的に揃えた。通行範囲は踊り場の幅と手すりの広がりに追従する。
- 地下階段：新画像 `assets/kotoba-tower/ch1-descent-v3.webp` を使用。石の段、上・下の踊り場、手すりを描き直した。左右入力に段の傾きに沿う移動を加え、手すりの内側を通る判定へ合わせた。左右の向きと歩行・ダッシュは共通の方向管理を使う。
- 既存の教室・図書室・会話内容・問題398問・進行は維持。

## 検査

`node scripts/test-ch1.cjs` PASS。校内階段の往復・再入場、壁と手すりの判定、地下階段を上って学校へ戻る／再び下りる動作、村までの既存進行を確認。
ブラウザ検査ページ `tests/ch1-browser-v027e.html` は1060×720／393×851で会話前後のCanvas表示サイズが同一かも検査する。実機スマホの検査ではない。

## 画像生成

組み込みimage_genを使用。編集対象は既存地下階段、スタイル参照は図書室。生成後480×320の論理解像度を基準に960×640へ最近傍拡大して保存。

使用プロンプト：

Use case: precise-object-edit / style-transfer. Image 1 is the EDIT TARGET, a 960x640 underground stair game map; Image 2 is STYLE REFERENCE ONLY, the existing school library, do not add library furniture. Improve the central stone staircase and background rendering to match the detailed polished pixel art and subtle depth of image 2. Keep image 1 map geometry exactly: top wall 0..190px, floor 190..600px, thin foreground wall below600px; left and right floor openings at y416..546px. The player traverses stairs from SCREEN LEFT to SCREEN RIGHT at y480px. Replace the sideways giant blocks in rectangle x210..810, y240..548 with a proper clearly readable old stone stair flight descending LEFT TO RIGHT, with many narrower regular treads running vertically on screen, discrete TOP SURFACES of the steps, small riser edges and subtle directional shading, no deep trenches. A short upper stone landing on the left and lower stone landing on the right at the same y480 traversal band. No raised obstacles anywhere in the y440..520 walkway. Modest stone curb/railing along the back and front of the flight OUTSIDE the walkway. Three-quarter overhead orthographic 2D JRPG viewpoint matching library, restrained soft warm light and crafted pixel clusters, rich but subdued gray brown stone, wall depth and thin molding. Do NOT turn this into a vertical north-south stair, do not rotate the stair texture. Preserve both edge exits and existing walkable floor, no side doors. No text, symbols, characters, monsters, furniture, UI, magic circles, photo grain or harsh dark areas. Output one complete usable 3:2 landscape map, no montage or border.

生成結果の段の傾きに合わせ、実装の入口位置を上段の踊り場に調整し、出口まで連続した歩行経路を確認した。

実ブラウザ検査結果：1060×720、393×851ともPASS（987会話ページ、398問、既存進行を確認）。会話前後のCanvas寸法一致、背景画像のロードと描画、階段の往復を確認した。検査画面は `docs/ch1-dialogue-stairs-check.jpg`。
