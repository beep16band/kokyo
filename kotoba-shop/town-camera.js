/* North stays up: a gentle perspective view following the player across the map. */
'use strict';
window.TownMapCamera = {
  create(T) { return new T.PerspectiveCamera(38, 5 / 3, .15, 120); },
  update(rig, map, x, z, dt, width, height, reducedMotion = false, conversation = null) {
    const T = window.THREE;
    const focus = conversation;
    const tx = Math.max(.5, Math.min(map.w - .5, x + .5 + (focus ? (focus.x - x) * .5 : 0)));
    const tz = Math.max(.5, Math.min(map.h - .5, z + .5 - 1.5 + (focus ? (focus.z - z) * .5 + 1.2 : 0)));
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-Math.max(0, Math.min(.25, dt)) * 9);
    if (!rig.target) { rig.target = new T.Vector3(tx, .65, tz); rig.conversationZoom = focus ? .84 : 1; }
    else {
      rig.target.lerp(new T.Vector3(tx, .65, tz), alpha);
    }
    rig.conversationZoom += ((focus ? .84 : 1) - rig.conversationZoom) * alpha;
    const camera = rig.camera;
    const aspect = Math.max(.1, width / Math.max(1, height));
    if (Math.abs(camera.aspect - aspect) > .0001) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
    camera.position.set(rig.target.x, rig.target.y + 6.2 * rig.conversationZoom, rig.target.z + 9.05 * rig.conversationZoom);
    camera.lookAt(rig.target);
    camera.updateMatrixWorld(true);
  }
};
