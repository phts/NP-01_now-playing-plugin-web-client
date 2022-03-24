import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { usePlayerState } from "../contexts/PlayerStateProvider";
import "./VolumeIndicator.scss";

function VolumeIndicator(props) {
  const playerState = usePlayerState();
  const isMuted = playerState.mute !== undefined ? playerState.mute : false;
  const volume = playerState.volume || 0;

  const getText = useCallback(() => {
    if (playerState.mute) {
      return (<span className="material-icons">volume_off</span>);
    }
    else {
      const text = `${volume || 0}%`;
      return (<><span className="material-icons">volume_up</span>{text}</>);
    }
  }, [playerState.mute, volume]);

  const dial = useMemo(() => {
    if (props.showDial === undefined || props.showDial) {
      return (<div className="VolumeIndicator__dialWrapper">
        <svg>
          <circle
            className={classNames([
              'VolumeIndicator__dial',
              'VolumeIndicator__dial--primary'
            ])}
            cx="50%"
            cy="50%"
            r="3.5em">
          </circle>
          <circle
            className={classNames([
              'VolumeIndicator__dial',
              'VolumeIndicator__dial--highlight',
              isMuted ? 'VolumeIndicator__dial--muted' : null
            ])}
            cx="50%"
            cy="50%"
            r="3.5em"
            pathLength="100">
          </circle>
        </svg>
      </div>);
    }
    return null;
  }, [props.showDial, isMuted]);
  
  return useMemo(() => (
    <div 
      className="VolumeIndicator" 
      style={{'--volume-level': volume + 'px', ...props.style}}
      onClick={props.onClick}>
      { dial }
      <div className={classNames([
        'VolumeIndicator__text',
        dial ? null : 'VolumeIndicator__text--noDial',
        isMuted ? 'VolumeIndicator_text--muted' : null
      ])}>
        {getText()}
      </div>
    </div>
  ), [volume, getText, dial, isMuted, props.onClick, props.style]);
}

export default VolumeIndicator;