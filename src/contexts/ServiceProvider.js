import { createContext, useState, useEffect, useContext } from "react";
import BrowseService from "../services/BrowseService";
import MetadataService from "../services/MetadataService";
import PlaylistService from "../services/PlaylistService";
import QueueService from "../services/QueueService";
import { AppContext } from "./AppContextProvider";
import { SocketContext } from "./SocketProvider";

const ServiceContext = createContext();

const initServices = (socket = null, host = null, apiPath = null) => {
  return {
    playlistService: new PlaylistService(socket),
    queueService: new QueueService(socket),
    browseService: new BrowseService(socket, host),
    metadataService: new MetadataService(apiPath)
  };
};

const destroyServices = (services) => {
  services.playlistService.destroy();
  services.queueService.destroy();
  services.browseService.destroy();
  services.metadataService.destroy();
};

const initialServices = initServices();

const ServiceProvider = ({ children }) => {
  const socket = useContext(SocketContext);
  const {host, apiPath} = useContext(AppContext);
  const [services, setServices] = useState(initialServices);

  useEffect(() => {
    setServices(initServices(socket, host, apiPath));
  }, [socket, host, apiPath]);

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
