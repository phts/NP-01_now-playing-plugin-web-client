import { BackgroundOverlay, BackgroundPosition, ImageFit, WeatherIconStyle } from './Settings';

export interface IdleScreenSettings {
  enabled?: 'all' | 'disabled' | 'kiosk';
  waitTime?: number;
  showLocation?: boolean;
  showWeather?: boolean;
  mainAlignment?: 'flex-start' | 'center' | 'flex-end' | 'cycle';
  mainAlignmentCycleInterval?: number;

  // Time format
  timeFormat?: 'default' | 'custom';
  hour24?: boolean;
  showSeconds?: boolean;

  // Font sizes
  fontSizes?: 'auto' | 'custom';
  timeFontSize?: string;
  dateFontSize?: string;
  locationFontSize?: string;
  weatherCurrentBaseFontSize?: string;
  weatherForecastBaseFontSize?: string;

  // Font colors
  fontColors?: 'default' | 'custom';
  timeColor?: string;
  dateColor?: string;
  locationColor?: string;
  weatherCurrentColor?: string;
  weatherForecastColor?: string;

  // Icons
  weatherIconSettings?: 'default' | 'custom';
  weatherIconStyle?: WeatherIconStyle;
  weatherCurrentIconSize?: string;
  weatherForecastIconSize?: string
  weatherCurrentIconMonoColor?: string;
  weatherForecastIconMonoColor?: string;
  weatherCurrentIconAnimate?: boolean;

  // Background
  backgroundType?: 'unsplash' | 'color' | 'volumioBackground';

  // Background type: color
  backgroundColor?: string;

  // Background type: Volumio background
  volumioBackgroundImage?: string;
  volumioBackgroundFit?: ImageFit;
  volumioBackgroundPosition?: BackgroundPosition;
  volumioBackgroundBlur?: string;
  volumioBackgroundScale?: string;

  // Background type: Unsplash
  unsplashKeywords?: string;
  unsplashKeywordsAppendDayPeriod?: boolean;
  unsplashMatchScreenSize?: boolean;
  unsplashRefreshInterval?: number;
  unsplashBackgroundBlur?: string;

  // Background overlay
  backgroundOverlay?: BackgroundOverlay;
  backgroundOverlayColor?: string;
  backgroundOverlayColorOpacity?: string;
  backgroundOverlayGradient?: string;
  backgroundOverlayGradientOpacity?: string;

  // Weather background
  weatherBackground?: BackgroundOverlay;
  weatherBackgroundColor?: string;
  weatherBackgroundColorOpacity?: string;
  weatherBackgroundGradient?: string;
  weatherBackgroundGradientOpacity?: string;
}

export const DefaultIdleScreenSettings: Required<IdleScreenSettings> = {
  enabled: 'kiosk',
  waitTime: 30,
  showLocation: true,
  showWeather: true,
  mainAlignment: 'flex-start',
  mainAlignmentCycleInterval: 60,

  // Time format
  timeFormat: 'default',
  hour24: false,
  showSeconds: false,

  // Font sizes
  fontSizes: 'auto',
  timeFontSize: '',
  dateFontSize: '',
  locationFontSize: '',
  weatherCurrentBaseFontSize: '',
  weatherForecastBaseFontSize: '',

  // Font colors
  fontColors: 'default',
  timeColor: '#FFFFFF',
  dateColor: '#FFFFFF',
  locationColor: '#FFFFFF',
  weatherCurrentColor: '#FFFFFF',
  weatherForecastColor: '#FFFFFF',

  // Icons
  weatherIconSettings: 'default',
  weatherIconStyle: 'filled',
  weatherCurrentIconSize: '',
  weatherForecastIconSize: '',
  weatherCurrentIconMonoColor: '#FFFFFF',
  weatherForecastIconMonoColor: '#FFFFFF',
  weatherCurrentIconAnimate: false,

  // Background
  backgroundType: 'unsplash',

  // Background type: color
  backgroundColor: '#000000',

  // Background type: Volumio background
  volumioBackgroundImage: '#000000',
  volumioBackgroundFit: 'cover',
  volumioBackgroundPosition: 'center',
  volumioBackgroundBlur: '',
  volumioBackgroundScale: '',

  // Background type: Unsplash
  unsplashKeywords: '',
  unsplashKeywordsAppendDayPeriod: false,
  unsplashMatchScreenSize: true,
  unsplashRefreshInterval: 10,
  unsplashBackgroundBlur: '',

  // Background overlay
  backgroundOverlay: 'default',
  backgroundOverlayColor: '#000000',
  backgroundOverlayColorOpacity: '',
  backgroundOverlayGradient: '',
  backgroundOverlayGradientOpacity: '',

  // Weather background
  weatherBackground: 'default',
  weatherBackgroundColor: '#000000',
  weatherBackgroundColorOpacity: '',
  weatherBackgroundGradient: '',
  weatherBackgroundGradientOpacity: ''
};
