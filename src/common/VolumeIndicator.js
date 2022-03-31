import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { usePlayerState } from "../contexts/PlayerProvider";
import "./VolumeIndicator.scss";

function VolumeIndicator(props) {
  const playerState = usePlayerState();
  const isMuted = playerState.mute !== undefined ? playerState.mute : false;
  const volume = playerState.volume || 0;

  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];

  const mainClassName = (baseClassName && stylesBundle) ? 
    classNames(
      stylesBundle[baseClassName] || 'VolumeIndicator',
      [...extraClassNames]
    )
    :
    classNames(
      'VolumeIndicator',
      [...extraClassNames]
    );

  const getElementClassName = useCallback((element) => (baseClassName && stylesBundle) ? 
      stylesBundle[`${baseClassName}__${element}`] || `VolumeIndicator__${element}`:
      `VolumeIndicator__${element}`, [baseClassName, stylesBundle]);


  const getIcon = useCallback(() => {
    const iconClassNames = classNames(
      getElementClassName('icon'),
      playerState.mute ? getElementClassName('icon--muted') : null
    );
    return (
      <span className={iconClassNames}>{playerState.mute ? 'volume_off' : 'volume_up'}</span>
    );
  }, [playerState.mute, getElementClassName]);

  const getText = useCallback(() => {
    if (playerState.mute) {
      return null;
    }
    else {
      return (
        <span className={getElementClassName('text')}>{`${volume || 0}%`}</span>
      )
    }
  }, [playerState.mute, volume, getElementClassName]);

  const dial = useMemo(() => {
    if (props.showDial === undefined || props.showDial) {
      return (<div className={getElementClassName('dialWrapper')}>
        <svg>
          <circle
            className={classNames(
              getElementClassName('dial'),
              getElementClassName('dial--primary')
            )}
            cx="50%"
            cy="50%"
            r="3.5em">
          </circle>
          <circle
            className={classNames(
              getElementClassName('dial'),
              getElementClassName('dial--highlight'),
              isMuted ? getElementClassName('dial--muted') : null
            )}
            cx="50%"
            cy="50%"
            r="3.5em"
            pathLength="100">
          </circle>
        </svg>
      </div>);
    }
    return null;
  }, [props.showDial, isMuted, getElementClassName]);
  
  return (
    <div 
      className={mainClassName} 
      style={{'--volume-level': volume + 'px'}}
      onClick={props.onClick}>
      { dial }
      <div className={classNames(
        getElementClassName('contents'),
        dial ? null : getElementClassName('contents--noDial')
      )}>
        {getIcon()}
        {getText()}
      </div>
    </div>
  );
}

export default VolumeIndicator;
