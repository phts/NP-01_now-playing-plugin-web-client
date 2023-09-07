import React from 'react';
import { AppContext } from '../../../contexts/AppContextProvider';
import { SocketContext } from '../../../contexts/SocketProvider';
import { PlayerStateContext } from '../../../contexts/player/PlayerStateProvider';
import { Stage } from '@pixi/react';
import { PlayerSeekContext } from '../../../contexts/player/PlayerSeekProvider';
import { VUMeterPixiTickerProvider } from './VUMeterPixiTickerProvider';

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

  const render = (children: React.ReactNode) => (
    <Stage
      {...props}
      raf={false}
      renderOnComponentChange={true}
      options={{
        antialias: true,
        resolution: window.devicePixelRatio
      }}
    >
      {children}
    </Stage>
  );

  return (
    <ContextBridge render={render}>
      <VUMeterPixiTickerProvider>
        {children}
      </VUMeterPixiTickerProvider>
    </ContextBridge>
  );
};

export default VUMeterPixiStage;
