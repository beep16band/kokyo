# 画像制作プロンプト集

組み込みimagegenを使用。参照画像は `references/poet-reference-map.json` の既存ポータル素材です。以下を各人物・背景に合わせて指定しました。出力の原寸はmanifestのmastersに記録しています。

## 歌人の共通指定

Identity-preserve. ONE character expression sprite atlas, four equal columns on genuinely transparent alpha. Preserve the reference face, age, hair, costume colours and dignified bearing. Japanese anime painting consistent with the reference. Four figures fully visible head-to-toe, clear margins and no overlaps. Left-to-right: recovered neutral, gentle smile, surprised, hollow memory-lost. Fourth figure has drooping shoulders, eyes and upper face swallowed by deep blue-black shadow, unreadable skin colour and expression, desaturated clothing and subtle ink around sleeves. No glowing eyes, wounds or gore. No scenery, floor, cast shadow, text, UI or borders.

- 額田王：adult Asuka-era woman; long black hair, white flower/gold ornament; teal, cream and coral; Asuka-inspired cross-collar robe, avoiding mature Heian twelve-layer silhouette.
- 小野小町：adult woman; long black hair, rose-brown eyes; red/cream/gold layered Heian robe; small gold/red hair ornament.
- 紀貫之：mature Heian courtier; grey-black hair, thin grey mustache and pointed beard; black eboshi; indigo floral robe and white collar.
- 山上憶良：elderly Nara-era poet; lined face, grey hair, white beard; brown cross-collar robe, simple black cap and tied trousers.
- 丈部稲麻呂：rugged young adult Nara-era border guard; tan face, strong brows, tied black topknot; coarse flax tunic, rope belt, travel wrap and straw sandals. No samurai armour.

帽子・袖の切れが見つかったものは「preserve identity and expressions, shrink each full figure and add transparent padding on EVERY side」と指定して再生成しました。

額田王の記憶喪失単体：SINGLE character, SINGLE full-body sprite on a tall portrait canvas. Entire face swallowed by nearly black midnight-blue shadow; no visible bright skin and no readable eyes. Drooping shoulders, bowed head, desaturated teal-grey robe, ink wisps. Keep all hair, robe hem and feet within canvas. No text or environment. True transparent alpha.

## 主要人物

湊・茜の新規差分：identity-preserve, three equal transparent columns; exact current hairstyle, uniform and age; frightened / sad / determined. All full bodies visible, generous blank margins, no overlap, no environment or text. 湊は紺ブレザー・青ネクタイ・黒系ズボン。茜は長めの茶色のボブ・紺ブレザー・赤いリボン・紺スカート・紺靴下。

ことは：exact face, long dark brown hair, violet eyes, white/pink flower ornament, lilac floral robe with ivory/pink inner layers and gold cord. Dignified adolescent, not sexualized. States: neutral, sad, determined, sealed in deep blue-black shadow; smile, confused, fear. Wide sleeves and robe train must remain wholly inside the transparent canvas. 最初のアトラスに裾の切れがあったため、該当4状態は単体縦長として再制作しました。

真尋：fictional early-teen Heian boy; only slight resemblance to Minato's gentle eyes; straight black nape-length tied hair and parted fringe, grey-violet eyes, muted sage robe, ivory collar, grey hakama. Neutral / sad / slight smile / determined. Full body, no modern uniform or adult crown, no text, true alpha.

## 背景

共通：historical-scene / cinematic Japanese anime background / 16:9 landscape / no people, text or UI / quiet lower quarter for dialogue. Creative visualization, not archaeological reconstruction.

- 教室：既存教室をlighting-weather edit。構図と机・窓・山・カーテンを保持し、夕方の橙桃色の空と長い柔らかな影へ変更。
- 図書室：modern Japanese middle school library at sunset, bookshelves, wooden desks, white curtains, old closed anthology on foreground desk, no readable lettering.
- 回廊：fictional late-Heian covered timber corridor, exactly five distinct doors, distant continuing route, bamboo blinds and moonlit garden, eerie blue-violet night.
- 宮廷：seventh-century Asuka-inspired residence, simple wood pillars, bamboo blinds, reed mats, autumn grasses and moon. Avoid mature-Heian ornate architecture and modern glass.
- 村：eighth-century modest farming village, thatch and timber, earthen paths, fields, sunset, small smoke plume and woven baskets; no modern utilities or samurai buildings.
- 門：eighth-century simple timber departure gate and earthen road, thatched watch hut, travel bundles, distant mountains at sunrise, lonely but hopeful.
- 書庫：Heian family store-room with rolled scrolls, tied manuscripts, low desk, oil lamp and a fictional family-tree-like scroll with abstract marks. No Western leather books, modern objects or readable writing.

## エフェクト

墨：ONE transparent VFX overlay, 16:9, organic sumi wisps and flecks entering from sides, central majority clear, deep blue-black, dry-brush edges, no face, letters, scenery or opaque rectangular backdrop.

回復の光：ONE transparent VFX overlay, sparse pale gold/ivory dust and faint rising wisps, central majority empty, no blinding burst, text or scenery. 実装では不透明度0.22程度を基準とします。
