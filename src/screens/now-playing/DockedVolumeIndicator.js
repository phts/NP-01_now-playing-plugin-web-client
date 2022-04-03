import VolumeIndicator from '../../common/VolumeIndicator';
import styles from './DockedVolumeIndicator.module.scss';

function DockedVolumeIndicator(props) {
  const {fontSize, iconSize, fontColor, iconColor, margin} = props;

  const dockedStyles = {
    '--docked-font-size': fontSize,
    '--docked-icon-size': iconSize,
    '--docked-muted-icon-size': iconSize,
    '--docked-font-color': fontColor,
    '--docked-icon-color': iconColor,
    '--docked-margin': margin
  };
  
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
