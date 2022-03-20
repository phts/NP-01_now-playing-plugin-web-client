import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { TrackTimer } from "../utils/track";
import { PlayerStateContext } from "./PlayerStateProvider";
import { SocketContext } from "./SocketProvider";

const PlayerSeekContext = createContext();

const PlayerSeekProvider = ({ children }) => {
  const {socket} = useContext(SocketContext);
  const playerState = useContext(PlayerStateContext);
  const [currentSeekPosition, setCurrentSeekPosition] = useState(0);
  const trackTimer = useRef(new TrackTimer());

  const seekTo = useCallback(val => {
    socket.emit('seek', val/1000);
  }, [socket]);

  useEffect(() => {
    const tt = trackTimer.current;
    tt.on('seek', setCurrentSeekPosition);

    return () => {
      tt.off('seek', setCurrentSeekPosition);
    }
  }, [setCurrentSeekPosition]);

  useEffect(() => {
    const tt = trackTimer.current;
    const seekVal = playerState.seek || 0;
    setCurrentSeekPosition(seekVal);
    if (playerState.status === 'play') {
      tt.start(seekVal);
    }
    else {
      tt.pause();
    }
  }, [playerState.seek, playerState.status, setCurrentSeekPosition]);
  

  return (
    <PlayerSeekContext.Provider value={{currentSeekPosition, seekTo}}>
      {children}
    </PlayerSeekContext.Provider>
  );
};

export { PlayerSeekContext, PlayerSeekProvider };
