import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { TrackTimer } from "../../utils/track";
import { useSocket } from "../SocketProvider";
import { PlayerStateContext } from "./PlayerStateProvider";

const PlayerSeekContext = createContext();

const PlayerSeekProvider = ({ children }) => {
  const {socket} = useSocket();
  const playerState = useContext(PlayerStateContext);
  const [currentSeekPosition, setCurrentSeekPosition] = useState(0);
  const trackTimer = useRef(null);

  useEffect(() => {
    if (trackTimer.current === null) {
      trackTimer.current = new TrackTimer();
    }

    const tt = trackTimer.current;
    tt.on('seek', setCurrentSeekPosition);

    return () => {
      tt.destroy();
      trackTimer.current = null;
    }
  }, []);

  const seekTo = useCallback(val => {
    socket.emit('seek', val/1000);
  }, [socket]);

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

  // Workaround for services that don't push 'stop' state when playback
  // finishes and causes seek position to exceed duration
  useEffect(() => {
    const tt = trackTimer.current;
    if (currentSeekPosition > playerState.duration * 1000) {
      tt.stop();
    }
  }, [currentSeekPosition, playerState.duration]);
  

  return (
    <PlayerSeekContext.Provider value={{currentSeekPosition, seekTo}}>
      {children}
    </PlayerSeekContext.Provider>
  );
};

export { PlayerSeekContext, PlayerSeekProvider };
