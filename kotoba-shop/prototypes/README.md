## v21 — 胴体と衣服の再構築（2026-10-24）
- ひよりの上着を胸・背中・お腹・腰で前後の厚みが変わる滑らかな断面から再構築。上着全体の奥行き拡大を除去し、お腹が胸より前へ張り出さない形にした。裾はわずかに広げ、折り返しの厚みを追加。
- 肩幅を狭めて腕の付け根を内側・上へ調整。袖山が胴体に入り込む湾曲した袖、穴のある袖口、接続した手首を実装。
- 襟の葉を胸の曲面に沿わせ、リボン・前立ても新しい服の表面に合わせて配置。
- スカートは腰から裾へ滑らかに広がる断面に変更。プリーツは腰では弱く、裾で少し深くし、波打ちを抑えた厚みのある裾を追加。
- v20 の頭部・短い脚・2頭身・色と衣装の種類を維持。凍結 v20 と同一縮尺・画角で比較可能。専用URL `hiyori-preview-v21.html`。
- JavaScript構文確認、実Three/CPU自動検証21/21成功（衣装切替・歩行・ダッシュ時の肩／袖／手首、裾、頭部と脚の維持を含む）。ブラウザで正面・左右側面・背面・45度、前後比較、歩行中の描画エラーなしを確認。
- 実機スマートフォン・Chromebook・GPU性能は未検証。環境のWebGLが利用できないため、同じ立体モデルをCPU互換3Dで確認。

## v20 — 胴体・脚の短縮と頭部の奥行き調整（2026-10-24）
- ひよりの胴体を16%、脚を20%短縮。上半身は専用グループで圧縮し、首・肩・衣装の接続を維持。頭部は顎を基準に下げ、顔の縦横サイズは維持。
- 頭部の奥行き倍率を1.16から1.04へ変更（約10%減）。前髪と顔の密着、瞳・眉・口は v19 を維持。
- 足裏の基準高さ0.020と足元の影を維持。v19 の実モデルと同一カメラ・縮尺で比較可能。
- ブラウザで正面・左右側面・背面・45度と v19 比較を確認。短縮後の交互歩行・描画エラーなしを確認（CPU互換3D）。
- 自動検証18/18 `qa/hiyori-quality-v20.json`。実機スマートフォン・Chromebook性能は未確認。

## v19 — 額に沿う前髪と優しい表情（2026-10-24）
- 頭部・身体の大きさは v18 を維持。ひよりの前髪7束を顔面曲率へ投影し、毛先の浮きと側面の張り出しを削減。後頭部・背景・ゲーム機能は変更しない。
- ひより専用の丸い目蓋、暖色の虹彩、広い瞳孔、柔らかい眉・口線。ほかのキャラクターの顔は維持。
- v18 の実モデルを凍結し、同じカメラで v19 と比較可能。専用URL `hiyori-preview-v19.html`。
- ブラウザで正面・左右・背面・45度と v18/v19 側面比較を確認。歩行中のモデル描画・交互の脚とエラーなしを確認（CPU互換3D）。
- 自動検証18/18は `qa/hiyori-quality-v19.json`。実機のスマートフォン・Chromebook性能は未検証。

# Visible comparison and world lighting / revision 18

The previous changes were too subtle when viewed separately. A frozen real v17 rig is now rendered beside v18 with the same camera, world scale, outfit and pose; front/right/45-degree/back controls redraw both views. This is a comparison of genuine 3D geometry, not edited images. A new `hiyori-preview-v18.html` URL avoids reopening an old cached HTML tab.

Hiyori head width reduced 18% and height 16% relative to v17; depth retained, so the head is smaller and rounder rather than flattened. Lowered head maintains neck contact. Body and short leg geometry are unchanged.

