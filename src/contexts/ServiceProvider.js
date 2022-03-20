import { createContext, useEffect, useContext, useMemo } from "react";
import BrowseService from "../services/BrowseService";
import MetadataService from "../services/MetadataService";
import PlaylistService from "../services/PlaylistService";
import QueueService from "../services/QueueService";
import { AppContext } from "./AppContextProvider";
import { SocketContext } from "./SocketProvider";

const ServiceContext = createContext();

const ServiceProvider = ({ children }) => {
  const {socket} = useContext(SocketContext);
  const {pluginInfo} = useContext(AppContext);

  const services = useMemo(() => ({
    playlistService: new PlaylistService(),
    queueService: new QueueService(),
    browseService: new BrowseService(),
    metadataService: new MetadataService()
  }), []);
  
  const apiPath = pluginInfo ? pluginInfo.apiPath : null;

  useEffect(() => {
    services.playlistService.setSocket(socket);
    services.queueService.setSocket(socket);
    services.browseService.setSocket(socket);
  }, [socket, services]);

  useEffect(() => {
    services.metadataService.setApiPath(apiPath);
  }, [apiPath, services]);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

export { ServiceContext, ServiceProvider };
