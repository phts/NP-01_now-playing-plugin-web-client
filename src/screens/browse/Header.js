import Button from '../../common/Button';
import Image from '../../common/Image';
import styles from './Header.module.scss';
import { hasPlayButton } from './helper';

function Header(props) {
  const data = props.info;

  const excludeItemTypes = [
    'play-playlist'
  ];

  if (excludeItemTypes.includes(data.type)) {
    return null;
  }

  const titleText = data.title || data.album || data.artist || '';
  const titleIsArtist = !data.title && !data.album && data.artist;
  const artistText = titleIsArtist ? '' : data.artist || '';
  const extraProps = ['year', 'duration', 'genre', 'trackType'];
  const extra = extraProps.reduce((prev, field) => {
    if (data[field]) {
      prev.push(<span key={field}>{data[field]}</span>);
      prev.push(<span key={`${field}-separator`} className={styles['Info__extra--separator']}>&#8231;</span>);
    }
    return prev;
  }, []);

  const handlePlayClicked = (e) => {
    e.stopPropagation();
    props.onPlayClick(data);
  };

  const buttons = [];
  if (hasPlayButton(data)) {
    buttons.push((
      <Button 
        key="play"
        styles={{
          baseClassName: 'Button',
          bundle: styles,
          extraClassNames: [styles['Button--play']]
        }}
        icon="play_arrow"
        text="Play"
        data-action="play" 
        onClick={handlePlayClicked} />
    ));
  }

  return (
    <div className={styles.Layout}>
      <div className={styles.Layout__background}>
        <Image className={styles.BackgroundImage} src={data.albumart} />
      </div>
      <div className={styles.Layout__contents}>
        <div className={styles.AlbumArt}>
          <Image className={styles.AlbumArt__image} src={data.albumart} />
        </div>
        <div className={styles.Info}>
          <div className={styles.Info__title}>{titleText}</div>
          <div className={styles.Info__artist}>{artistText}</div>
          <div className={styles.Info__extra}>{extra}</div>
          <div className={styles.Buttons}>{buttons}</div>
        </div>
      </div>
    </div>
  );;
}

export default Header;
