/// <reference types="../../declaration.d.ts" />

import React from 'react';
import Button, { ButtonProps } from '../../common/Button';
import { useSettings } from '../../contexts/SettingsProvider';
import styles from './DockedActionPanelTrigger.module.scss';
import { CommonSettingsCategory, DefaultNowPlayingScreenSettings } from 'now-playing-common';

export interface DockedActionPanelTriggerProps {
  onClick: ButtonProps['onClick'];
}

function DockedActionPanelTrigger(props: DockedActionPanelTriggerProps) {
  const { settings: screenSettings } = useSettings(CommonSettingsCategory.NowPlayingScreen);
  const settings = screenSettings.dockedActionPanelTrigger;
  const defaults = DefaultNowPlayingScreenSettings.dockedActionPanelTrigger;

  const dockedStyles = {
    '--docked-opacity': settings.opacity,
    '--docked-margin': settings.margin
  } as React.CSSProperties;

  if (settings.iconSettings === 'custom') {
    Object.assign(dockedStyles, {
      '--docked-icon-size': settings.iconSize,
      '--docked-icon-color': settings.iconColor
    });
  }

  const iconStyle = (settings.iconSettings === 'custom') ? settings.iconStyle : defaults.iconStyle;

  return (
    <div className={styles.DockedActionPanelTriggerWrapper} style={dockedStyles}>
      <Button
        styles={{
          baseClassName: 'DockedActionPanelTrigger',
          bundle: styles
        }}
        onClick={props.onClick}
        icon={iconStyle} />
    </div>
  );
}

export default DockedActionPanelTrigger;
