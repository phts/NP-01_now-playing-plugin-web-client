export function eventPathHasClass(event, className, stopAtEl) {
  const path = event.path || (event.composedPath && event.composedPath());
  if (path) {
    for (const pathEl of path) {
      if (pathEl === stopAtEl) {
        return false;
      }
      if (pathEl.classList && pathEl.classList.contains(className)) {
        return true;
      }
    }
  }
  return false;
}

export function eventPathHasNoSwipe(event, swipeableEl) {
  return eventPathHasClass(event, 'no-swipe', swipeableEl);
}
