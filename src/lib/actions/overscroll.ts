/**
 * Svelte action to prevent iOS / mobile browser rubber-band boundary overscroll
 * when an element is at its top/bottom boundaries or has no overflow.
 */
export function preventBoundaryOverscroll(node: HTMLElement) {
  let startX = 0;
  let startY = 0;

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Do not interfere with horizontal gestures (such as edge back swipe)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return;
    }

    const isNonScrollable = node.scrollHeight <= node.clientHeight + 1;
    const isAtTop = node.scrollTop <= 0;
    const isAtBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;

    // If page content completely fits in viewport, block both up and down elastic drags
    if (isNonScrollable) {
      if (e.cancelable) e.preventDefault();
      return;
    }

    // Block downward elastic bounce when already at the top
    if (isAtTop && deltaY > 0) {
      if (e.cancelable) e.preventDefault();
      return;
    }

    // Block upward elastic bounce when already at the bottom
    if (isAtBottom && deltaY < 0) {
      if (e.cancelable) e.preventDefault();
      return;
    }
  }

  node.addEventListener("touchstart", onTouchStart, { passive: true });
  node.addEventListener("touchmove", onTouchMove, { passive: false });

  return {
    destroy() {
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
    }
  };
}
