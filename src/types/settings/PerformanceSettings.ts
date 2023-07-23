export interface PerformanceSettings {
  // Transition effects
  transitionEffectsKiosk?: boolean;
  transitionEffectsOtherDevices?: boolean;

  // Screen unmount
  unmountScreensOnExit?: 'default' | 'custom';
  unmountNowPlayingScreenOnExit?: boolean;
  unmountBrowseScreenOnExit?: boolean;
  unmountQueueScreenOnExit?: boolean;
  unmountVolumioScreenOnExit?: boolean;
}

export const DefaultPerformanceSettings: Required<PerformanceSettings> = {
  // Transition effects
  transitionEffectsKiosk: false,
  transitionEffectsOtherDevices: true,

  // Screen unmount
  unmountScreensOnExit: 'default',
  unmountNowPlayingScreenOnExit: true,
  unmountBrowseScreenOnExit: false,
  unmountQueueScreenOnExit: false,
  unmountVolumioScreenOnExit: true
};
