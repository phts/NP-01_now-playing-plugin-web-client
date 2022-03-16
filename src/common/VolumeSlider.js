import classNames from "classnames";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Direction, Range } from "react-range";
import { PlayerStateContext } from "../contexts/PlayerStateProvider";
import { SocketContext } from "../contexts/SocketProvider";
import Button from "./Button";
import styles from "./VolumeSlider.module.scss";

function VolumeSlider(props) {
  const {socket} = useContext(SocketContext);
  const playerState = useContext(PlayerStateContext);
  const changeVolumeTimer = useRef(null);
  const changeVolumeValue = useRef(playerState.volume);
  const [displayVolume, setDisplayVolume] = useState(playerState.volume);

  useEffect(() => {
    if (changeVolumeTimer.current === null) {
      setDisplayVolume(playerState.volume);
    }
  }, [playerState.volume, setDisplayVolume]);

  const setVolume = useCallback(val => {
    socket.emit('volume', val);
  }, [socket]);

  const toggleMute = useCallback(() => {
    socket.emit(playerState.mute ? 'unmute' : 'mute');
  }, [socket, playerState.mute]);

  const handleMaxClicked = useCallback(() => {
    setVolume(100)
  }, [setVolume]);

  const clearChangeVolumeTimer = () => {
    if (changeVolumeTimer.current) {
      clearInterval(changeVolumeTimer.current);
      changeVolumeTimer.current = null;
    }
  };

  const startChangeVolumeTimer = useCallback(() => {
    if (!changeVolumeTimer.current) {
      changeVolumeTimer.current = setInterval(() => {
        setVolume(changeVolumeValue.current);
      }, 300);
    }
  }, [setVolume]);

  const onSliderValueChanged = useCallback(val => {
    changeVolumeValue.current = val;
    startChangeVolumeTimer(val);
    setDisplayVolume(val);
  }, [startChangeVolumeTimer]);

  const endChangeVolume = useCallback(endVal => {
    clearChangeVolumeTimer();
    setDisplayVolume(endVal);
    setVolume(endVal);
  }, [setDisplayVolume, setVolume]);

  const renderSliderTrack = useCallback(({ props, children }) => {
    return (
    <div {...props} className={styles.Slider}>
      <div
        ref={props.ref}
        className={styles.Slider__track}>
      </div>
      {children}
    </div>
  )}, []);

  const renderSliderThumb = useCallback(({ props }) => (
    <div
      {...props}
      className={styles.Slider__thumb}
      style={{
        left: displayVolume + '%'
      }}
    />
  ), [displayVolume]);

  const mainClassNames = classNames([
    styles.Layout,
    props.orientation === 'vertical' ? 
      styles['Layout--vertical'] : styles['Layout--horizontal'],
    playerState.mute ? styles['Layout--muted'] : null
  ]);
  
  return (
    <div 
      className={mainClassNames}
      style={{
        '--volume-level': displayVolume + '%'
      }}>
      <Button 
        styles={{
          baseClassName: 'Button',
          bundle: styles,
          extraClassNames: [styles['Button--mute']]
        }}
        icon="volume_mute" 
        toggleable={true}
        toggled={playerState.mute}
        onClick={toggleMute} />
      <Range className={styles.Slider}
        trackClassName={styles.Slider__track}
        direction={props.orientation === 'vertical' ? Direction.Up : Direction.Right }
        values={[displayVolume]}
        max={100}
        onChange={values => onSliderValueChanged(values[0])}
        onFinalChange={values => endChangeVolume(values[0])}
        renderTrack={renderSliderTrack}
        renderThumb={renderSliderThumb} />
      <Button 
        styles={{
          baseClassName: 'Button',
          bundle: styles,
          extraClassNames: [styles['Button--max']]
        }}
        icon="volume_up" 
        onClick={handleMaxClicked} />
    </div>
  );
}

export default VolumeSlider;