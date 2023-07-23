import { DockComponentPlacement, ImageFit, WeatherIconStyle } from './Settings';

export interface NowPlayingScreenSettings {
  // Track info: font sizes
  fontSizes?: 'auto' | 'custom';
  titleFontSize?: string;
  artistFontSize?: string;
  albumFontSize?: string;
  mediaInfoFontSize?: string;
  seekTimeFontSize?: string;
  metadataFontSize?: string;

  // Track info: font colors
  fontColors?: 'default' | 'custom';
  titleFontColor?: string;
  artistFontColor?: string;
  albumFontColor?: string;
  mediaInfoFontColor?: string;
  seekTimeFontColor?: string;
  metadataFontColor?: string;

  // Track info: text margins
  textMargins?: 'auto' | 'custom';
  titleMargin?: string;
  artistMargin?: string;
  albumMargin?: string;
  mediaInfoMargin?: string;

  // Track info: text alignment
  textAlignmentH?: 'left' | 'center' | 'right';
  textAlignmentV?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  textAlignmentLyrics?: 'left' | 'center' | 'right';

  // Track info: max lines
  maxLines?: 'auto' | 'custom';
  maxTitleLines?: string;
  maxArtistLines?: string;
  maxAlbumLines?: string;

  // Track info: order
  trackInfoOrder?: 'default' | 'custom';
  trackInfoTitleOrder?: string;
  trackInfoArtistOrder?: string;
  trackInfoAlbumOrder?: string;
  trackInfoMediaInfoOrder?: string;

  // Track info: marquee title
  trackInfoMarqueeTitle?: boolean;

  // Widgets: colors
  widgetColors?: 'default' | 'custom';
  widgetPrimaryColor?: string;
  widgetHighlightColor?: string;

  // Widgets: visibility
  widgetVisibility?: 'default' | 'custom';
  playbackButtonsVisibility?: boolean;
  seekbarVisibility?: boolean;

  // Widgets: size / margins
  playbackButtonSizeType?: 'auto' | 'custom';
  playbackButtonSize?: string;
  widgetMargins?: 'auto' | 'custom';
  playbackButtonsMargin?: string;
  seekbarMargin?: string;

  // Albumart: visibility
  albumartVisibility?: boolean;

  // Albumart: size
  albumartSize?: 'auto' | 'custom';
  albumartWidth?: string;
  albumartHeight?: string;

  // Albumart: fit
  albumartFit?: ImageFit;

  // Albumart: border
  albumartBorder?: string;
  albumartBorderRadius?: string;

  // Dock component: menu
  dockedMenu?: {
    enabled?: boolean;
  };

  // Dock component: action panel trigger
  dockedActionPanelTrigger?: {
    enabled?: boolean;
    iconSettings?: 'default' | 'custom';
    iconStyle?: 'expand_more' | 'expand_circle_down' | 'arrow_drop_down' | 'arrow_drop_down_circle' |
      'arrow_downward' | 'arrow_circle_down';
    iconSize?: string;
    iconColor?: string;
    opacity?: string;
    margin?: string;
  };

  // Dock component: volume indicator
  dockedVolumeIndicator?: {
    enabled?: boolean;
    fontSettings?: 'default' | 'custom';
    fontSize?: string;
    fontColor?: string;
    iconSettings?: 'default' | 'custom';
    iconSize?: string;
    iconColor?: string;
    volumeBarPosition?: 'anchored' | 'center';
    volumeBarOrientation?: 'horizontal' | 'vertical';
    placement?: DockComponentPlacement;
    displayOrder?: string;
    margin?: string;
    showVolumeBarOnClick?: boolean;
  };

  // Dock component: clock
  dockedClock?: {
    enabled?: boolean;
    placement?: DockComponentPlacement;
    showInfo?: 'dateTime' | 'time' | 'date';
    fontSettings?: 'default' | 'custom';
    fontSize?: string;
    dateColor?: string;
    timeColor?: string;
    dateFormat?: 'default' | 'custom';
    yearFormat?: 'none' | 'numeric' | '2-digit';
    monthFormat?: 'short' | 'numeric' | '2-digit' | 'long';
    dayFormat?: 'numeric' | '2-digit';
    dayOfWeekFormat?: 'none' | 'long' | 'short';
    timeFormat?: 'default' | 'custom';
    hourFormat?: 'numeric' | '2-digit';
    hour24?: boolean;
    showSeconds?: boolean;
    displayOrder?: string;
    margin?: string;
  };