Found an additional cause of flat appearance: previously baked light rotated with the character. Hiyori now recomputes smooth vertex lighting from a fixed world direction, with separate warm skin fill and retained contact occlusion, identically usable in GPU and CPU renderers. Other characters retain their prior shading. Five-direction previews also update the world lighting for every angle.

Regression checks cover smaller head/unchanged legs, rotation-dependent lighting, no cumulative darkening, face-map attachment, input and existing learning/save/background code. Physical smartphone/Chromebook/GPU speed remains unverified. New badge/cache: `18 · BEFORE / AFTER` / `18-visible-compare`.

Previous release notes follow.

# Balanced head and side volume / revision 17

User correction: head too large; head and torso appear flat from the side.

Hiyori head width/height reduced about 11–12%. Rear cranial and bob depth increased and front/back scale adjusted to give a rounded side silhouette. The head is lowered slightly so the smaller head still meets the neck. Torso depth increased 25%, with a thicker neck and slightly deeper arms. Short legs, narrow shoulders, outfit palette and all lower-body geometry/ground contact are unchanged.

Regression comparison against published revision 16 verifies smaller head width/height, increased cranial/torso depth and identical leg vertices/world transforms. The general model-height check now allows 1.9–2.8 rather than 2.0–2.8 because the head is intentionally smaller. Face-map attachment, walking, shadows, save/background checks remain enabled. Physical-device/GPU speed is unverified.

Cache/badge: `17-volume` / `17 · BALANCED VOLUME`.

Previous release notes follow.

# Rounded body and contact shading / revision 16

Hiyori refinement only: rounded jacket and sleeve cross-sections replace the coarse loft rings. Narrow shoulders and short legs retain their positions/length. The jacket has a softly rounded abdomen and the seam/ribbon follow its depth instead of hovering ahead of the chest. Subtle vertex occlusion under the chin and armpits preserves the existing palette.

Two lightweight flat foot-contact shadows follow the animated sole probes and fade as feet lift. They stay on the ground plane during walking/dashing and work with all three outfits, without adding textures, sprites or GPU shadow maps. The existing overall shadow remains.

Validation: syntax checks; existing model/render/input/save/background regressions plus a sole-shadow test for tracking, flatness and lift fading in every outfit. Five-view browser comparison inspected with the CPU renderer. Physical smartphone/Chromebook/GPU performance remains unverified. Main game, learning and save logic are unchanged.

Viewer pedestal top is now at y=0, aligned with the ground shadows (previous top was -0.06). Version/cache: `16-soft-body-2` / `16 · SOFT BODY`.

Previous release notes follow.

# Hiyori cranial and bob reconstruction / revision 15

- Hiyori only: rebuilt rounded cranial mesh with shallower rear cranium and continuous cheek/jaw; facial maps now conform within 0.014 world units of the face (raycast regression check). Rounded skull surface also positions nose, mouth and brows.
- New continuous scalp-hugging bob shell, reduced rear depth, inward tucked hem, finer rounded solid forelocks; removed the old raised rear hair plates. Dedicated named hair group retains future replacement structure.
- Hiyori torso has 16% more front/back depth. Rounded shoe upper, flat sole and instep strap preserve the short legs, ground plane, outfit and palette. Shared character vertex lighting has stronger soft shading; existing backgrounds and game logic unchanged.
- Viewer: 45-degree control, one-click five-direction comparison using the same 3D scene, optional 390px iframe QA page `hiyori-phone.html`.
- 15/15 automated checks passed. JS syntax checks passed. Cloud Chrome visually checked front/left/right/back/45-degree comparison and 390px layout. No model errors; real CPU 3D renderer used because GPU WebGL is unavailable. Physical phone/Chromebook/GPU performance is unverified.

Changed source: `hero-models.js`, viewer HTML/CSS/JS, entry/cache integration and 3D portrait atlases. Save/learning/background builders remain unchanged. Public release badge: `15 · HIYORI SCULPT`.

Previous release notes follow.

# Short legs and full lower cheeks / revision 14

