import Modal from "react-modal/lib/components/Modal";
import { usePerformanceContext } from "../contexts/SettingsProvider";

function ContextualModal(props) {
  const {disableTransitions} = usePerformanceContext();

  const portalClassName = disableTransitions ? 'ReactModalPortal no-transitions' : null;

  return <Modal {...props} portalClassName={portalClassName}>{props.children}</Modal>;
}

export default ContextualModal;
