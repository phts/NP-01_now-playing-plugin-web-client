import ContextualCSSTransition from "../common/ContextualCSSTransition";
import { useModals } from "../contexts/ModalStateProvider";
import { usePerformanceSettings } from "../contexts/SettingsProvider";
import { ACTION_PANEL } from "../modals/CommonModals";
import './ScreenWrapper.scss';

const ScreenWrapper = ({ children }) => {

  const {isModalOpened} = useModals();
  const {disableTransitions} = usePerformanceSettings();

  return (
    <ContextualCSSTransition
      in={isModalOpened(ACTION_PANEL)}
      classNames={!disableTransitions ? "ScreenWrapper--blur" : "ScreenWrapper--dim"}
      timeout={100}>
        <div className="ScreenWrapper">
          {children}
        </div>
    </ContextualCSSTransition>
  );
};

export default ScreenWrapper;
