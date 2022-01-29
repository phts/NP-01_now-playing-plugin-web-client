import { createContext, useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContextProvider";
import io from "socket.io-client";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const {host} = useContext(AppContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (host) {
      const _socket = io.connect(host, { autoConnect: false });
      setSocket(_socket);

      return (() => {
        _socket.disconnect();
      });
    }
  }, [host]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
