export interface Preloader {
  setSrc: (src: string) => void;
  dispose: () => void;
}

export interface PreloadImageCallback {
  ready?: (loadingSrc: string) => void;
  error?: (error: any) => void;
}

export function preloadImage(src: string | null, fallbackSrc?: string, callback: PreloadImageCallback = {}) {
  let img: HTMLImageElement | null = document.createElement('img');
  let loadingSrc: string | null;

  const onImageLoaded = () => {
    if (callback.ready && loadingSrc) {
      callback.ready.call(preloader, loadingSrc);
    }
  };
  const onImageError = (err: any) => {
    if (fallbackSrc && loadingSrc !== fallbackSrc && img) {
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

  const setSrc = (src: string | null) => {
    loadingSrc = src;
    if (img && src) {
      img.src = src;
    }
  };

  const dispose = () => {
    if (img) {
      img.removeEventListener('load', onImageLoaded);
      img.removeEventListener('error', onImageError);
      img.src = '';
      img = null;
    }
  };

  const preloader: Preloader = {
    setSrc,
    dispose
  };

  setSrc(src);

  return preloader;
}
