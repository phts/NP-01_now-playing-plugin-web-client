import { useContext } from "react";
import { CSSTransition } from "react-transition-group";
import { ModalStateContext } from "../contexts/ModalStateProvider";
import { ACTION_PANEL } from "../modals/CommonModals";
import './ScreenWrapper.scss';

const ScreenWrapper = ({ children }) => {

  const {isModalOpened} = useContext(ModalStateContext);

  return (
    <CSSTransition
      in={isModalOpened(ACTION_PANEL)}
      classNames="ScreenWrapper--blur"
      timeout={100}>
        <div className="ScreenWrapper">
          {children}
        </div>
    </CSSTransition>
  );
};

export default ScreenWrapper;
