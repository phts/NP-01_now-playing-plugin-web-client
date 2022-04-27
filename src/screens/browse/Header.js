import classNames from 'classnames';
import Button from '../../common/Button';
import Image from '../../common/Image';
import PopupMenu from '../../common/PopupMenu';
import styles from './Header.module.scss';

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

  const handleButtonClicked = (e) => {
    e.stopPropagation();
    const action = e.currentTarget.dataset.action;
    props.callItemAction(data, null, null, action);
  };

  const handleMenuItemClicked = (e) => {
    e.syntheticEvent.stopPropagation();
    const {action} = e.value;
    props.callItemAction(data, null, null, action);
  };

  const actionComponents = [];
  actionComponents.push((
    <Button 
      key="play"
      styles={{
        baseClassName: 'Button',
        bundle: styles,
        extraClassNames: [styles['Button--play']]
      }}
      icon="play_arrow"
      data-action="play" 
      onClick={handleButtonClicked} />
  ));

  const menuItems = [];
  menuItems.push({
    key: 'addToPlaylist',
    title: 'Add to Playlist',
    icon: 'playlist_add',
    value: { action: 'addToPlaylist' }
  });
  menuItems.push({
    key: 'addToQueue',
    title: 'Add to Queue',
    icon: 'add_to_queue',
    value: { action: 'addToQueue' }
  });
  if (data.type === 'album' || data.type ==='artist' || data.artist || data.album) {
    menuItems.push({
      key: 'viewInfo',
      title: 'View Info',
      icon: 'info',
      value: { action: 'viewInfo' }
    });
  }

  actionComponents.push((
    <PopupMenu
      key='headerMenu'
      styles={{
        baseClassName: 'PopupMenu',
        bundle: styles
      }}
      direction="bottom"
      boundingBoxRef={props.screenRef}
      menuButtonIcon="more_horiz"
      menuItems={menuItems}
      onMenuItemClick={handleMenuItemClicked}
      onMenuOverlay={props.onMenuOverlay} />
  ));

  const headerClassNames = classNames(
    styles.Layout,
    props.screenMaximized ? styles['Layout--maximized'] : null
  );

  return (
    <div className={headerClassNames}>
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
          <div className={styles.Buttons}>{actionComponents}</div>
        </div>
      </div>
    </div>
  );;
}

export default Header;
