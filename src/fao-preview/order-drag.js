// Pointer gestures are limited to the handle; the rest of each row retains its
// native drag behavior and arrow controls.
export function attachOrderDrag(list, { isLocked, getIds, onMove }) {
  let gesture = null;

  function rowAt(node) {
    const row = node?.closest?.('[data-order-id]');
    return row && list.contains(row) && getIds().includes(row.dataset.orderId) ? row : null;
  }

  function clear() {
    if (!gesture) return;
    const previous = gesture;
    gesture = null;
    previous.row.classList.remove('is-dragging');
    previous.target?.classList.remove('drop-target');
    try {
      if (list.hasPointerCapture(previous.pointerId)) list.releasePointerCapture(previous.pointerId);
    } catch { /* The browser may already have released a cancelled pointer. */ }
  }

  function down(event) {
    if (gesture || isLocked() || event.button !== 0 || event.isPrimary === false) return;
    const handle = event.target?.closest?.('.order-handle');
    const row = handle && rowAt(handle);
    if (!row) return;
    event.preventDefault();
    try { list.setPointerCapture(event.pointerId); }
    catch { return; }
    gesture = { pointerId: event.pointerId, row, fromId: row.dataset.orderId,
      startX: event.clientX, startY: event.clientY, moved: false, target: null };
  }

  function update(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    if (isLocked() || !list.contains(gesture.row) || !getIds().includes(gesture.fromId)) {
      clear(); return;
    }
    const distance = Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY);
    if (!gesture.moved && distance < 6) return;
    gesture.moved = true;
    event.preventDefault();
    gesture.row.classList.add('is-dragging');
    const candidate = rowAt(list.ownerDocument.elementFromPoint(event.clientX, event.clientY));
    const target = candidate !== gesture.row ? candidate : null;
    if (target !== gesture.target) {
      gesture.target?.classList.remove('drop-target');
      gesture.target = target;
      target?.classList.add('drop-target');
    }
  }

  function up(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    update(event);
    if (!gesture) return;
    const fromId = gesture.fromId, toId = gesture.moved ? gesture.target?.dataset.orderId : null;
    clear();
    if (toId && toId !== fromId && !isLocked()) onMove(fromId, toId);
  }

  function cancel(event) {
    if (gesture && event.pointerId === gesture.pointerId) clear();
  }

  const listeners = { pointerdown: down, pointermove: update, pointerup: up,
    pointercancel: cancel, lostpointercapture: cancel };
  for (const [type, listener] of Object.entries(listeners)) list.addEventListener(type, listener, { passive: false });
  return () => {
    clear();
    for (const [type, listener] of Object.entries(listeners)) list.removeEventListener(type, listener);
  };
}
