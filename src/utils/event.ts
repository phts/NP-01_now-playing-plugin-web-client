export function eventPathHasClass(event: Event, className: string, stopAtEl: Element) {
  const path = event.composedPath();
  if (path) {
    for (const pathET of path) {
      if (pathET === stopAtEl) {
        return false;
      }
      const pathEl = pathET as Element;
      if (pathEl.classList && pathEl.classList.contains(className)) {
        return true;
      }
    }
  }
  return false;
}

export function eventPathHasNoSwipe(event: Event, swipeableEl: Element) {
  return eventPathHasClass(event, 'no-swipe', swipeableEl);
}
