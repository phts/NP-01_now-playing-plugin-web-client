/// <reference types="../../declaration.d.ts" />

import React from 'react';
import styles from './VUMeterErrorPanel.module.scss';

export interface VUMeterErrorPanelProps {
  message: string;
}

function VUMeterErrorPanel(props: VUMeterErrorPanelProps) {
  return (
    <div className={styles.Layout}>
      <span className='material-icons'>error</span>
      <div>{props.message}</div>
    </div>
  );
}

export default VUMeterErrorPanel;
