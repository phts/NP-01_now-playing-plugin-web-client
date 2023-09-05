/// <reference types="../../declaration.d.ts" />

import React, { useEffect, useState } from 'react';
import styles from './VUMeterView.module.scss';
import { CommonSettingsCategory, CommonSettingsOf, NowPlayingScreenSettings } from 'now-playing-common';
import VUMeterPanel, { VUMeterPanelMeterProps, VUMeterPanelProps } from '../../common/vumeter/VUMeterPanel';
import { useSettings } from '../../contexts/SettingsProvider';
import { useAppContext } from '../../contexts/AppContextProvider';

export type VUMeterViewProps = CommonSettingsOf<NowPlayingScreenSettings>['vuMeter'];

function VUMeterView(props: VUMeterViewProps) {
  const { isKiosk } = useAppContext();
  const { settings: performanceSettings } = useSettings(CommonSettingsCategory.Performance);
  const [ meterPanelSize, setMeterPanelSize ] = useState({width: window.innerWidth, height: window.innerHeight});

  useEffect(() => {
    const refreshMeterPanel = () => {
      setMeterPanelSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', refreshMeterPanel);

    return () => {
      window.removeEventListener('resize', refreshMeterPanel);
    };
  }, []);

  let vuMeterPanelConfig: VUMeterPanelProps['config'];
  if (props.templateType === 'fixed') {
    let meterConfig: VUMeterPanelMeterProps;
    if (props.meterType === 'random') {
      meterConfig = {
        meterType: 'random',
        randomRefreshInterval: props.randomRefreshInterval,
        randomRefreshOnTrackChange: props.randomRefreshOnTrackChange
      };
    }
    else {
      meterConfig = {
        meterType: 'fixed',
        meter: props.meter
      };
    }
    vuMeterPanelConfig = {
      templateType: 'fixed',
      template: props.template,
      ...meterConfig
    };
  }
  else {
    vuMeterPanelConfig = {
      templateType: 'random',
      randomRefreshInterval: props.randomRefreshInterval,
      randomRefreshOnTrackChange: props.randomRefreshOnTrackChange
    };
  }

  let vuMeterImpl: 'pixi' | 'css';
  const renderingSettings = isKiosk ?
    performanceSettings.vuMeterRenderingKiosk :
    performanceSettings.vuMeterRenderingOtherDevices;
  switch (renderingSettings) {
    case 'webgl':
      vuMeterImpl = 'pixi';
      break;
    default:
      vuMeterImpl = 'css';
  }

  return (
    <div className={styles.Layout}>
      <VUMeterPanel
        config={vuMeterPanelConfig}
        size={meterPanelSize}
        impl={vuMeterImpl}
      />
    </div>
  );
}

export default VUMeterView;
