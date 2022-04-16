import VolumeIndicator from '../../common/VolumeIndicator';
import { useRawSettings } from '../../contexts/SettingsProvider';
import styles from './DockedVolumeIndicator.module.scss';

function DockedVolumeIndicator() {
  const {settings: screenSettings} = useRawSettings('screen.nowPlaying');
  const settings = screenSettings.dockedVolumeIndicator || {};

  const dockedStyles = {
    '--docked-margin': settings.margin
  };
  if (settings.fontSettings === 'custom') {
    Object.assign(dockedStyles, {
      '--docked-font-size': settings.fontSize,
      '--docked-font-color': settings.fontColor
    });
  }
  if (settings.iconSettings === 'custom') {
    Object.assign(dockedStyles, {
      '--docked-icon-size': settings.iconSize,
      '--docked-muted-icon-size': settings.iconSize,
      '--docked-icon-color': settings.iconColor
    });
  }

  return (
    <div style={dockedStyles}>
      <VolumeIndicator
        showDial={false}
        styles={{
          baseClassName: 'DockedVolumeIndicator',
          bundle: styles
        }} />
    </div>
  );
}

export default DockedVolumeIndicator;
