export function eventPathHasNoSwipe(event, swipeableEl) {
  const path = event.path || (event.composedPath && event.composedPath());
  if (path) {
    for (const pathEl of path) {
      if (pathEl === swipeableEl) {
        return false;
      }
      if (pathEl.classList && pathEl.classList.contains('no-swipe')) {
        return true;
      }
    }
  }
  return false;
}