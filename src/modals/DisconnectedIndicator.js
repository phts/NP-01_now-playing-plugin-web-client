import { useCallback, useEffect, useState } from "react";
import ContextualModal from "../common/ContextualModal";
import { useSocket } from "../contexts/SocketProvider";
import './DisconnectedIndicator.scss';

function DisconnectedIndicator() {

  const {socket} = useSocket();
  const [visible, setVisible] = useState();

  const onConnect = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const onDisconnect = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  useEffect(() => {
    if (socket) {
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
      };
    }
  }, [socket, onConnect, onDisconnect]);

  const modalOverlayClassNames = {
    base: 'DisconnectedIndicatorOverlay',
    afterOpen: 'DisconnectedIndicatorOverlay--after-open',
    beforeClose: 'DisconnectedIndicatorOverlay--before-close'
  };

  const modalClassNames = {
    base: 'DisconnectedIndicator',
    afterOpen: 'DisconnectedIndicator--after-open',
    beforeClose: 'DisconnectedIndicator--before-close'
  };

  return (
    <ContextualModal
      isOpen={ visible }
      closeTimeoutMS={200}
      overlayClassName={modalOverlayClassNames}
      className={modalClassNames}>
        <span className="material-icons DisconnectedIndicator__icon">rotate_right</span>
    </ContextualModal>
  );
}

export default DisconnectedIndicator;
