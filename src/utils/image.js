export function preloadImage(src, fallbackSrc, callback = {}) {
  let img = document.createElement('img');
  let loadingSrc;

  const onImageLoaded = () => {
    if (callback.ready) {
      callback.ready.call(preloader, loadingSrc);
    }
  };
  const onImageError = (err) => {
    if (loadingSrc !== fallbackSrc) {
      img.src = loadingSrc = fallbackSrc;
    }
    else {
      loadingSrc = null;
      if (callback.error) {
        callback.error.call(preloader, err);
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
    if (img) {
      img.removeEventListener('load', onImageLoaded);
      img.removeEventListener('error', onImageError);
      img.src = '';
      img = null;
    }
  };

  const preloader = {
    setSrc: setSrc.bind(this),
    dispose: dispose.bind(this)
  };

  setSrc(src);

  return preloader;
}
