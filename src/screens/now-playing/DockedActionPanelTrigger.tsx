/// <reference types="../../declaration.d.ts" />

import React from 'react';
import Button, { ButtonProps } from '../../common/Button';
import { useRawSettings } from '../../contexts/SettingsProvider';
import styles from './DockedActionPanelTrigger.module.scss';

export interface DockedActionPanelTriggerProps {
  onClick: ButtonProps['onClick'];
}

function DockedActionPanelTrigger(props: DockedActionPanelTriggerProps) {
  const {settings: screenSettings} = useRawSettings('screen.nowPlaying');
  const settings = screenSettings.dockedActionPanelTrigger || {};

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

  const iconStyle = (settings.iconSettings === 'custom') ? (settings.iconStyle || 'expand_more') : 'expand_more';

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
