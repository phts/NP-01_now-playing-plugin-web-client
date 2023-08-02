import classNames from 'classnames';
import React, { Children, Reducer, cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import Background from '../common/Background';
import ContextualCSSTransition from '../common/ContextualCSSTransition';
import TrackBar from '../common/TrackBar';
import ScreenWrapper from '../screens/ScreenWrapper';
import './ScreenContext.scss';
import { useSettings } from './SettingsProvider';
import { CommonSettingsCategory, CommonSettingsOf, PerformanceSettings } from 'now-playing-common';
import { StartupOptions } from 'now-playing-common/dist/config/StartupOptions';

export const SCREEN_IDS = [
  'NowPlaying',
  'Browse',
  'Queue',
  'Volumio'
] as const;

export type ScreenId = typeof SCREEN_IDS[number];

export interface ScreenProps {
  screenId: ScreenId;
  usesTrackBar?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  float?: boolean;
}

export interface ScreenContextValue {
  activeScreenId: ScreenId | null;
  switchScreen: (params: {
    screenId: ScreenId;
    enterTransition?: string;
    exitTransition?: string;
    activeClassName?: string;
    inactiveClassName?: string;
    screenProps?: any
  }) => void;
  exitActiveScreen: (params?: { exitTransition: string; }) => void;
}

export type ScreenStatus = 'active' | 'entering' | 'exiting' | 'inactive';

export type ScreenState = Record<string, any> & {
  status?: ScreenStatus;
  exitTransition?: string;
  inactiveClassName?: string;
  underFloat?: boolean;
  exitingFromFloat?: boolean;
  usesTrackBar?: boolean;
  activeClassName?: string;
  float?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
};

export type ScreenStates = Partial<Record<ScreenId, ScreenState>>;

type ScreenStatesAction = ScreenStates;

const ScreenContext = createContext({} as ScreenContextValue);

const ACTIVE_SCREEN_TO_ID: Record<CommonSettingsOf<StartupOptions>['activeScreen'], ScreenId> = {
  'nowPlaying.basicView': 'NowPlaying',
  'nowPlaying.infoView': 'NowPlaying',
  browse: 'Browse',
  volumio: 'Volumio'
};

const validateScreenId = (value: any): value is ScreenId => {
  return typeof value === 'string' && SCREEN_IDS.includes(value as any);
};

const getInitialScreenStates = (data: {children: React.ReactNode, startupOptions: CommonSettingsOf<StartupOptions>}): ScreenStates => {
  const { children, startupOptions } = data;
  const initialScreenStates: ScreenStates = {};
  const startupScreenId = ACTIVE_SCREEN_TO_ID[startupOptions.activeScreen];
  Children.forEach(children, (child) => {
    const screenId = isValidElement(child) ? child.props.screenId : null;
    if (isValidElement<any>(child) && validateScreenId(screenId)) {
      initialScreenStates[screenId] = {
        status: (screenId === startupScreenId) ? 'active' : 'inactive',
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
};

const ScreenContextProvider = ({ children }: { children: React.ReactNode }) => {

  const lastOrderedScreenIds = useRef<ScreenId[] | null>(null);
  const { settings: performanceSettings } = useSettings(CommonSettingsCategory.Performance);
  const { settings: startupOptions } = useSettings(CommonSettingsCategory.Startup);

  const screenStatesReducer: Reducer<ScreenStates, ScreenStatesAction> = (states, data): ScreenStates => {
    for (const screenId of Object.keys(data)) {
      if (validateScreenId(screenId)) {
        if (!states[screenId as ScreenId]) {
          states[screenId] = {};
        }
        states[screenId] = { ...states[screenId], ...data[screenId] };
      }
    }
    return { ...states };
  };

  const [ screenStates, updateScreenStates ] = useReducer(screenStatesReducer, {children, startupOptions}, getInitialScreenStates);

  /**
   * Handle change in startupOptions. Note that the plugin does not broadcast changes in startupOptions
   * because they are applied only once when app starts and subsequent changes should not affect current state.
   * The situation where startupOptions can change is when apiPath changes causing SettingsProviderImpl to refetch
   * settings from API endpoint.
   */
  useEffect(() => {
    const reducedStates = getInitialScreenStates({children, startupOptions});
    updateScreenStates(reducedStates);
  }, [ startupOptions ]);

  const getScreenIdByStatus = useCallback((status: ScreenStatus) => {
    for (const [ screenId, state ] of Object.entries(screenStates)) {
      if (state.status === status) {
        return screenId as ScreenId;
      }
    }
    return null;
  }, [ screenStates ]);

  const currentActiveScreenId = getScreenIdByStatus('active');
  const currentEnteringScreenId = getScreenIdByStatus('entering');
  const currentExitingScreenId = getScreenIdByStatus('exiting');

  const orderedScreenIds = useMemo(() => {
    const ordered: ScreenId[] = [];
    if (currentEnteringScreenId &&
      screenStates[currentEnteringScreenId]?.enteringFromUnderFloat &&
      currentExitingScreenId && screenStates[currentExitingScreenId]?.exitingFromFloat) {
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
    const screenIds = lastOrderedScreenIds.current ? lastOrderedScreenIds.current : Object.keys(screenStates) as ScreenId[];
    for (const screenId of screenIds) {
      if (screenStates[screenId]?.status === 'inactive') {
        ordered.push(screenId);
      }
    }
    lastOrderedScreenIds.current = ordered;
    return ordered;
  }, [ currentActiveScreenId, currentEnteringScreenId, currentExitingScreenId, screenStates ]);

  /**
   * Opts: {
   *  screenId: id of tartget screen
   *  enterTransition: enter transition classname for target screen
   *  exitTransition: exit transition classname for currently active screen
   * }
   */
  const switchScreen: ScreenContextValue['switchScreen'] = useCallback((params) => {
    if (currentActiveScreenId === params.screenId ||
      currentEnteringScreenId || currentExitingScreenId) {
      return;
    }
    const targetState = screenStates[params.screenId];
    const targetFloat = targetState?.float;
    const states: ScreenStates = {
      [`${params.screenId}`]: {
        status: 'entering',
        enterTransition: params.enterTransition ||
          (targetState?.underFloat ? 'underFloatExit' : 'fadeIn'),
        activeClassName: params.activeClassName || 'Screen--active',
        underFloat: false,
        enteringFromUnderFloat: targetState?.underFloat,
        screenProps: params.screenProps
      }
    };
    if (currentActiveScreenId) {
      const currentActiveState = screenStates[currentActiveScreenId];
      states[currentActiveScreenId] = {
        status: 'exiting',
        exitTransition: params.exitTransition ||
          (targetFloat ? 'underFloatExit' : 'fadeIn'),
        inactiveClassName: params.inactiveClassName ||
          (targetFloat ? 'Screen--underFloat' : 'Screen--inactive'),
        underFloat: targetFloat,
        exitingFromFloat: currentActiveState?.float
      };
    }
    updateScreenStates(states);
  }, [ currentActiveScreenId, currentEnteringScreenId, currentExitingScreenId, screenStates, updateScreenStates ]);

  const exitActiveScreen: ScreenContextValue['exitActiveScreen'] = useCallback((params) => {
    const enterScreenId = orderedScreenIds[1];
    if (enterScreenId) {
      switchScreen(Object.assign({}, params, {
        screenId: enterScreenId
      }));
    }
  }, [ orderedScreenIds, switchScreen ]);

  const onScreenSwitched = useCallback(() => {
    const states: ScreenStates = {};
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
  }, [ currentEnteringScreenId, currentExitingScreenId, updateScreenStates ]);

  const getTransitionParams = (state: ScreenState) => {
    const params: { in?: boolean; class?: string; } = {};
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

  const getChildClassNames = (child: React.JSX.Element, state: ScreenState) => {
    if (state.status === 'inactive') {
      return classNames(child.props.className, state.inactiveClassName);
    }
    else if (state.status === 'active') {
      return classNames(child.props.className, state.activeClassName);
    }
    return child.props.className;
  };

  const screenZIndexes = useMemo(() => {
    return orderedScreenIds.reduce<Record<string, number>>((order, screenId, index) => {
      order[screenId] = 50 - index;
      return order;
    }, {});
  }, [ orderedScreenIds ]);

  const shouldUnmountOnExit = useCallback((screenId: ScreenId) => {
    if (currentEnteringScreenId && screenStates[currentEnteringScreenId]?.float &&
      currentExitingScreenId === screenId) {
      return false;
    }
    else if (currentActiveScreenId && screenStates[currentActiveScreenId]?.float &&
      screenStates[screenId]?.status === 'inactive') {
      return false;
    }

    if (performanceSettings.unmountScreensOnExit === 'custom') {
      const perfKey = `unmount${screenId}ScreenOnExit` as keyof PerformanceSettings;
      if (performanceSettings[perfKey] !== undefined) {
        return performanceSettings[perfKey] as boolean;
      }
    }
    return !!screenStates[screenId]?.unmountOnExit;

  }, [ currentEnteringScreenId, currentActiveScreenId, currentExitingScreenId, screenStates, performanceSettings ]);

  const getChildren = () => {
    return Children.map(children, (child) => {
      const screenId = isValidElement(child) ? child.props.screenId : null;
      if (isValidElement(child) && validateScreenId(screenId)) {
        const state = screenStates[screenId];
        if (!state) {
          return null;
        }
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
                style: { 'zIndex': screenZIndexes[screenId] },
                ...(state.screenProps)
              })}
          </ContextualCSSTransition>
        );
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
                style={{ 'zIndex': screenZIndexes[screenId] }}>
                {component}
              </div>
            </ContextualCSSTransition>
          );
        }

        return component;

      }

      return child;

    });
  };

  const getTrackBarState = useCallback(() => {
    if (currentActiveScreenId && screenStates[currentActiveScreenId]?.usesTrackBar) {
      return 'active';
    }
    else if (currentEnteringScreenId && screenStates[currentEnteringScreenId]?.usesTrackBar) {
      return 'entering';
    }
    else if (currentExitingScreenId && screenStates[currentExitingScreenId]?.usesTrackBar) {
      return 'exiting';
    }

    return 'inactive';

  }, [ screenStates, currentActiveScreenId, currentEnteringScreenId, currentExitingScreenId ]);

  const trackBarState = getTrackBarState();

  return (
    <ScreenContext.Provider value={{ activeScreenId: currentActiveScreenId, switchScreen, exitActiveScreen }}>
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

const useScreens = () => useContext(ScreenContext);

export { useScreens, ScreenContextProvider };
