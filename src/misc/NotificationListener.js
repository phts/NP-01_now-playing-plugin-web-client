import { useContext, useEffect } from "react";
import { SocketContext } from '../contexts/SocketProvider';
import { NotificationContext } from '../contexts/NotificationProvider';

function NotificationListener() {

  const socket = useContext(SocketContext);
  const showToast = useContext(NotificationContext);

  useEffect(() => {
    if (socket) {
      socket.on('pushToastMessage', showToast);

      return () => {
        socket.off('pushToastMessage', showToast);
      };
    }
  }, [socket, showToast])  
  
  return null;
}

export default NotificationListener;