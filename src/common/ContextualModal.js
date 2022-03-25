import Modal from "react-modal/lib/components/Modal";
import { usePerformanceSettings } from "../contexts/SettingsProvider";

function ContextualModal(props) {
  const {disableTransitions} = usePerformanceSettings();

  const portalClassName = disableTransitions ? 'ReactModalPortal no-transitions' : null;

  return <Modal {...props} portalClassName={portalClassName}>{props.children}</Modal>;
}

export default ContextualModal;
