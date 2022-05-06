import { CSSTransition } from "react-transition-group";
import { usePerformanceContext } from "../contexts/SettingsProvider";

function ContextualCSSTransition(props) {
  const {disableTransitions} = usePerformanceContext();

  const timeout = disableTransitions ? 0 : props.timeout;

  return <CSSTransition {...props} timeout={timeout}>{props.children}</CSSTransition>;
}

export default ContextualCSSTransition;
