import Button from "../../common/Button";
import { useRawSettings } from "../../contexts/SettingsProvider";
import styles from "./DockedActionPanelTrigger.module.scss";

function DockedActionPanelTrigger(props) {
  const {settings: screenSettings} = useRawSettings('screen.nowPlaying');

  const triggerSettings = screenSettings.dockedActionPanelTrigger || {};
  const {iconStyle, iconSize, iconColor, opacity, margin} = triggerSettings;

  const dockedStyles = {
    '--docked-icon-size': iconSize,
    '--docked-icon-color': iconColor,
    '--docked-opacity': opacity,
    '--docked-margin': margin
  };

  return (
    <div className={styles.DockedActionPanelTriggerWrapper} style={dockedStyles}>
      <Button
        styles={{
          baseClassName: 'DockedActionPanelTrigger',
          bundle: styles
        }}
        onClick={props.onClick}
        icon={iconStyle || 'expand_more'} />
    </div>
  );
}

export default DockedActionPanelTrigger;
