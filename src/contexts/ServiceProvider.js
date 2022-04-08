import { createContext, useEffect, useContext, useMemo } from "react";
import BrowseService from "../services/BrowseService";
import MetadataService from "../services/MetadataService";
import PlaylistService from "../services/PlaylistService";
import QueueService from "../services/QueueService";
import WeatherService from "../services/WeatherService";
import { useAppContext } from "./AppContextProvider";
import { useSocket } from "./SocketProvider";

const ServiceContext = createContext();

const ServiceProvider = ({ children }) => {
  const {socket} = useSocket();
  const {pluginInfo} = useAppContext();

  const services = useMemo(() => ({
    playlistService: new PlaylistService(),
    queueService: new QueueService(),
    browseService: new BrowseService(),
    metadataService: new MetadataService(),
    weatherService: new WeatherService()
  }), []);
  
  const apiPath = pluginInfo ? pluginInfo.apiPath : null;

  useEffect(() => {
    services.playlistService.setSocket(socket);
    services.queueService.setSocket(socket);
    services.browseService.setSocket(socket);
  }, [socket, services]);

  useEffect(() => {
    services.metadataService.setApiPath(apiPath);
    services.weatherService.setApiPath(apiPath);
  }, [apiPath, services]);

  return (
    <ServiceContext.Provider value={services}>
        {children}
    </ServiceContext.Provider>
  );
};

const useService = (serviceName) => useContext(ServiceContext)[serviceName];
const usePlaylistService = () => useService('playlistService');
const useQueueService = () => useService('queueService');
const useBrowseService = () => useService('browseService');
const useMetadataService = () => useService('metadataService');
const useWeatherService = () => useService('weatherService');

export { usePlaylistService, useQueueService, useBrowseService, useMetadataService, useWeatherService, ServiceProvider };
