/// <reference types="../../declaration.d.ts" />

import React, { useEffect, useState } from 'react';
import styles from './VUMeterView.module.scss';
import { CommonSettingsOf, NowPlayingScreenSettings } from 'now-playing-common';
import VUMeterPanel, { VUMeterPanelMeterProps, VUMeterPanelProps } from '../../common/vumeter/VUMeterPanel';

export type VUMeterViewProps = CommonSettingsOf<NowPlayingScreenSettings>['vuMeter'];

function VUMeterView(props: VUMeterViewProps) {
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

  return (
    <div className={styles.Layout}>
      <VUMeterPanel
        config={vuMeterPanelConfig}
        size={meterPanelSize}
      />
    </div>
  );
}

export default VUMeterView;
