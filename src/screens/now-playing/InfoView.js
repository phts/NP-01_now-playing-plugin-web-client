import PlayerButtonGroup from '../../common/PlayerButtonGroup';
import Seekbar from '../../common/Seekbar';
import classNames from 'classnames';
import styles from './InfoView.module.scss';
import MetadataPanel from '../../common/MetadataPanel';

function InfoView(props) {
  const { playerState } = props;

  const playerButtonGroupClasses = classNames(
    [`${styles.PlayerButtonGroup}`],
    'no-swipe'
  );

  return (
    <div className={styles.Layout}>
      <MetadataPanel
        styles={{
          baseClassName: 'MetadataPanel',
          bundle: styles
        }}
        song={playerState.title}
        album={playerState.album}
        artist={playerState.artist}
        placeholderImage={playerState.albumart} />
      <div className={styles.BottomBar}>
        <Seekbar
          styles={{
            baseClassName: 'Seekbar',
            bundle: styles
          }}
          playerState={playerState} />
        <PlayerButtonGroup
          className={playerButtonGroupClasses}
          buttonStyles={{
            baseClassName: 'PlayerButton',
            bundle: styles
          }}
          playerState={playerState} />
      </div>
    </div>
  );
}

export default InfoView;
