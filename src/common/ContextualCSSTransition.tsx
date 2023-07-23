import { CSSTransition } from 'react-transition-group';
import { usePerformanceContext } from '../contexts/SettingsProvider';
import React from 'react';
import { CSSTransitionProps } from 'react-transition-group/CSSTransition';

type ContextualCSSTransitionProps<Ref extends undefined | HTMLElement = undefined> = CSSTransitionProps<Ref> & {
  timeout: number;
}

function ContextualCSSTransition(props: ContextualCSSTransitionProps) {
  const {disableTransitions} = usePerformanceContext();

  const timeout = disableTransitions ? 0 : props.timeout;

  return <CSSTransition {...props} timeout={timeout}>{props.children}</CSSTransition>;
}

export default ContextualCSSTransition;
