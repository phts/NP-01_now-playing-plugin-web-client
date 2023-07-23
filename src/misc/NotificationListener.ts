import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketProvider';
import { useToasts } from '../contexts/NotificationProvider';

function NotificationListener() {

  const {socket} = useSocket();
  const showToast = useToasts();

  useEffect(() => {
    if (socket) {
      socket.on('pushToastMessage', showToast);

      return () => {
        socket.off('pushToastMessage', showToast);
      };
    }
  }, [ socket, showToast ]);

  return null;
}

export default NotificationListener;
