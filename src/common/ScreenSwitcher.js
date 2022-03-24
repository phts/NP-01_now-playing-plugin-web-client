import { useCallback } from 'react';
import { useScreens } from '../contexts/ScreenContextProvider';
import Button from './Button';
import styles from './ScreenSwitcher.module.scss';

function ScreenSwitcher(props) {
  const {activeScreenId, switchScreen} = useScreens();
  
  const onSwitch = props.onSwitch;
  const handleSwitchClicked = useCallback((e) => {
    const screenId = e.currentTarget.dataset.screen;
    switchScreen({
      screenId
    });
    if (onSwitch) {
      onSwitch(screenId);
    }
  }, [switchScreen, onSwitch]);

  const getSwitchStyles = (screenId) => {
    return {
      baseClassName: 'Switch',
      bundle: styles,
      extraClassNames: (screenId === activeScreenId) ? [styles['Switch--active']] : null
    };
  };

  return (
    <div className={styles.Layout}>
      <div className={styles.LabelWrapper}>
        <div className={styles.Label}><span className="material-icons">tv</span></div>
      </div>
      <div className={styles.SwitchesWrapper}>
        <Button 
          styles={getSwitchStyles('Browse')} 
          icon="library_music" 
          data-screen="Browse" 
          onClick={handleSwitchClicked} />
        <Button 
          styles={getSwitchStyles('NowPlaying')} 
          icon="art_track" 
          data-screen="NowPlaying" 
          onClick={handleSwitchClicked} />
        <Button 
          styles={getSwitchStyles('Queue')} 
          icon="queue_music" 
          data-screen="Queue" 
          onClick={handleSwitchClicked} />
      </div>
    </div>
  )
}

export default ScreenSwitcher;
