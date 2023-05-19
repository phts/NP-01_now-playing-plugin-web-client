import TrackInfoText from '../../common/TrackInfoText';
import PlayerButtonGroup from '../../common/PlayerButtonGroup';
import Seekbar from '../../common/Seekbar';
import classNames from 'classnames';
import Image from '../../common/Image';
import styles from './BasicView.module.scss';

function BasicView(props) {
  const { playerState } = props;
  
  // Vertically center-align PlayerButtonGroup if there's no TrackInfoText
  const emptyTrackInfoText =
    (playerState.title === undefined || playerState.title === '') &&
    (playerState.artist === undefined || playerState.artist === '') &&
    (playerState.album === undefined || playerState.album === '');
  const playerButtonGroupClasses = classNames({
    [`${styles.PlayerButtonGroup}`]: true,
    [`${styles['PlayerButtonGroup--vcenter']}`]: emptyTrackInfoText,
    'no-swipe': true
  });

  return (
    <div className={styles.Layout}>
      <div className={styles.AlbumArt}>
        <Image className={styles.AlbumArt__image} src={playerState.albumart} preload />
      </div>
      <div className={styles.MainContents}>
        {!emptyTrackInfoText ?
          <TrackInfoText
            styles={{
              baseClassName: 'TrackInfoText',
              bundle: styles
            }}
            playerState={playerState}
            trackInfoOrder={props.trackInfoOrder}
            marqueeTitle={props.marqueeTitle} />
          : null}
        <PlayerButtonGroup
          className={playerButtonGroupClasses}
          buttonStyles={{
            baseClassName: 'PlayerButton',
            bundle: styles
          }}
          playerState={playerState} />
        {!emptyTrackInfoText ?
          <Seekbar
            styles={{
              baseClassName: 'Seekbar',
              bundle: styles
            }}
            playerState={playerState} />
          : null}
      </div>
    </div>
  );
}

export default BasicView;
