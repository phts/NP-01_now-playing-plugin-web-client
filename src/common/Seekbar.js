import classNames from "classnames";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Range } from "react-range";
import { SocketContext } from "../contexts/SocketProvider";
import { millisecondsToString, TrackTimer } from "../utils/track";
import './Seekbar.scss';

function Seekbar(props) {
  const {socket} = useContext(SocketContext);
  const playerState = props.playerState;
  const [seek, setSeek] = useState(playerState.seek || 0);
  const trackTimerRef = useRef();
  const isSeekingRef = useRef(false);

  const seekTo = useCallback(val => {
    socket.emit('seek', val/1000);
  }, [socket]);
   
  const onTrackTimerSeek = useCallback(val => {
    setSeek(val);
  }, [setSeek]);

  useEffect(() => {
    const seekVal = playerState.seek || 0;
    const trackTimer = new TrackTimer();
    trackTimerRef.current = trackTimer;
    trackTimer.on('seek', onTrackTimerSeek);

    if (playerState.status === 'play') {
      trackTimer.start(seekVal);
    }
    setSeek(seekVal);
        
    return () => {
      trackTimer.destroy();
      trackTimerRef.current = null;
    };
  }, [props.playerState, playerState.seek, playerState.status, onTrackTimerSeek]);

  const seekText = millisecondsToString(seek);
  const duration = (playerState.duration || 0) * 1000;
  const durationText = millisecondsToString(duration);
  const seekPercent = (duration > 0) ? ((seek / duration) * 100) + '%' : 0;
  const disabled = playerState.duration === 0 || playerState.status === 'stop';

  const beginSeek = useCallback(beginVal => {
    trackTimerRef.current.pause();
    isSeekingRef.current = true;
    setSeek(beginVal);
  }, [setSeek]);

  const endSeek = useCallback(endVal => {
    isSeekingRef.current = false;
    setSeek(endVal);
    seekTo(endVal);
  }, [setSeek, seekTo]);

  const onSliderValueChanged = useCallback(val => {
    if (isSeekingRef.current) {
      setSeek(val);
    }
    else {
      beginSeek(val);
    }
  }, [setSeek, beginSeek]);

  // Style bundle in props
  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];

  const mainClassName = (baseClassName && stylesBundle) ? 
    classNames(
      stylesBundle[baseClassName] || 'Seekbar',
      disabled ? (stylesBundle[`${baseClassName}--disabled`] || 'Seekbar--disabled') : null,
      'no-swipe',
      [...extraClassNames]
    )
    :
    classNames(
      'Seekbar',
      disabled ? 'Seekbar--disabled' : null,
      'no-swipe',
      [...extraClassNames]
    );

  const getElementClassName = useCallback((element) => {
    if (baseClassName && stylesBundle) {
      return stylesBundle[`${baseClassName}__${element}`] || `Seekbar__${element}`;
    }
    else {
      return `Seekbar__${element}`;
    }
  }, [baseClassName, stylesBundle]);

  const renderSliderTrack = useCallback(({ props, children }) => {
    return (
    <div {...props} className={getElementClassName('slider')} style={{'--seek-percent': seekPercent}}>
      <div
        ref={props.ref}
        className={getElementClassName('track')}>
      </div>
      {children}
    </div>
  )}, [seekPercent, getElementClassName]);

  const renderSliderThumb = useCallback(({ props }) => {
    return (<div
      {...props}
      className={getElementClassName('thumb')}
      style={{
        left: seekPercent
      }}
    />);
  }, [seekPercent, getElementClassName]);

  const showText = props.showText !== undefined ? props.showText : true;

  return (
    <div className={mainClassName}>
      <Range 
        values={[Math.min(seek, duration)]}
        max={Math.max(duration, 1)}
        onChange={values => onSliderValueChanged(values[0])}
        onFinalChange={values => endSeek(values[0])}
        renderTrack={renderSliderTrack}
        renderThumb={renderSliderThumb} />
      { showText ? 
        <><span className={getElementClassName('seek')}>{ seekText }</span><span className={getElementClassName('duration')}>{ durationText }</span></>
        : null }
    </div>
  );
}

export default Seekbar;