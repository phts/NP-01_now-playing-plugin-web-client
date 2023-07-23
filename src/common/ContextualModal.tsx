import React from 'react';
import ReactModal from 'react-modal';
import { usePerformanceContext } from '../contexts/SettingsProvider';

export interface ContextualModalProps extends ReactModal.Props {
  closeTimeoutMS?: number;
}

function ContextualModal(props: ContextualModalProps) {
  const {disableTransitions} = usePerformanceContext();

  const timeout = disableTransitions ? 0 : props.closeTimeoutMS;

  return <ReactModal {...props} closeTimeoutMS={timeout}>{props.children}</ReactModal>;
}

export default ContextualModal;
