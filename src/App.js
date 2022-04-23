import './App.scss';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/theme-dark.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import NowPlayingScreen from './screens/now-playing/NowPlayingScreen';
import { AppContextProvider } from "./contexts/AppContextProvider";
import { SocketProvider } from "./contexts/SocketProvider";
import AppStartup from "./AppStartup";
import { ModalStateProvider } from './contexts/ModalStateProvider';
import VolumeChangeListener from './misc/VolumeChangeListener';
import NotificationListener from './misc/NotificationListener';
import DisconnectedIndicator from './modals/DisconnectedIndicator';
import BrowseScreen from './screens/browse/BrowseScreen';
import { NotificationProvider } from './contexts/NotificationProvider';
import { ScreenContextProvider } from './contexts/ScreenContextProvider';
import QueueScreen from './screens/queue/QueueScreen';
import { useEffect, useState } from 'react';
import CommonModals from './modals/CommonModals';
import VolumioScreen from './screens/volumio/VolumioScreen';
import { ServiceProvider } from './contexts/ServiceProvider';
import { StoreProvider } from './contexts/StoreProvider';
import { SettingsProvider } from './contexts/SettingsProvider';
import { PlayerProvider } from './contexts/PlayerProvider';
import { WeatherProvider } from './contexts/WeatherProvider';

function App() {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const setRealVh = () => {
      const realVh = (window.innerHeight * 0.01) + 'px';
      document.body.style.setProperty('--vh', realVh);
    };

    setRealVh();
    window.addEventListener('resize', setRealVh);

    return () => { window.removeEventListener('resize', setRealVh); };
  }, []);

  //const vh = (height * 0.01) + 'px';

  return (
    <AppContextProvider>
      <StoreProvider>
        <SocketProvider>
          <PlayerProvider>
            <SettingsProvider>
              <AppStartup />
              <div className="App">
                <NotificationProvider>
                  <ModalStateProvider>
                    <VolumeChangeListener />
                    <NotificationListener />
                    <DisconnectedIndicator />
                    <ServiceProvider>
                      <WeatherProvider>
                        <ScreenContextProvider>
                          <NowPlayingScreen
                            screenId="NowPlaying"
                            defaultActive
                            mountOnEnter
                            unmountOnExit />
                          <BrowseScreen
                            screenId="Browse"
                            usesTrackBar
                            mountOnEnter />
                          <QueueScreen
                            screenId="Queue"
                            float
                            usesTrackBar
                            mountOnEnter />
                          <VolumioScreen
                            screenId="Volumio"
                            mountOnEnter
                            unmountOnExit />
                          <CommonModals />
                        </ScreenContextProvider>
                      </WeatherProvider>
                    </ServiceProvider>
                  </ModalStateProvider>
                </NotificationProvider>
              </div>
            </SettingsProvider>
          </PlayerProvider>
        </SocketProvider>
      </StoreProvider>
    </AppContextProvider>
  );
}

export default App;
