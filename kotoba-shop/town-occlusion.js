/* Fade only scenery between the camera and the player. Shared materials stay intact. */
'use strict';
window.TownOcclusion = (() => {
  function init(rig) {
    dispose(rig);
    const T = window.THREE, overlay = new T.Group();
    overlay.name = 'temporary-scenery-transparency';
    rig.world.add(overlay);
    rig.occlusion = { records: [], overlay, hidden: new T.Matrix4().makeScale(0, 0, 0),
      ray: new T.Ray(), hit: new T.Vector3(), origin: new T.Vector3(), player: new T.Vector3(),
      direction: new T.Vector3(), inverse: new T.Matrix4(), matrix: new T.Matrix4() };
  }
  function add(rig, name, kind, sources) {
    const T = window.THREE, o = rig.occlusion;
    if (!o || !sources.length) return;
    rig.world.updateMatrixWorld(true);
    const box = new T.Box3();
    for (const source of sources) {
      const mesh = source.mesh;
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      source.local = new T.Matrix4();
      if (source.index !== undefined) mesh.getMatrixAt(source.index, source.local);
      const matrix = mesh.matrixWorld.clone();
      if (source.index !== undefined) matrix.multiply(source.local);
      box.union(mesh.geometry.boundingBox.clone().applyMatrix4(matrix));
    }
    // Allow for the existing gentle tree sway without rebuilding bounds every frame.
    box.expandByScalar(.06);
    o.records.push({ name, kind, sources, box, alpha: 1, until: -1, proxies: null });
  }
  function group(rig, root, name) {
    const sources = [];
    root.traverse(mesh => { if (mesh.isMesh && !mesh.isInstancedMesh && mesh.visible) sources.push({ mesh }); });
    add(rig, name, 'building', sources);
  }
  function tree(rig, index, trunk, leaves, fruit, fruitIndex) {
    const sources = [{ mesh: trunk, index }];
    for (let j = 0; j < 3; j++) sources.push({ mesh: leaves, index: index * 3 + j });
    if (fruitIndex >= 0) sources.push({ mesh: fruit, index: fruitIndex });
    add(rig, 'tree-' + index, 'tree', sources);
  }
  function restore(source) {
    if (source.index !== undefined) {
      source.mesh.setMatrixAt(source.index, source.local);
      source.mesh.instanceMatrix.needsUpdate = true;
    } else if (source.mask !== undefined) {
      source.mesh.layers.mask = source.mask;
      delete source.mesh.userData.occlusionHidden;
    }
  }
  function update(rig, now, dt, reducedMotion = false) {
    const T = window.THREE, o = rig.occlusion;
    if (!o || !rig.player) return 0;
    rig.camera.getWorldPosition(o.origin);
    rig.player.getWorldPosition(o.player);
    o.inverse.copy(rig.world.matrixWorld).invert();
    const targets = [[0, 1.45], [0, .85], [0, .35], [-.22, .95], [.22, .95]];
    const amount = reducedMotion ? 1 : 1 - Math.exp(-Math.max(0, Math.min(.25, dt)) * 16);
    let active = 0;
    for (const record of o.records) {
      let blocked = false;
      if (record.box.distanceToPoint(o.player) < 14) for (const [x, y] of targets) {
        o.direction.set(o.player.x + x, o.player.y + y, o.player.z).sub(o.origin);
        const distance = o.direction.length();
        o.ray.set(o.origin, o.direction.normalize());
        if (o.ray.intersectBox(record.box, o.hit) && o.hit.distanceTo(o.origin) < distance - .15) { blocked = true; break; }
      }
      if (blocked) record.until = now + 140;
      const target = blocked || now < record.until ? .18 : 1;
      record.alpha += (target - record.alpha) * amount;
      if (record.alpha > .995 && target === 1) {
        record.alpha = 1;
        if (record.proxies) record.proxies.forEach(p => p.visible = false);
        if (record.fading) record.sources.forEach(restore);
        record.fading = false;
        continue;
      }
      active++;
      if (!record.proxies) record.proxies = record.sources.map(source => {
        const material = source.mesh.material.clone();
        material.transparent = true; material.depthWrite = false;
        const proxy = new T.Mesh(source.mesh.geometry, material);
        proxy.name = 'faded-' + record.name;
        proxy.userData.noBatch = true;
        proxy.matrixAutoUpdate = false;
        o.overlay.add(proxy);
        return proxy;
      });
      record.fading = true;
      record.sources.forEach((source, i) => {
        const mesh = source.mesh, proxy = record.proxies[i];
        if (source.index !== undefined) {
          o.matrix.copy(mesh.matrixWorld).multiply(source.local);
          mesh.setMatrixAt(source.index, o.hidden); mesh.instanceMatrix.needsUpdate = true;
        } else {
          if (source.mask === undefined) source.mask = mesh.layers.mask;
          mesh.userData.occlusionHidden = true; mesh.layers.disable(0);
          o.matrix.copy(mesh.matrixWorld);
        }
        proxy.matrix.copy(o.inverse).multiply(o.matrix);
        proxy.material.opacity = (mesh.material.opacity ?? 1) * record.alpha;
        proxy.visible = true;
      });
    }
    const canvas = rig.renderer?.domElement;
    if (canvas) {
      canvas.dataset.occlusionCount = String(active);
      canvas.dataset.occlusionNames = o.records.filter(r => r.fading).map(r => r.name).join(',');
    }
    return active;
  }
  function dispose(rig) {
    const o = rig.occlusion;
    if (!o) return;
    for (const record of o.records) {
      if (record.fading) record.sources.forEach(restore);
      record.proxies?.forEach(p => p.material.dispose());
    }
    o.overlay.removeFromParent();
    rig.occlusion = null;
  }
  return { init, add, group, tree, update, dispose };
})();
