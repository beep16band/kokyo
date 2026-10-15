# 素材選定記録

確認日：2026年10月16日。配布元の一次情報と、採用したZIP内のライセンスを確認しました。

| 候補 | ゲーム利用・改変 | GitHubでの素材公開・再配布 | クレジット | 規格・画風の評価 | 判断 |
| --- | --- | --- | --- | --- | --- |
| Kenney Tiny Town 1.1 | CC0、利用・改変可 | CC0で公開・再配布可 | 義務なし。本作では表記 | 16px。太い輪郭、明るい草地、暖色の住宅。町・森・遺跡の組み立てに使用できる | 採用：packed tilesheetをローカル配信 |
| ぴぽやの無料素材 | 無料素材は利用・改変可。個別条件優先 | 無償の再配布は規約同梱等の条件あり。改変素材は提供元の明記等が必要。有料素材の条件とは別 | 通常利用の表記義務はなし。再配布等では条件を確認 | 丁寧なRPG素材だが、今回は16px基準の地形と動物住民を一貫して作る方針にした | 不採用：画像は同梱しない |
| OpenGameArt「LPC Revised Base Object Kit」 | CC-BY-SA 3.0等、当該配布物の条件に従って利用・改変 | 著作者表示・継承等の条件を満たした配布が必要 | 複数作者とサブフォルダ別クレジットの確認が必要 | 32px、128色パレット。今回の16px地形との混在を避けた | 不採用：条件違反という判断ではなく、規格と管理の統一を優先 |
| itch.io「Tiny Creatures」by clintbellanger | CC0、利用・改変可 | CC0で公開・再配布可 | 義務なし、表記は歓迎 | Tiny Townと整合するが、静止スプライトが中心。立って暮らす住民の4方向歩行を一式でそろえる用途とは異なる | 不採用：住民は同じ規格でオリジナル制作 |

## 一次情報

- Kenney Tiny Town: https://kenney.nl/assets/tiny-town
- Kenney公式の利用・表記FAQ: https://kenney.nl/support
- CC0の説明: https://creativecommons.org/publicdomain/zero/1.0/
- ぴぽや無料・有料素材の規約: https://pipoya.net/sozai/terms-of-use/
- LPC Revised Base Object Kit: https://opengameart.org/content/lpc-revised-base-object-kit
- Tiny Creatures: https://clintbellanger.itch.io/tiny-creatures

## 導入方針

採用した地形を基準に、住民・水辺・石碑・家具の不足部分を新規制作しました。全員を4方向×3コマとし、待機中は足を動かさず、歩行中だけコマを進めます。地形と衝突判定は同じマップデータを参照します。素材は相対パスで読み込み、ゲーム中に配布元へアクセスしません。
