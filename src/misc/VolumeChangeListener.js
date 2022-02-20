import { useContext, useEffect, useRef } from "react";
import { ModalStateContext } from "../contexts/ModalStateProvider";
import { PlayerStateContext } from "../contexts/PlayerStateProvider";
import { VOLUME_INDICATOR } from "../modals/CommonModals";

const AUTO_CLOSE = 1500;

function VolumeChangeListener() {
  const {openModal} = useContext(ModalStateContext);
  const playerState = useContext(PlayerStateContext);
  const oldVolumeRef = useRef(null);

  useEffect(() => {
    if (playerState.volume === undefined) {
      return;
    }
    const oldVolume = oldVolumeRef.current;
    const volumeChanged = oldVolume ? 
      (oldVolume.level !== playerState.volume || oldVolume.mute !== playerState.mute)
      : true;
    if (volumeChanged) {
      oldVolumeRef.current = {
        level: playerState.volume,
        mute: playerState.mute
      };
      if (oldVolume) {
        openModal(VOLUME_INDICATOR, { autoClose: AUTO_CLOSE });
      }
    }
  }, [playerState.volume, playerState.mute, openModal])
  
  
  return null;
}

export default VolumeChangeListener;