# Active drawn character artwork

These transparent PNG atlases replace the earlier geometric runtime portraits in both lightweight 2D and 3D billboard renderers. Character appearance follows the supplied ChatGPT reference sheets. The three individual teacher sheets override the older village overview where they differ.

Each character has a 512×512 atlas: four directions (down, left, right, up), four walking phases per direction, 128×128 cells. The feet align at cell y=120, with room around the whole hat/hair/body. Low-alpha background residue is removed during technical packing; no labels or checkerboard are included. Source images were regenerated using the built-in image-generation editor, then packed by `tools/pack_character_atlases.cjs`.

`town-atlases.js` loads these actual files. It supplies the same cached drawing to the canvas renderer and 3D billboard textures, and shares the packed hand anchors with the rod, net and watering can. The offline builder embeds all atlas bytes.

Animation scope is explicit: 16 authored walking drawings per character, not 128 independent authored action drawings. Idle holds a neutral frame; dash uses the walking cycle at the existing dash speed. Front/rear phase three reflects only the lower-leg portion of phase one at runtime to guarantee the opposite leading foot while keeping the upper body and satchel unchanged. Fishing/net/watering retain the character artwork and attach the existing tools at the corresponding hand; joy/surprise add reaction feedback. Separate bespoke fishing/watering body drawings remain a possible later art expansion.

`manifest.json` records the source crop bounds, normalized bounds and hand anchors. Earlier generated geometric atlases in the parent directory are retained for history and fallback compatibility; they are not the active artwork once these files load.

Reference identities and production prompt set: [PROMPTS.md](PROMPTS.md).
