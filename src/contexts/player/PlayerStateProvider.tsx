import React, { createContext, useEffect, useState } from 'react';
import { useSocket } from '../SocketProvider';

// Volumio state
export interface PlayerState {
  service: string;
  status: 'play' | 'pause' | 'stop';
  title?: string;
  artist?: string;
  album?: string;
  albumart?: string;
  uri: '';
  trackType?: string;
  seek?: number;
  duration?: number;
  samplerate?: string;
  bitdepth?: string;
  bitrate?: string;
  channels?: number;
  volume?: number;
  mute?: boolean;
  isStreaming?: boolean;
  repeat?: boolean;
  repeatSingle?: boolean;
  random?: boolean;
  position?: number;
}

export type PlayerStateContextValue = PlayerState;

const EMPTY_STATE: PlayerState = {
  status: 'stop',
  service: '',
  title: undefined,
  artist: undefined,
  album: undefined,
  albumart: '/albumart',
  uri: '',
  trackType: undefined,
  seek: 0,
  duration: 0,
  samplerate: undefined,
  bitdepth: undefined,
  bitrate: undefined,
  channels: undefined
};

const PlayerStateContext = createContext(EMPTY_STATE);

const PlayerStateProvider = ({ children }: { children: React.ReactNode }) => {

  const [ playerState, setPlayerState ] = useState(EMPTY_STATE);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      const handlePushState = (state: PlayerState) => {
        setPlayerState(state);
      };

      const handleSocketConnect = () => {
        socket.emit('getState');
      };

      socket.on('pushState', handlePushState);
      socket.on('connect', handleSocketConnect);
      socket.on('reconnect', handleSocketConnect);

      if (socket.connected) {
        socket.emit('getState');
      }

      return () => {
        socket.off('reconnect', handleSocketConnect);
        socket.off('connect', handleSocketConnect);
        socket.off('pushState', handlePushState);
      };
    }
  }, [ socket, setPlayerState ]);

  return (
    <PlayerStateContext.Provider value={playerState}>
      {children}
    </PlayerStateContext.Provider>
  );
};

export { PlayerStateContext, PlayerStateProvider };
