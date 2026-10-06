# 図書室・地下通路の修正（2026-10-06）

- 図書室の背景は480×320、Canvas表示は960×640。家具を2倍の座標で測り直し、机、椅子、辞書台、窓際カウンター、手前の本棚に判定を合わせた。
- 旧判定は上部340px全体と、机より下の長方形を塞いでいた。図書室入口も手前の本棚上に出現していたため、画像左上の扉へ入口・出口を合わせた。
- 主人公が家具の背後へ回った際は、既存背景画像の該当部分を前景として重ねる。
- 地下入口の最初の30秒は既存通り安全。その間に出口へ着いた場合は文字が集まっていることを会話で伝える。安全時間が終わったら出口からも必須戦闘へつなぐ。
- 2枚目の古い地下回廊でも、敵を迂回して出口へ着いた場合は必須戦闘が発生する。撃破後は通常通り中央回廊へ進む。
- 石壁の側面にある通路は各マップ同じ高さで接続し、壁側から画面端へ出られないようにした。
- 元の398問、主人公、NPC、ストーリーは維持。

## 新しい背景素材

画像生成は組み込み image_gen を使用。新規生成した6区画の石床・壁・縁石・入口・階段素材を `assets/kotoba-tower/underground-tiles-v2.webp` に保存。
`scripts/build-underground-v2.py`で切り出し、元の接続座標を保って `ch1-descent-v2.webp` から `ch1-gate-v2.webp` まで10枚を作成。旧素材は残す。Shopと屋外は今回変更しない。

使用した生成プロンプト：

Use case: stylized-concept. Asset type: original tile atlas for a late 16-bit / high quality GBA 2D Japanese RPG, old underground school stone corridor. Generate a landscape 1536x1024 image divided into SIX equal rectangular 512x512 tiles in three columns and two rows, no margins, no borders or labels. Upper left: seamless top-down aged warm gray square stone floor, many small slabs, subtle cracks, uniformly lit, no objects. Upper middle: seamless front-facing masonry wall, small irregular brown gray blocks, diffuse soft lighting, no openings. Upper right: horizontal wall foot molding / narrow stone ledge with a darker wall above and stone floor below. Lower left: a stone doorway portal open left-to-right, front-facing side wall ends with a tall black doorway opening in its center, no actual door. Lower middle: stone stair treads seen from top-down three-quarter RPG perspective, regular horizontal steps, no doors. Lower right: another seamless worn stone floor with fewer cracks and muted moss only at joins. Precisely pixel art, crisp clusters and coherent handcrafted palette, small tile scale matching 32px sprites, muted warm slate gray and brown, quiet mysterious atmosphere with clearly visible surfaces (not near black). No characters, enemies, furniture, symbols, text, letters, numbers, UI, glowing runes, magical circles, vignette, photorealism or perspective vanishing point. These are reusable texture components, NOT a finished map.

## 検証

`node scripts/test-ch1.cjs`：PASS。家具と通路の判定、図書室の入退室、地下の敵迂回からの出口戦闘と次マップへの遷移を追加検査。既存の教室から村までの進行と398問の保持も検査。
ブラウザ検証は `tests/ch1-browser-v027d.html`（通常幅1060×720、スマホ幅393×851）。実機のスマートフォンそのものの検査ではない。

実ブラウザ検査：通常幅・スマホ幅とも PASS。画像のデコードとCanvas描画、上記のイベント進行を確認。検証画像：`docs/ch1-library-underground-check.jpg`。
