import { useContext, useEffect } from "react";
import Modal from "react-modal/lib/components/Modal";
import { SocketContext } from "./contexts/SocketProvider";
import { getInitialData } from "./utils/init";

const refresh = () => {
  window.location.reload();
};

function AppStartup() {
  const socket = useContext(SocketContext);
  const pluginVersion = getInitialData('pluginVersion');
  const appPort = getInitialData('appPort');

  useEffect(() => {
    if (socket) {
      const onSocketConnected = () => {
        socket.emit('getState');
        socket.emit('getBrowseSources');
        socket.emit('getQueue');
        socket.emit("callMethod", {
          endpoint: "user_interface/now_playing",
          method: "broadcastPluginInfo",
        });
      };

      const onPluginInfo = (info) => {
        if (appPort && `${info.appPort}` !== `${appPort}`) {
          const href = window.location.href.replace(
            `:${ appPort }`,
            `:${ info.appPort }`
          );
          window.location.href = href;
        } else if (pluginVersion && info.pluginVersion !== pluginVersion) {
          refresh();
        }
      };

      ['connect', 'reconnect'].forEach(event => {
        socket.on(event, onSocketConnected);
      });

      socket.on('nowPlayingPluginInfo', onPluginInfo);
      socket.on("nowPlayingRefresh", refresh);
      
      socket.connect();

      return () => {
        ['connect', 'reconnect'].forEach(event => {
          socket.off(event, onSocketConnected);
        });

        socket.off('nowPlayingPluginInfo', onPluginInfo);
        socket.off("nowPlayingRefresh", refresh);
      }
    }
  }, [socket, appPort, pluginVersion]);

  Modal.setAppElement('#root');

  return null;
}

export default AppStartup;
