import './App.scss';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/theme-dark.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import NowPlayingScreen from './screens/now-playing/NowPlayingScreen';
import { AppContextProvider } from "./contexts/AppContextProvider";
import { SocketProvider } from "./contexts/SocketProvider";
import AppStartup from "./AppStartup";
import { ModalStateProvider } from './contexts/ModalStateProvider';
import { PlayerStateProvider } from './contexts/PlayerStateProvider';
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
import { ThemeProvider } from './contexts/ThemeProvider';
import { ServiceProvider } from './contexts/ServiceProvider';
import { StylesProvider } from './contexts/StylesProvider';

function App() {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleWindowResized = () => {
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleWindowResized);

    return () => { window.removeEventListener('resize', handleWindowResized); };
  }, []);

  const vh = (height * 0.01) + 'px';

  return (
    <AppContextProvider>
      <SocketProvider>
        <PlayerStateProvider>
          <ThemeProvider>
            <StylesProvider>
              <AppStartup />
              <div className="App" style={{ '--vh': vh }}>
                <NotificationProvider>
                  <ModalStateProvider>
                    <VolumeChangeListener />
                    <NotificationListener />
                    <DisconnectedIndicator />
                    <ServiceProvider>
                      <ScreenContextProvider>
                        <NowPlayingScreen
                          screenId="NowPlaying"
                          defaultActive={true} />
                        <BrowseScreen
                          screenId="Browse"
                          usesTrackBar={true} />
                        <QueueScreen
                          screenId="Queue"
                          float={true}
                          usesTrackBar={true} />
                        <VolumioScreen
                          screenId="Volumio"
                          mountOnEnter={true}
                          unmountOnExit={true} />
                        <CommonModals realVh={vh}/>
                      </ScreenContextProvider>
                    </ServiceProvider>
                  </ModalStateProvider>
                </NotificationProvider>
              </div>
            </StylesProvider>
          </ThemeProvider>
        </PlayerStateProvider>
      </SocketProvider>
    </AppContextProvider>
  );
}

export default App;