User correction: shorten the legs and make the lower cheeks fuller.

- Hip-to-sole height reduced from 0.618 to 0.506 model units (about 18%). Upper leg joint distance 0.31 → 0.24; lower leg/ankle offsets shortened too. Shoe shape/size preserved. Hip and upper body lowered by 0.112, preserving the original ground plane instead of floating above it.
- Torso garment dimensions, narrow shoulders and head width remain the same. All clothing variants use the shorter legs. The silhouette is now about 1.8 anatomical heads per the requested shorter body; the silhouette test accepts 1.75–2.10 instead of 1.88–2.10, and full-height bounds accept 2.0–2.8 instead of 2.2–2.8.
- Lower cheeks gain continuous width/depth around the lower half of the face; the upper face remains narrow. Facial texture patches use the same cheek surface equations, with no separate cheek balls.
- All four 3D UI portrait atlases regenerated. Cache/version `14-soft-cheeks` / `14 · SOFT CHEEKS`.

Validation: 14/14 checks passed, including comparison against published revision 13 for shorter legs, equal sole height in every outfit, increased lower-cheek volume and unchanged overall face width/height. Cloud Chrome local front and side dash inspected: opposite leg swing and bending knees, no model errors. CPU compatibility 3D only; physical smartphone/Chromebook/GPU 30 FPS unverified.

Previous release notes follow.

# Round face / revision 13

User correction: narrow the broad face, give it fuller cheeks, do not lengthen the legs.

- Head/hair horizontal scale 0.88, depth 1.08, height unchanged. Eye maps, eyebrows, ears and hats follow the same 3D head transform.
- Reduced lower-jaw taper from 0.20 to 0.11 for a softer, rounder cheek-to-chin transition. The same surface function positions facial decals, avoiding disconnected painted features.
- All body, arm, leg and clothing geometry/transforms remain exactly identical to published revision 12. No leg length or waist/sole changes.
- UI portrait atlases regenerated from the updated 3D rigs; entry and viewer caches use `13-round-face` / `13 · ROUND FACE`.

Validation: existing 13 checks plus a direct geometry comparison against published revision 12. The new check verifies a narrower/deeper face with unchanged height and byte-identical non-head mesh vertices/world transforms for all four characters, including legs and all outfits. Cloud Chrome front and side inspected; actual CPU 3D fallback. GPU/physical phone/Chromebook performance remains unverified.

Previous release notes follow.

# Petite SD / revision 12

User correction: shorten the torso and soften the broad square shoulders.

- Upper garment height reduced from 0.63 to 0.47 model units (25.4%); head/neck lowered by 0.08 and waist raised by 0.08. Face and hair geometry are unchanged. This intentionally gives approximately 1.9 anatomical heads, within the requested roughly two-head silhouette. The proportion check now accepts 1.88–2.10 heads instead of 1.95–2.10.
- Arm pivots moved inward from ±0.279 to ±0.225, raised sleeve corners replaced with a rounded tapered shoulder cap, upper shirt rings narrowed, sleeves and hands shortened to match. Arm animation uses the same narrower resting angle.
- Skirt/shorts waist and hip adjusted together. Knee world height and soles remain unchanged, preserving ground contact. All three clothing variants use the new proportions; portrait atlases regenerated for all four heroes.
- Cache keys are `12-petite`; viewer header `12 · PETITE SD`.

Validation: 13/13 existing geometry/render/input/integration checks pass. Local Cloud Chrome: Hiyori front and side walk visible with opposite leg rotations and no model errors. GPU/physical smartphone/Chromebook performance remains unverified (browser uses actual CPU 3D compatibility renderer).

Previous release notes follow.

# Garden SD / revision 11

New sculpted protagonist geometry created from scratch following the latest garden SD reference. No character assets were imported or copied. Previous generators are retained only in git history; the public API, names and save IDs are stable.

## Changes

