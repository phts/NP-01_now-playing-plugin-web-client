import React from 'react';
import { AppContext } from '../../../contexts/AppContextProvider';
import { SocketContext } from '../../../contexts/SocketProvider';
import { PlayerStateContext } from '../../../contexts/player/PlayerStateProvider';
import { Stage } from '@pixi/react';
import { PlayerSeekContext } from '../../../contexts/player/PlayerSeekProvider';

const ContextBridge = ({ children, render }) => {
  return (
    <AppContext.Consumer>
      {(appContextValue) => (
        <PlayerStateContext.Consumer>
          {(playerStateContextValue) => (
            <PlayerSeekContext.Consumer>
              {(playerSeekContextValue) => (
                <SocketContext.Consumer>
                  {(socketContextValue) => render(
                    <AppContext.Provider value={appContextValue}>
                      <PlayerStateContext.Provider value={playerStateContextValue}>
                        <PlayerSeekContext.Provider value={playerSeekContextValue}>
                          <SocketContext.Provider value={socketContextValue}>
                            {children}
                          </SocketContext.Provider>
                        </PlayerSeekContext.Provider>
                      </PlayerStateContext.Provider>
                    </AppContext.Provider>
                  )
                  }
                </SocketContext.Consumer>
              )}
            </PlayerSeekContext.Consumer>
          )}
        </PlayerStateContext.Consumer>
      )}
    </AppContext.Consumer>
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
