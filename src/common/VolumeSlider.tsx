/// <reference types="../declaration.d.ts" />

import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Direction, Range } from 'react-range';
import { usePlayerState } from '../contexts/PlayerProvider';
import { useSocket } from '../contexts/SocketProvider';
import Button from './Button';
import styles from './VolumeSlider.module.scss';

export interface VolumeSliderProps {
  orientation?: 'vertical' | 'horizontal'
}

function VolumeSlider(props: VolumeSliderProps) {
  const { socket } = useSocket();
  const playerState = usePlayerState();
  const changeVolumeTimer = useRef<NodeJS.Timeout | null>(null);
  const changeVolumeValue = useRef(playerState.volume);
  const [ displayVolume, setDisplayVolume ] = useState(playerState.volume);

  useEffect(() => {
    if (changeVolumeTimer.current === null) {
      setDisplayVolume(playerState.volume);
    }
  }, [ playerState.volume, setDisplayVolume ]);

  const setVolume = useCallback((val: number) => {
    if (socket) {
      socket.emit('volume', val);
    }
  }, [ socket ]);

  const toggleMute = useCallback(() => {
    if (socket) {
      socket.emit(playerState.mute ? 'unmute' : 'mute');
    }
  }, [ socket, playerState.mute ]);

  const handleMaxClicked = useCallback(() => {
    setVolume(100);
  }, [ setVolume ]);

  const clearChangeVolumeTimer = () => {
    if (changeVolumeTimer.current) {
      clearInterval(changeVolumeTimer.current);
      changeVolumeTimer.current = null;
    }
  };

  const startChangeVolumeTimer = useCallback(() => {
    if (!changeVolumeTimer.current) {
      changeVolumeTimer.current = setInterval(() => {
        if (changeVolumeValue.current) {
          setVolume(changeVolumeValue.current);
        }
      }, 300);
    }
  }, [ setVolume ]);

  const onSliderValueChanged = useCallback((val: number) => {
    changeVolumeValue.current = val;
    startChangeVolumeTimer();
    setDisplayVolume(val);
  }, [ startChangeVolumeTimer ]);

  const endChangeVolume = useCallback((endVal: number) => {
    clearChangeVolumeTimer();
    setDisplayVolume(endVal);
    setVolume(endVal);
  }, [ setDisplayVolume, setVolume ]);

  const renderSliderTrack = useCallback<Range['props']['renderTrack']>(({ props, children }) => {
    return (
      <div {...props} className={styles.Slider}>
        <div
          ref={props.ref}
          className={styles.Slider__track}>
        </div>
        {children}
      </div>
    );
  }, []);

  const renderSliderThumb = useCallback<Range['props']['renderThumb']>(({ props }) => (
    <div
      {...props}
      className={styles.Slider__thumb}
      style={{
        left: `${displayVolume}%`
      }}
    />
  ), [ displayVolume ]);

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
        '--volume-level': `${displayVolume}%`
      } as React.CSSProperties}>
      <Button
        styles={{
          baseClassName: 'Button',
          bundle: styles,
          extraClassNames: [ styles['Button--mute'] ]
        }}
        icon="volume_mute"
        toggleable
        toggled={playerState.mute}
        onClick={toggleMute} />
      <Range
        direction={props.orientation === 'vertical' ? Direction.Up : Direction.Right}
        values={displayVolume ? [ displayVolume ] : [ 0 ]}
        max={100}
        onChange={(values) => onSliderValueChanged(values[0])}
        onFinalChange={(values) => endChangeVolume(values[0])}
        renderTrack={renderSliderTrack}
        renderThumb={renderSliderThumb} />
      <Button
        styles={{
          baseClassName: 'Button',
          bundle: styles,
          extraClassNames: [ styles['Button--max'] ]
        }}
        icon="volume_up"
        onClick={handleMaxClicked} />
    </div>
  );
}

export default VolumeSlider;
