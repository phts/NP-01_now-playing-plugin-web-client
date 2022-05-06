import Modal from "react-modal/lib/components/Modal";
import { usePerformanceContext } from "../contexts/SettingsProvider";

function ContextualModal(props) {
  const {disableTransitions} = usePerformanceContext();

  const timeout = disableTransitions ? 0 : props.closeTimeoutMS;

  return <Modal {...props} closeTimeoutMS={timeout}>{props.children}</Modal>;
}

export default ContextualModal;
