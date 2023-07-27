import React, { createContext, useContext, useState } from 'react';

export interface SocketContextValue {
  socket: SocketIOClient.Socket | null;
  setSocket: (socket: SocketIOClient.Socket | null) => void;
}

const SocketContext = createContext({} as SocketContextValue);

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [ socket, setSocket ] = useState<SocketIOClient.Socket | null>(null);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

const useSocket = () => useContext(SocketContext);

export { useSocket, SocketProvider };
