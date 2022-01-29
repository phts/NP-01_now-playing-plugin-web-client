export function preloadImage(src, fallbackSrc, callback = {}) {
  const img = document.createElement('img');
  let loadingSrc;

  const onImageLoaded = () => {
    if (callback.ready) {
      callback.ready(loadingSrc);
    }
  };
  const onImageError = (err) => {
    if (loadingSrc !== fallbackSrc) {
      img.src = loadingSrc = fallbackSrc;
    }
    else {
      loadingSrc = null;
      if (callback.error) {
        callback.error(err);
      }
    }
  };
  img.addEventListener('load', onImageLoaded);
  img.addEventListener('error', onImageError);
  
  const setSrc = (value) => {
    loadingSrc = value;
    img.src = value;
  };

  const dispose = () => {
    img.removeEventListener('load', onImageLoaded);
    img.removeEventListener('error', onImageError);
  }

  setSrc(src);
 
  return {
    setSrc: setSrc.bind(this),
    dispose: dispose.bind(this)
  };
}