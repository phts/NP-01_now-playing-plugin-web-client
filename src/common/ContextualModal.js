import Modal from "react-modal/lib/components/Modal";
import { useAppContext } from "../contexts/AppContextProvider";

function ContextualModal(props) {
  const {isKiosk} = useAppContext();
  const disableTransitions = isKiosk;

  const portalClassName = disableTransitions ? 'ReactModalPortal no-transitions' : null;

  return <Modal {...props} portalClassName={portalClassName}>{props.children}</Modal>;
}

export default ContextualModal;
