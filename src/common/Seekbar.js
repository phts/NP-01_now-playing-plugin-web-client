import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { Range } from "react-range";
import { usePlayerSeek } from "../contexts/PlayerSeekProvider";
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

  const endSeek = useCallback((values) => {
    const endVal = values[0];
    isSeekingRef.current = false;
    setDisplaySeek(endVal);
    seekTo(endVal);
  }, [setDisplaySeek, seekTo]);

  const onSliderValueChanged = useCallback((values) => {
    const changedVal = values[0];
    if (isSeekingRef.current) {
      setDisplaySeek(changedVal);
    }
    else {
      beginSeek(changedVal);
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
        values={[Math.min(displaySeek, duration)]}
        max={Math.max(duration, 1)}
        onChange={onSliderValueChanged}
        onFinalChange={endSeek}
        renderTrack={renderSliderTrack}
        renderThumb={renderSliderThumb} />
      { showText ? 
        <><span className={getElementClassName('seek')}>{ seekText }</span><span className={getElementClassName('duration')}>{ durationText }</span></>
        : null }
    </div>
  );
}

export default Seekbar;