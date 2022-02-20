import { createContext, useState, useEffect, useContext } from "react";
import PlaylistService from "../services/PlaylistService";
import QueueService from "../services/QueueService";
import { SocketContext } from "./SocketProvider";

const ServiceContext = createContext();

const initServices = (socket = null) => {
  return {
    playlistService: new PlaylistService(socket),
    queueService: new QueueService(socket)
  };
};

const destroyServices = (services) => {
  services.playlistService.destroy();
};

const initialServices = initServices();

const ServiceProvider = ({ children }) => {
  const socket = useContext(SocketContext);
  const [services, setServices] = useState(initialServices);

  useEffect(() => {
    setServices(initServices(socket));
  }, [socket]);

  useEffect(() => {
    return () => {
      destroyServices(services);
    };
  }, [services]);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

export { ServiceContext, ServiceProvider };
