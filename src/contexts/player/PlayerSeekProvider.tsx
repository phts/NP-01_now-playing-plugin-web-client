import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TrackTimer } from '../../utils/track';
import { useSocket } from '../SocketProvider';
import { PlayerStateContext } from './PlayerStateProvider';

interface PlayerSeekContextValue {
  currentSeekPosition: number;
  seekTo: (seek: number) => void;
}

const PlayerSeekContext = createContext({} as PlayerSeekContextValue);

const PlayerSeekProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocket();
  const playerState = useContext(PlayerStateContext);
  const [ currentSeekPosition, setCurrentSeekPosition ] = useState(0);
  const trackTimer = useRef<TrackTimer | null>(null);

  useEffect(() => {
    if (trackTimer.current === null) {
      trackTimer.current = new TrackTimer();
    }

    const tt = trackTimer.current;
    tt.on('seek', setCurrentSeekPosition);

    return () => {
      tt.destroy();
      trackTimer.current = null;
    };
  }, []);

  const seekTo = useCallback((val: number) => {
    if (socket) {
      socket.emit('seek', val / 1000);
    }
  }, [ socket ]);

  useEffect(() => {
    const tt = trackTimer.current;
    if (!tt) {
      return;
    }
    const seekVal = playerState.seek || 0;
    const max = (playerState.duration || 0) * 1000;
    setCurrentSeekPosition(seekVal);
    switch (playerState.status) {
      case 'play':
        tt.start(seekVal, max);
        break;
      case 'pause':
        tt.pause(seekVal, max);
        break;
      case 'stop':
        tt.stop();
        break;
      default:
    }
  }, [ playerState, setCurrentSeekPosition ]);

  return (
    <PlayerSeekContext.Provider value={{ currentSeekPosition, seekTo }}>
      {children}
    </PlayerSeekContext.Provider>
  );
};

export { PlayerSeekContext, PlayerSeekProvider };
