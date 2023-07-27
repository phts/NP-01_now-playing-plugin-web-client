import { useEffect, useRef } from 'react';
import ReactModal from 'react-modal';
import { PluginInfo, useAppContext } from './contexts/AppContextProvider';
import { useSocket } from './contexts/SocketProvider';
import io from 'socket.io-client';
import { usePerformanceContext } from './contexts/SettingsProvider';

const refresh = () => {
  window.location.reload();
};

function AppStartup() {
  const {host, pluginInfo, setPluginInfo} = useAppContext();
  const {disableTransitions} = usePerformanceContext();
  const {socket, setSocket} = useSocket();
  const currentPluginInfo = useRef<PluginInfo | null>(null);

  useEffect(() => {
    if (host) {
      const _socket = io.connect(host, { autoConnect: false });
      setSocket(_socket);

      return (() => {
        _socket.disconnect();
      });
    }
  }, [ host, setSocket ]);

  useEffect(() => {
    if (disableTransitions) {
      document.body.classList.add('no-transitions');
    }

    return () => {
      document.body.classList.remove('no-transitions');
    };
  }, [ disableTransitions ]);

  useEffect(() => {
    if (socket) {
      const onSocketConnected = () => {
        socket.emit('callMethod', {
          endpoint: 'user_interface/now_playing',
          method: 'getPluginInfo'
        });
      };

      [ 'connect', 'reconnect' ].forEach((event) => {
        socket.on(event, onSocketConnected);
      });

      socket.on('nowPlayingPluginInfo', setPluginInfo);
      socket.on('nowPlayingRefresh', refresh);

      socket.connect();

      return () => {
        [ 'connect', 'reconnect' ].forEach((event) => {
          socket.off(event, onSocketConnected);
        });

        socket.off('nowPlayingPluginInfo', setPluginInfo);
        socket.off('nowPlayingRefresh', refresh);
      };
    }
  }, [ socket, setPluginInfo ]);

  useEffect(() => {
    // Plugin info updated - compare and decide whether to reload
    if (pluginInfo && currentPluginInfo.current) {
      const current = currentPluginInfo.current;
      if (pluginInfo.appUrl !== current.appUrl &&
        window.location.href.startsWith(current.appUrl)) {
        window.location.href = pluginInfo.appUrl;
      }
      else if (pluginInfo.version !== current.version) {
        refresh();
      }
    }
    currentPluginInfo.current = pluginInfo;
  }, [ pluginInfo ]);

  ReactModal.setAppElement('#root');

  return null;
}

export default AppStartup;
