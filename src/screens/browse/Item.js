import { useCallback, useRef } from "react";
import Button from "../../common/Button";
import Image from "../../common/Image";
import { secondsToString } from "../../utils/track";
import { getItemActions, hasPlayButton } from "./helper";
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/theme-dark.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { eventPathHasClass } from "../../utils/event";
import PopupMenu from "../../common/PopupMenu";

function Item(props) {
  const itemRef = useRef(null);
  const {styles, data, index} = props;

  const getAlbumArtContents = useCallback((data) => {
    if (data.albumart || (!data.icon && data.tracknumber === undefined)) {
      return (
        <Image className={styles.Item__image} src={data.albumart} />
      );
    }
    else if (data.icon) {
      return (
        <div className={styles.Item__icon}><i className={data.icon}></i></div>
      );
    }
    else { // track number
      return (
        <div className={styles.Item__trackNumber}>{data.tracknumber}</div>
      );
    }
  }, [styles]);

  const title = data.title || data.name || '';
  const album = data.album || '';
  const artist = data.artist || '';
  const duration = data.duration ? secondsToString(data.duration) : '';

  let albumArtist = data.album || '';
  if (data.artist) {
    albumArtist += albumArtist ? ' - ' : '';
    albumArtist += data.artist;
  }

  const handleItemClicked = (e) => {
    if (itemRef.current === null || eventPathHasClass(e.nativeEvent, 'menu-button', itemRef.current)) {
      return;
    }
    e.stopPropagation();
    props.onClick(data, index);
  };

  const handlePlayClicked = (e) => {
    e.stopPropagation();
    props.onPlayClick(data, index);
  };

  const albumartContents = getAlbumArtContents(data);
  const playButton = hasPlayButton(data) ? (
    <Button 
      styles={{
        baseClassName: 'Item__button',
        bundle: styles,
        extraClassNames: [styles['Item__button--play']]
      }}
      icon="play_arrow" 
      onClick={handlePlayClicked} />
  ) : null;

  const getMenu = () => {
    const itemActions = getItemActions(props.location, props.data);
    if (!itemActions || itemActions.length === 0) {
      return null;
    }

    const menuItems = itemActions.map(({action, icon, title}) => ({
      key: `${action}_${index}`,
      value: {
        itemIndex: index,
        action
      },
      icon,
      title
    }));

    const menu = (
      <PopupMenu
        styles={{
          baseClassName: 'PopupMenu',
          bundle: styles,
          extraClassNames: ['menu-button']
        }}
        menuItems={menuItems}
        onMenuItemClick={props.onMenuItemClick}
        onMenuOverlay={props.onMenuOverlay} />
    );

    return menu;
  };

  return (
    <div
      ref={itemRef}
      key={index}
      className={styles.Item}
      onClick={handleItemClicked}>
      <div className={styles.Item__albumart}>{albumartContents}{playButton}</div>
      <div className={styles.Item__titleAlbumArtist}>
        <div className={styles.Item__title} dangerouslySetInnerHTML={{ __html: title }} />
        <div className={styles.Item__album} dangerouslySetInnerHTML={{ __html: album }} />
        <div className={styles.Item__artist} dangerouslySetInnerHTML={{ __html: artist }} />
        <div className={styles.Item__albumArtist} dangerouslySetInnerHTML={{ __html: albumArtist }} />
      </div>
      <div className={styles.Item__duration}>{duration}</div>
      {getMenu()}
    </div>
  );
}

export default Item;
