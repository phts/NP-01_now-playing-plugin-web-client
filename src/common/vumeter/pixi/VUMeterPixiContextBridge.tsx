import React from 'react';
import { SocketContext, SocketProvider } from '../../../contexts/SocketProvider';
import { PlayerStateProvider } from '../../../contexts/player/PlayerStateProvider';
import { Stage } from '@pixi/react';

const ContextBridge = ({ children, render }) => {
  return (
    <SocketContext.Consumer>
      {(value) => render(
        <SocketContext.Provider value={value}>
          {children}
        </SocketContext.Provider>
      )
      }

    </SocketContext.Consumer>
  );
};

const VUMeterPixiStage = ({ children, ...props }) => {
  return (
    <ContextBridge
      render={(children: React.ReactNode) => <Stage {...props}>{children}</Stage>}
    >
      {children}
    </ContextBridge>
  );
};

export default VUMeterPixiStage;
