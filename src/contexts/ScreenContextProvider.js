import classNames from "classnames";
import { Children, cloneElement, createContext, isValidElement, useCallback, useMemo, useReducer, useRef } from "react";
import Background from "../common/Background";
import ContextualCSSTransition from "../common/ContextualCSSTransition";
import TrackBar from "../common/TrackBar";
import ScreenWrapper from "../screens/ScreenWrapper";
import './ScreenContext.scss';

const ScreenContext = createContext();

const getInitialScreenStates = (children) => {
  const initialScreenStates = {};
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.props.screenId) {
      initialScreenStates[child.props.screenId] = {
        status: child.props.defaultActive ? 'active' : 'inactive',
        usesTrackBar: child.props.usesTrackBar || false,
        activeClassName: 'Screen--active',
        inactiveClassName: 'Screen--inactive',
        float: child.props.float || false,
        mountOnEnter: child.props.mountOnEnter || false,
        unmountOnExit: child.props.unmountOnExit || false
      };
    }
  });
  return initialScreenStates;
}

const ScreenContextProvider = ({ children }) => {

  const lastOrderedScreenIds = useRef(null);

  const screenStatesReducer = (states, data = {}) => {
    for (const screenId of Object.keys(data)) {
      if (!states[screenId]) {
        states[screenId] = {};
      }
      states[screenId] = {...states[screenId], ...data[screenId]}
    }
    return {...states};
  };

  const [screenStates, updateScreenStates] = useReducer(screenStatesReducer, children, getInitialScreenStates);

  const getScreenIdByStatus = useCallback((status) => {
    for (const [screenId, state] of Object.entries(screenStates)) {
      if (state.status === status) {
        return screenId;
      }
    }
    return null;
  }, [screenStates]);

  const currentActiveScreenId = getScreenIdByStatus('active');
  const currentEnteringScreenId = getScreenIdByStatus('entering');
  const currentExitingScreenId = getScreenIdByStatus('exiting');

  const orderedScreenIds = useMemo(() => {
    const ordered = [];
    if (currentEnteringScreenId && screenStates[currentEnteringScreenId].enteringFromUnderFloat && currentExitingScreenId && screenStates[currentExitingScreenId].exitingFromFloat) {
      ordered.push(currentExitingScreenId);
      ordered.push(currentEnteringScreenId);
    }
    else {
      if (currentEnteringScreenId) {
        ordered.push(currentEnteringScreenId);
      }
      if (currentActiveScreenId) {
        ordered.push(currentActiveScreenId);
      }
      if (currentExitingScreenId) {
        ordered.push(currentExitingScreenId);
      }
    }
    const screenIds = lastOrderedScreenIds.current ? lastOrderedScreenIds.current : Object.keys(screenStates);
    for (const screenId of screenIds) {
      if (screenStates[screenId].status === 'inactive') {
        ordered.push(screenId);
      }
    }
    lastOrderedScreenIds.current = ordered;
    return ordered;
  }, [currentActiveScreenId, currentEnteringScreenId, currentExitingScreenId, screenStates]);

  /**
   * opts: {
   *  screenId: id of tartget screen
   *  enterTransition: enter transition classname for target screen
   *  exitTransition: exit transition classname for currently active screen
   * }
   */
  const switchScreen = useCallback((opts) => {
    if (currentActiveScreenId === opts.screenId ||
      currentEnteringScreenId || currentExitingScreenId) {
        return;
    }
    const targetState = screenStates[opts.screenId];
    const targetFloat = targetState.float;
    const states = {
      [`${opts.screenId}`]: {
        status: 'entering',
        enterTransition: opts.enterTransition || 
          (targetState.underFloat ? 'underFloatExit' : 'fadeIn'),
        activeClassName: opts.activeClassName || 'Screen--active',
        underFloat: false,
        enteringFromUnderFloat: targetState.underFloat,
        screenProps: opts.screenProps
      }
    };
    if (currentActiveScreenId) {
      const currentActiveState = screenStates[currentActiveScreenId];
      states[currentActiveScreenId] = {
        status: 'exiting',
        exitTransition: opts.exitTransition || 
          (targetFloat ? 'underFloatExit' : 'fadeIn'),
        inactiveClassName: opts.inactiveClassName || 
          (targetFloat ? 'Screen--underFloat' : 'Screen--inactive'),
        underFloat: targetFloat,
        exitingFromFloat: currentActiveState.float
      };
    }
    updateScreenStates(states);
  }, [currentActiveScreenId, currentEnteringScreenId, currentExitingScreenId, screenStates, updateScreenStates]);

  const exitActiveScreen = useCallback((opts = {}) => {
    const enterScreenId = orderedScreenIds[1];
    if (enterScreenId) {
      switchScreen(Object.assign({}, opts, {
        screenId: enterScreenId
      }));
    }
  }, [orderedScreenIds, switchScreen]);

  const onScreenSwitched = useCallback(() => {
    const states = {};
    if (currentEnteringScreenId) {
      states[currentEnteringScreenId] = {
        status: 'active'
      };
    }
    if (currentExitingScreenId) {
      states[currentExitingScreenId] = {
        status: 'inactive'
      };
    }
    if (Object.keys(states).length > 0) {
      updateScreenStates(states);
    }
  }, [currentEnteringScreenId, currentExitingScreenId, updateScreenStates]);

  const getTransitionParams = (state) => {
    const params = {};
    if (state.status === 'active' || state.status === 'entering') {
      params.in = true;
      params.class = state.enterTransition;
    }
    else if (state.status === 'inactive' || state.status === 'exiting') {
      params.in = false;
      params.class = state.exitTransition;
    }
    if (params.class) {
      params.class = `Screen--${params.class}`;
    }
    return params;
  };

  const getChildClassNames = (child, state) => {
    if (state.status === 'inactive') {
      return classNames(child.props.className, state.inactiveClassName);
    }
    else if (state.status === 'active') {
      return classNames(child.props.className, state.activeClassName);
    }
    return child.props.className;
  };

  const screenZIndexes = useMemo(() => {
    return orderedScreenIds.reduce((order, screenId, index) => {
      order[screenId] = 50 - index;
      return order;
    }, {});
  }, [orderedScreenIds]);

  const shouldUnmountOnExit = useCallback((screenId) => {
    if (currentEnteringScreenId && screenStates[currentEnteringScreenId].float &&
      currentExitingScreenId === screenId) {
        return false;
    }
    else if (currentActiveScreenId && screenStates[currentActiveScreenId].float &&
      screenStates[screenId].status === 'inactive') {
        return false;
    }
    else {
      return screenStates[screenId].unmountOnExit;
    }
  }, [currentEnteringScreenId, currentActiveScreenId, currentExitingScreenId, screenStates]);

  const getChildren = () => {
    return Children.map(children, child => {
      const screenId = isValidElement(child) ? child.props.screenId : null;
      if (screenId) {
        const state = screenStates[screenId];
        const transitionParams = getTransitionParams(state);
        const childClassNames = getChildClassNames(child, state);
        const unmountOnExit = shouldUnmountOnExit(screenId);
        const component = (
          <ContextualCSSTransition
            in={transitionParams.in}
            classNames={transitionParams.class}
            timeout={200}
            mountOnEnter={state.mountOnEnter}
            unmountOnExit={unmountOnExit}
            onEntered={onScreenSwitched}>
              {cloneElement(
                child, {
                  className: childClassNames,
                  style: {'zIndex': screenZIndexes[screenId]},
                  ...(state.screenProps)
                })}
          </ContextualCSSTransition>
        )
        if (state.float && state.usesTrackBar) {
          return (
            <ContextualCSSTransition
            in={transitionParams.in}
            classNames='Screen--fadeIn'
            timeout={200}
            mountOnEnter={state.mountOnEnter}
            unmountOnExit={unmountOnExit}
            onEntered={onScreenSwitched}>
              <div 
                className={classNames('Viewport', childClassNames)}
                style={{'zIndex': screenZIndexes[screenId]}}>
                {component}
              </div>
          </ContextualCSSTransition>
          );
        }
        else {
          return component;
        }
      }
      else {
        return child;
      }
    });
  };

  const getTrackBarState = useCallback(() => {
    if (currentActiveScreenId && screenStates[currentActiveScreenId].usesTrackBar) {
      return 'active';
    }
    else if (currentEnteringScreenId && screenStates[currentEnteringScreenId].usesTrackBar) {
      return 'entering';
    }
    else if (currentExitingScreenId && screenStates[currentExitingScreenId].usesTrackBar) {
      return 'exiting';
    }
    else {
      return 'inactive';
    }
  }, [screenStates, currentActiveScreenId, currentEnteringScreenId, currentExitingScreenId]);

  const trackBarState = getTrackBarState();

  return (
    <ScreenContext.Provider value={{activeScreenId: currentActiveScreenId, switchScreen, exitActiveScreen}}>
      <ScreenWrapper>
        <Background 
          activeScreenId={currentActiveScreenId}
          enteringScreenId={currentEnteringScreenId} />
        {getChildren()}
        <ContextualCSSTransition
          in={trackBarState === 'active' || trackBarState === 'entering'}
          classNames="TrackBar--slideUp"
          timeout={200}
          mountOnEnter
          unmountOnExit>
            <TrackBar 
              state={trackBarState} 
              activeScreenId={currentActiveScreenId}
              enteringScreenId={currentEnteringScreenId} />
        </ContextualCSSTransition>
      </ScreenWrapper>
    </ScreenContext.Provider>
  );
};

export { ScreenContext, ScreenContextProvider };
