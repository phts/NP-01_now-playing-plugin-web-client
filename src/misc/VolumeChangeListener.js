import { useEffect, useRef } from "react";
import { useModals } from "../contexts/ModalStateProvider";
import { usePlayerState } from "../contexts/PlayerStateProvider";
import { VOLUME_INDICATOR } from "../modals/CommonModals";

const AUTO_CLOSE = 1500;

function VolumeChangeListener() {
  const {openModal} = useModals();
  const playerState = usePlayerState();
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