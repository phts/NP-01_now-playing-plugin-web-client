import { createContext, useEffect, useState } from "react";
import { useSocket } from "../SocketProvider";

const PlayerStateContext = createContext();

const PlayerStateProvider = ({ children }) => {

  const [playerState, setPlayerState] = useState({});
  const {socket} = useSocket();

  useEffect(() => {
    if (socket) {
      const handlePushState = (state) => {
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
  }, [socket, setPlayerState]);

  return (
    <PlayerStateContext.Provider value={playerState}>
      {children}
    </PlayerStateContext.Provider>
  );
};

export { PlayerStateContext, PlayerStateProvider };
