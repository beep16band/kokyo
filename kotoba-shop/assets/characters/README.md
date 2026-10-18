# Active artwork

The game now loads the supplied-reference drawn PNG atlases through `town-atlases.js` in both lightweight 2D and 3D. See [drawn/README.md](drawn/README.md) for the active layout, animation scope, packing and hand anchors.

# Earlier geometric atlases (retained as fallback/history)

13 original transparent PNG atlases for 『ことばのまちと小さなお店』.
The source of truth is `town-characters.js`; no external character artwork is used.

- Each PNG is 1024×640 pixels. Each cell is 64×80 pixels.
- Rows, top to bottom: idle, walk, dash, fish, net, tool, joy, surprise.
- Columns: down (4 frames), left (4), right (4), up (4).
- The field renderer adds rods, fishing lines and nets over the body poses.
- `manifest.json` maps stable character IDs to names, filenames and layout.
- Runtime artwork is generated from the same drawing function and cached locally;
  it does not download these optional PNG atlases. The offline version includes the source.

Boy/girl clothing and the three teachers follow the confirmed project specification.
The eight residents' additional hairstyles and accessories are original implementation
designs based on their existing game roles, not previously approved character sheets.

To reproduce the atlases, run:

```sh
EXPORT_TOWN_CHARACTERS=1 node tools/sprite_motion_quality.cjs
```

Playwright and Chromium are required for the export/check command, not for playing.
Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when Chromium is installed separately.

2026-10-19 revision: direction-aware tool hands and side-view foot stride.
Character identity, palette, sheet dimensions and frame layout are preserved.
The 3D sprite renderer and lightweight 2D field tool overlay share hand
coordinates with the artwork. The fishing line starts at the direction-aware rod tip.
