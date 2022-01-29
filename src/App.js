import './App.scss';
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
import { ThemeProvider } from './contexts/ThemeContext';

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
            <AppStartup />
            <div className="App" style={{ '--vh': vh }}>
              <NotificationProvider>
                <ModalStateProvider>
                  <VolumeChangeListener />
                  <NotificationListener />
                  <DisconnectedIndicator />
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
                    <CommonModals />
                  </ScreenContextProvider>
                </ModalStateProvider>
              </NotificationProvider>
            </div>
          </ThemeProvider>
        </PlayerStateProvider>
      </SocketProvider>
    </AppContextProvider>
  );
}

export default App;