- `hero-models.js`: new continuous cheek/jaw face, almond eyes with painted white reflections, small dimensional nose, curved solid forelocks and continuous hair cap, tiny articulated body, layered collar, cuffs and pleated hems. Rounded sections taper into pointed hair tips; front, side and rear are actual geometry.
- Four original palettes/silhouettes: Hiyori rose bob, Sora navy short hair, Tsuki sage long hair, Haruto honey swept hair. No default hats/backpacks. Optional clothes/hats and expressions retained.
- Smooth baked vertex lighting works with both renderer paths. No 2D character fallback. Existing background builders, learning, saves, economy and controls were not changed.
- New UI portrait atlases rendered from the same rigs. Main entry, viewer and portrait cache keys updated to `11-garden`.

## Verification

`node kotoba-shop/tools/render_sd_portraits.cjs`
`node kotoba-shop/tools/hiyori_quality.cjs`

13/13 automated checks passed: genuine CPU 3D startup, four characters and wardrobe states, four rotations, alternating legs/bending knees, dash/diagonals, stick release, curved face maps, vertex shading, geometry instancing, unchanged game/background code, two-head proportions/connected neck, UI atlases, local dependencies.

Cloud Chrome local QA: all four models visible, Hiyori front/side/rear inspected, Haruto walk shows opposite leg rotations and bending knee; no model errors. Existing main save loaded with Sora, background and protagonist visible. The environment has no WebGL context, so this verifies the real CPU 3D fallback only. Physical smartphones, Chromebook GPU behavior and 30 FPS remain unverified; no device performance claim.

Earlier release notes follow for history only.

# 3Dキャラクター改修 — 現行v10（2026-10-24）


## 現行方針：旧造形をリセットしたSDモデル v10

新しい添付参考画像を美術的な方向として、主人公4人のモデル生成コードを全面的に書き直した。既存作品のキャラクター・モデル・制服・テクスチャを取り込まず、独自の髪型と配色を制作。旧デザインの造形や服・バッグを新モデルへ流用していない。名前と保存用IDはゲームの継続性のため維持している。

丸く大きな頭と小さな体、面でまとまる立体の髪、控えめな上まつげと白い瞳の反射、短い腕・脚と小さな靴、簡潔な襟とリボンを採用。標準は帽子・リュックなし。カジュアルとアウトドア、帽子、表情、まばたきは独立した階層で変更する。歩行・ダッシュ・方向転換と膝の屈伸を維持している。

`hero-models.js`が新規モデル、`software-3d.js`に頂点色の互換描画を追加。陰影を少数の柔らかな階調で3D形状へ焼き込み、GPUとCPUで同じ色を使う。背景の既存材質にはこの処理を適用しない。

`render_sd_portraits.cjs`で実際の新3Dモデルから透過PNGの4ポーズを生成し、タイトルの旧キャラ画像も置換した。これはタイトルUI用であり、屋外・室内のキャラクターはライブの3Dメッシュ。

コード側13項目合格。ローカルChromeで正面・側面・背面、歩行、新タイトル画像、既存セーブから室内表示を確認。GPUおよびスマートフォン・Chromebook実機は引き続き未検証。以下のv8/v9の記録は履歴であり、現行の造形ではない。

対象：`feature/hiyori-face-prototype-20261024` / PR #1。

## 閲覧不能の調査

公開URLをChromeで開き、HTMLと同梱Three.jsが配信されていることを確認した。404やCDN切れではない。確認用ブラウザではWebGLのコンテキスト生成が失敗し、元のビューアは描画エラーを表示して停止した。GL_VENDOR/GL_RENDERERはDisabled。利用者自身の端末ログは未取得のため、利用端末でも同一原因とは断定しない。

