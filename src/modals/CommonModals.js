import { useCallback, useContext } from "react";
import { ModalStateContext } from "../contexts/ModalStateProvider";
import ActionPanel from "./ActionPanel";
import AddToPlaylistDialog from "./AddToPlaylistDialog";
import MetadataModal from "./MetadataModal";
import VolumeIndicatorPanel from "./VolumeIndicatorPanel";
import WebRadioDialog from "./WebRadioDialog";

export const ACTION_PANEL = 'actionPanel';
export const VOLUME_INDICATOR = 'volumeIndicator';
export const ADD_TO_PLAYLIST_DIALOG = 'addToPlaylistDialog';
export const WEB_RADIO_DIALOG = 'webRadioDialog';
export const METADATA_MODAL = 'metadataModal';

function CommonModals(props) {
  const { isModalOpened, isModalDisabled, closeModal, getModalData } = useContext(ModalStateContext);
  const {realVh} = props;
  
  const closeActionPanel = useCallback(() => {
    closeModal(ACTION_PANEL);
  }, [closeModal]);

  const closeVolumeIndicator = useCallback(() => {
    closeModal(VOLUME_INDICATOR);
  }, [closeModal]);

  const closeAddToPlaylistDialog = useCallback(() => {
    closeModal(ADD_TO_PLAYLIST_DIALOG);
  }, [closeModal]);

  const closeWebRadioDialog = useCallback(() => {
    closeModal(WEB_RADIO_DIALOG);
  }, [closeModal]);

  const closeMetadataModal = useCallback(() => {
    closeModal(METADATA_MODAL);
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
      <AddToPlaylistDialog
        isOpen={isModalOpened(ADD_TO_PLAYLIST_DIALOG) && !isModalDisabled(ADD_TO_PLAYLIST_DIALOG)}
        contentLabel="dialog"
        onRequestClose={closeAddToPlaylistDialog}
        closeDialog={closeAddToPlaylistDialog}
        modalData={getModalData(ADD_TO_PLAYLIST_DIALOG)} />
      <WebRadioDialog
        isOpen={isModalOpened(WEB_RADIO_DIALOG) && !isModalDisabled(WEB_RADIO_DIALOG)}
        contentLabel="dialog"
        onRequestClose={closeWebRadioDialog}
        closeDialog={closeWebRadioDialog}
        modalData={getModalData(WEB_RADIO_DIALOG)} />
      <MetadataModal
        isOpen={isModalOpened(METADATA_MODAL) && !isModalDisabled(METADATA_MODAL)}
        contentLabel="modal"
        onRequestClose={closeMetadataModal}
        closeDialog={closeMetadataModal}
        modalData={getModalData(METADATA_MODAL)}
        realVh={realVh} />
    </>
  );
}

export default CommonModals;
