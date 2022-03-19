import ContextualModal from "../common/ContextualModal";
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
    <ContextualModal 
      closeTimeoutMS={200}
      overlayClassName={modalOverlayClassNames}
      className={modalClassNames}
      {...modalProps}>
      <VolumeIndicator onClick={closePanel} />
    </ContextualModal>
  );
}

export default VolumeIndicatorPanel;
