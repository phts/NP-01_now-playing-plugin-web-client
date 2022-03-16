import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";

const PlayerStateContext = createContext();

const PlayerStateProvider = ({ children }) => {

  const [playerState, setPlayerState] = useState({});
  const {socket} = useContext(SocketContext);

  const handlePushState = useCallback(state => {
    setPlayerState(state);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('pushState', handlePushState);

      return () => {
        socket.off('pushState', handlePushState);
      };
    }
  }, [socket, handlePushState]);

  return (
    <PlayerStateContext.Provider value={playerState}>
      {children}
    </PlayerStateContext.Provider>
  );
};

export { PlayerStateContext, PlayerStateProvider };