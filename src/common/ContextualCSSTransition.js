import classNames from "classnames";
import { Children, cloneElement, useContext, useMemo } from "react";
import { CSSTransition } from "react-transition-group";
import { AppContext } from "../contexts/AppContextProvider";

function ContextualCSSTransition(props) {
  const {isKiosk} = useContext(AppContext);
  const disableTransitions = isKiosk;

  const children = useMemo(() => {
    if (props.children && disableTransitions) {
      const child = Children.only(props.children);
      return cloneElement(child, {
        className: classNames(child.props.className, 'no-transitions')
      });
    }
    return props.children;
  }, [props.children, disableTransitions]);

  const timeout = disableTransitions ? 0 : props.timeout;

  return <CSSTransition {...props} timeout={timeout}>{children}</CSSTransition>;
}

export default ContextualCSSTransition;