WebGL失敗時にはCPUによる3D投影・三角形描画・深度バッファ・UV補間へ切り替える。2Dキャラ画像へは切り替えない。背景のインスタンス、カメラの表示レイヤー、釣り糸の線も処理する。解像度は最大540×400。照明・アンチエイリアスの見え方はGPU版と異なる。WebGLのコンテキスト喪失・シェーダーエラーでも互換3Dへ移行する。ライブラリは同一リポジトリ内で配信し、CDNに依存しない。

## 工程とファイル

|工程|変更ファイル|実装・確認|残る点|
|---|---|---|---|
|閲覧不能対策|hiyori-preview.html / .css / hiyori-viewer.js / software-3d.js|起動状況とエラー表示、自動互換3D、ブラウザで初回描画確認|利用端末の元エラーは未取得|
|ひよりの造形|hero-models.js / hiyori-lowpoly.js|丸い顔、曲面上の瞳と白い反射、立体の前髪・後ろ髪、後頭部の隙間修正、連続したジャケット面。正面・側面・背面を目視|かわいさの最終評価は利用者による|
|歩行・操作|hero-models.js / hiyori-viewer.js|独立した脚・膝・腕、左右交互の歩行、走行、なめらかな方向転換、タップ・キー・アナログスティック|実機の入力感と速度は未確認|
|着せ替え|hero-models.js|服・帽子・表情を分離。試作で3服装・4帽子・3表情、本編では所有済みの島の服の色に連動|髪型を選ぶUI、服ごとの専用裁断は今後|
|4人|hero-models.js|ひより・そら・つき・はるとの個別の髪・服・バッグ・靴。4人を実ブラウザ表示|GPU描画の確認は未実施|
|本編接続|index.html / scene3d.js / town-heroes.js|設定→主人公を選ぶ。既存boy/girl IDを維持しavatar.heroを追加保存。島民は既存種族を立体化し、先生の眼鏡・筋肉・笑顔・上品な装飾を保持。屋外・テント内で表示、エリア移動、再読込を確認|全施設・全ミニゲームの総当たりは未実施|
|互換性|hiyori-preview.css / software-3d.js|縦画面用の配置、44px以上の操作ボタン、pointer captureと中断時解除|スマートフォン・Chromebook実機と30FPSは未検証|

## 維持したもの

背景の建物・地形・道・木を生成するコードを変更していない。core/world/movement、国語学習、島生活・購入・ダイビング・図鑑・博物館、室内・家具・既存セーブ処理は変更していない。検証コードで元のmain（88946c8）の該当ファイルとバイト一致を確認する。主人公を選び直しても財布・持ち物・島の進行はリセットしない。

本編の旧force2D自動選択を廃止し、WebGLか互換3Dを使用する。タイトルやUIの2Dイラストはゲーム内の代替キャラクターではなく従来の表示のまま。衣服の購入条件・価格・セーブキーは変更していない。

## 検証

`node kotoba-shop/tools/hiyori_quality.cjs`：実Three.js形状とNative Canvasを用いた10項目。DOM/inputはシミュレーションであり、実機の性能試験ではない。実ブラウザ観測は`../qa/hiyori-browser-v8.json`。試作はセーブへアクセスしない。

GPU、実機性能、全ゲーム回帰確認を完了扱いにはしない。互換3Dの確認済み公開版として提供する。

## 2頭身への変更 v9

4人共通で頭の幅と奥行きを12%、高さを8%拡大。胴の高さを84%、脚・腕を80%へ短縮し、肩・股関節の位置も合わせて調整した。瞳・髪・帽子は頭の階層を維持し、服装は胴と四肢の階層を維持するため、着せ替えや歩行でも同じ比率を保つ。背景・移動判定・セーブ・購入処理は変更していない。

実際の顔の立体境界と足底から、帽子・飛び出した髪を除く全身／頭の比を測定し、4人とも約2頭身（1.95〜2.10の範囲）であることを検証。11項目合格。確認用ブラウザでもv9の正面・側面・歩行を確認した。GPU・スマートフォン・Chromebook実機の確認は引き続き未実施。
