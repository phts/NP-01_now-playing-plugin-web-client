import classNames from 'classnames';
import { useAppContext } from '../../contexts/AppContextProvider';
import { useScreens } from '../../contexts/ScreenContextProvider';
import styles from './VolumioScreen.module.scss';

function VolumioScreen(props) {
  const {host} = useAppContext();
  const {exitActiveScreen} = useScreens();

  const layoutClasses = classNames([
    styles.Layout,
    props.className
  ])

  return (
    <div className={layoutClasses}>
      <div className={styles.Layout__header}>
        <span className={styles.CloseLink} onClick={exitActiveScreen}>Close</span>
      </div>
      <div className={styles.Layout__contents}>
        <iframe title="Volumio Interface" className={styles.VolumioFrame} src={host}></iframe>
      </div>
    </div>
  );
}

export default VolumioScreen;