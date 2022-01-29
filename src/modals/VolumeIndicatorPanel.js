import Modal from "react-modal/lib/components/Modal";
import VolumeIndicator from "../common/VolumeIndicator";
import './VolumeIndicatorPanel.scss';

function VolumeIndicatorPanel(props) {

  const modalOverlayClassNames = {
    base: 'VolumeIndicatorPanelOverlay',
    afterOpen: 'VolumeIndicatorPanelOverlay--after-open',
    beforeClose: 'VolumeIndicatorPanelOverlay--before-close'
  };

  const modalClassNames = {
    base: 'VolumeIndicatorPanel',
    afterOpen: 'VolumeIndicatorPanel--after-open',
    beforeClose: 'VolumeIndicatorPanel--before-close'
  }

  const {closePanel, ...modalProps} = props;

  return (
    <Modal 
      closeTimeoutMS={200}
      overlayClassName={modalOverlayClassNames}
      className={modalClassNames}
      {...modalProps}>
      <VolumeIndicator onClick={closePanel} />
    </Modal>
  );
}

export default VolumeIndicatorPanel;
