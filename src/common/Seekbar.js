import classNames from "classnames";
import Slider from "rc-slider";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayerSeek } from "../contexts/PlayerProvider";
import { millisecondsToString } from "../utils/track";
import './Seekbar.scss';

function Seekbar(props) {
  const playerState = props.playerState;
  const {currentSeekPosition, seekTo} = usePlayerSeek();
  const [displaySeek, setDisplaySeek] = useState(currentSeekPosition);
  const isSeekingRef = useRef(false);

  useEffect(() => {
    if (!isSeekingRef.current) {
      setDisplaySeek(currentSeekPosition);
    }
  }, [setDisplaySeek, currentSeekPosition]);

  const seekText = millisecondsToString(displaySeek);
  const duration = (playerState.duration || 0) * 1000;
  const durationText = millisecondsToString(duration);
  const seekPercent = (duration > 0) ? ((currentSeekPosition / duration) * 100) + '%' : 0;
  const disabled = playerState.duration === 0 || playerState.status === 'stop';

  const beginSeek = useCallback((beginVal) => {
    isSeekingRef.current = true;
    setDisplaySeek(beginVal);
  }, [setDisplaySeek]);

  const endSeek = useCallback((value) => {
    isSeekingRef.current = false;
    setDisplaySeek(value);
    seekTo(value);
  }, [setDisplaySeek, seekTo]);

  const onSliderValueChanged = useCallback((value) => {
    if (isSeekingRef.current) {
      setDisplaySeek(value);
    }
    else {
      beginSeek(value);
    }
  }, [setDisplaySeek, beginSeek]);

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

  const showText = props.showText !== undefined ? props.showText : true;

  return (
    <div className={mainClassName} style={{'--seek-percent': seekPercent}}>
      <Slider 
        className={getElementClassName('slider')}
        value={[Math.min(displaySeek, duration)]}
        max={Math.max(duration, 1)}
        onChange={onSliderValueChanged}
        onAfterChange={endSeek}
        />
      { showText ? 
        <><span className={getElementClassName('seek')}>{ seekText }</span><span className={getElementClassName('duration')}>{ durationText }</span></>
        : null }
    </div>
  );
}

export default Seekbar;