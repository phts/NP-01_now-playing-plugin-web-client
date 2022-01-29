import { useCallback, useContext } from "react";
import { ModalStateContext } from "../contexts/ModalStateProvider";
import ActionPanel from "./ActionPanel";
import VolumeIndicatorPanel from "./VolumeIndicatorPanel";

export const ACTION_PANEL = 'actionPanel';
export const VOLUME_INDICATOR = 'volumeIndicator';

function CommonModals() {
  const { isModalOpened, isModalDisabled, closeModal } = useContext(ModalStateContext);
  
  const closeActionPanel = useCallback(() => {
    closeModal(ACTION_PANEL);
  }, [closeModal]);

  const closeVolumeIndicator = useCallback(() => {
    closeModal(VOLUME_INDICATOR);
  }, [closeModal]);

  return (
    <>
      <ActionPanel
        isOpen={isModalOpened(ACTION_PANEL) && !isModalDisabled(ACTION_PANEL)}
        contentLabel="modal"
        onRequestClose={closeActionPanel}
        closePanel={closeActionPanel} />
      <VolumeIndicatorPanel
        isOpen={isModalOpened(VOLUME_INDICATOR) && !isModalDisabled(VOLUME_INDICATOR)}
        contentLabel="modal"
        onRequestClose={closeVolumeIndicator}
        closePanel={closeVolumeIndicator} />
    </>
  );
}

export default CommonModals;