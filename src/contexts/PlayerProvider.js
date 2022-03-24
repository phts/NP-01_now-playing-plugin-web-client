import { useContext } from "react";
import { PlayerSeekContext, PlayerSeekProvider } from "./player/PlayerSeekProvider";
import { PlayerStateContext, PlayerStateProvider } from "./player/PlayerStateProvider";

const PlayerProvider = ({ children }) => {
  return (
    <PlayerStateProvider>
      <PlayerSeekProvider>
        {children}
      </PlayerSeekProvider>
    </PlayerStateProvider>
  );
};

const usePlayerState = () => useContext(PlayerStateContext);
const usePlayerSeek = () => useContext(PlayerSeekContext);

export { usePlayerState, usePlayerSeek, PlayerProvider };
