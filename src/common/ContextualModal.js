import { useContext } from "react";
import Modal from "react-modal/lib/components/Modal";
import { AppContext } from "../contexts/AppContextProvider";

function ContextualModal(props) {
  const {isKiosk} = useContext(AppContext);
  const disableTransitions = isKiosk;

  const portalClassName = disableTransitions ? 'ReactModalPortal no-transitions' : null;

  return <Modal {...props} portalClassName={portalClassName}>{props.children}</Modal>;
}

export default ContextualModal;
