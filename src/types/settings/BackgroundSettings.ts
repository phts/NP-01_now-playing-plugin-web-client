import { BackgroundOverlay, BackgroundPosition, ImageFit } from './Settings';

export interface BackgroundSettings {
  backgroundType?: 'default' | 'albumart' | 'color' | 'volumioBackground';

  // Background type: color
  backgroundColor?: string;

  // Background type: albumart
  albumartBackgroundFit?: ImageFit;
  albumartBackgroundPosition?: BackgroundPosition;
  albumartBackgroundBlur?: string;
  albumartBackgroundScale?: string;

  // Background type: Volumio background
  volumioBackgroundImage?: string;
  volumioBackgroundFit?: ImageFit;
  volumioBackgroundPosition?: BackgroundPosition;
  volumioBackgroundBlur?: string;
  volumioBackgroundScale?: string;

  // Overlay
  backgroundOverlay?: BackgroundOverlay;
  backgroundOverlayColor?: string;
  backgroundOverlayColorOpacity?: string;
  backgroundOverlayGradient?: string;
  backgroundOverlayGradientOpacity?: string;
}

export const DefaultBackgroundSettings: Required<BackgroundSettings> = {
  backgroundType: 'default',

  // Background type: color
  backgroundColor: '#000000',

  // Background type: albumart
  albumartBackgroundFit: 'cover',
  albumartBackgroundPosition: 'center',
  albumartBackgroundBlur: '',
  albumartBackgroundScale: '',

  // Background type: Volumio background
  volumioBackgroundImage: '',
  volumioBackgroundFit: 'cover',
  volumioBackgroundPosition: 'center',
  volumioBackgroundBlur: '',
  volumioBackgroundScale: '',

  // Overlay
  backgroundOverlay: 'default',
  backgroundOverlayColor: '#000000',
  backgroundOverlayColorOpacity: '',
  backgroundOverlayGradient: '',
  backgroundOverlayGradientOpacity: ''
};