  // Dock component: weather
  dockedWeather?: {
    enabled?: boolean;
    placement?: DockComponentPlacement;
    fontSettings?: 'default' | 'custom';
    fontSize?: string;
    fontColor?: string;
    iconSettings?: 'default' | 'custom';
    iconStyle?: WeatherIconStyle;
    iconSize?: string;
    iconMonoColor?: string;
    iconAnimate?: boolean;
    displayOrder?: string;
    showHumidity?: boolean;
    showWindSpeed?: boolean;
    margin?: string;
  };
}

export const DefaultNowPlayerScreenSettings: Required<NowPlayingScreenSettings> = {
  // Track info: font sizes
  fontSizes: 'auto',
  titleFontSize: '',
  artistFontSize: '',
  albumFontSize: '',
  mediaInfoFontSize: '',
  seekTimeFontSize: '',
  metadataFontSize: '',

  // Track info: font colors
  fontColors: 'default',
  titleFontColor: '#FFFFFF',
  artistFontColor: '#CCCCCC',
  albumFontColor: '#CCCCCC',
  mediaInfoFontColor: '#CCCCCC',
  seekTimeFontColor: '#CCCCCC',
  metadataFontColor: '#CCCCCC',

  // Track info: text margins
  textMargins: 'auto',
  titleMargin: '',
  artistMargin: '',
  albumMargin: '',
  mediaInfoMargin: '',

  // Track info: text alignment
  textAlignmentH: 'left',
  textAlignmentV: 'flex-start',
  textAlignmentLyrics: 'center',

  // Track info: max lines
  maxLines: 'auto',
  maxTitleLines: '',
  maxArtistLines: '',
  maxAlbumLines: '',

  // Track info: order
  trackInfoOrder: 'default',
  trackInfoTitleOrder: '',
  trackInfoArtistOrder: '',
  trackInfoAlbumOrder: '',
  trackInfoMediaInfoOrder: '',

  // Track info: marquee title
  trackInfoMarqueeTitle: false,

  // Widgets: colors
  widgetColors: 'default',
  widgetPrimaryColor: '#CCCCCC',
  widgetHighlightColor: '#24A4F3',

  // Widgets: visibility
  widgetVisibility: 'default',
  playbackButtonsVisibility: true,
  seekbarVisibility: true,

  // Widgets: size / margins
  playbackButtonSizeType: 'auto',
  playbackButtonSize: '',
  widgetMargins: 'auto',
  playbackButtonsMargin: '',
  seekbarMargin: '',

  // Albumart: visibility
  albumartVisibility: true,

  // Albumart: size
  albumartSize: 'auto',
  albumartWidth: '',
  albumartHeight: '',

  // Albumart: fit
  albumartFit: 'cover',

  // ALbumart: border
  albumartBorder: '',
  albumartBorderRadius: '',

  // Dock component: menu
  dockedMenu: {
    enabled: true
  },

  // Dock component: action panel trigger
  dockedActionPanelTrigger: {
    enabled: true,
    iconSettings: 'default',
    iconStyle: 'expand_more',
    iconSize: '',
    iconColor: '#CCCCCC',
    opacity: '',
    margin: ''
  },

  dockedVolumeIndicator: {
    enabled: false,
    fontSettings: 'default',
    fontSize: '',
    fontColor: '#CCCCCC',
    iconSettings: 'default',
    iconSize: '',
    iconColor: '#CCCCCC',
    volumeBarPosition: 'center',
    volumeBarOrientation: 'horizontal',
    placement: 'bottom-right',
    displayOrder: '',
    margin: '',
    showVolumeBarOnClick: false
  },

  // Dock component: clock
  dockedClock: {
    enabled: false,
    placement: 'top-left',
    showInfo: 'dateTime',
    fontSettings: 'default',
    fontSize: '',
    dateColor: '#CCCCCC',
    timeColor: '#CCCCCC',
    dateFormat: 'default',
    yearFormat: 'none',
    monthFormat: 'short',
    dayFormat: 'numeric',
    dayOfWeekFormat: 'none',
    timeFormat: 'default',
    hourFormat: 'numeric',
    hour24: false,
    showSeconds: false,
    displayOrder: '',
    margin: ''
  },

  // Dock component: weather
  dockedWeather: {
    enabled: false,
    placement: 'top-left',
    fontSettings: 'default',
    fontSize: '',
    fontColor: '#CCCCCC',
    iconSettings: 'default',
    iconStyle: 'filled',
    iconSize: '',
    iconMonoColor: '#CCCCCC',
    iconAnimate: false,
    displayOrder: '',
    showHumidity: false,
    showWindSpeed: false,
    margin: ''
  }
};
