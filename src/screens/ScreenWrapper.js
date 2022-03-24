import ContextualCSSTransition from "../common/ContextualCSSTransition";
import { useModals } from "../contexts/ModalStateProvider";
import { ACTION_PANEL } from "../modals/CommonModals";
import './ScreenWrapper.scss';

const ScreenWrapper = ({ children }) => {

  const {isModalOpened} = useModals();

  return (
    <ContextualCSSTransition
      in={isModalOpened(ACTION_PANEL)}
      classNames="ScreenWrapper--blur"
      timeout={100}>
        <div className="ScreenWrapper">
          {children}
        </div>
    </ContextualCSSTransition>
  );
};

export default ScreenWrapper;
