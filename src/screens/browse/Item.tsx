import React, { SyntheticEvent, useCallback, useRef } from 'react';
import Button from '../../common/Button';
import Image from '../../common/Image';
import { secondsToString } from '../../utils/track';
import { getItemActions, hasPlayButton } from './helper';
import { eventPathHasClass } from '../../utils/event';
import PopupMenu, { PopupMenuItem, PopupMenuProps } from '../../common/PopupMenu';
import { useTranslation } from 'react-i18next';
import { BrowseContentsListItem, BrowseServiceLocation, BrowseSource } from '../../services/BrowseService';

export interface BrowseScreenItemProps {
  styles: Record<string, any>;
  data: BrowseContentsListItem | BrowseSource;
  index: number;
  location: BrowseServiceLocation;
  onClick: (data: BrowseContentsListItem | BrowseSource, index: number) => void;
  onPlayClick: (data: BrowseContentsListItem | BrowseSource, index: number) => void;
  onMenuItemClick: PopupMenuProps['onMenuItemClick'];
  onMenuOverlay: PopupMenuProps['onMenuOverlay'];
}

function Item(props: BrowseScreenItemProps) {
  const itemRef = useRef(null);
  const { styles, data, index } = props;
  const { t } = useTranslation();

  const getAlbumArtContents = useCallback((data: BrowseContentsListItem) => {
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
    // Track number
    return (
      <div className={styles.Item__trackNumber}>{data.tracknumber}</div>
    );

  }, [ styles ]);

  const intersectedData = data as BrowseContentsListItem & BrowseSource;

  const title = intersectedData.title || intersectedData.name || '';
  const album = intersectedData.album || '';
  const artist = intersectedData.artist || '';
  const duration = intersectedData.duration ? secondsToString(intersectedData.duration) : '';

  let albumArtist = intersectedData.album || '';
  if (intersectedData.artist) {
    albumArtist += albumArtist ? ' - ' : '';
    albumArtist += intersectedData.artist;
  }

  const handleItemClicked = (e: SyntheticEvent) => {
    if (itemRef.current === null || eventPathHasClass(e.nativeEvent, 'menu-button', itemRef.current)) {
      return;
    }
    e.stopPropagation();
    props.onClick(data, index);
  };

  const handlePlayClicked = (e: SyntheticEvent) => {
    e.stopPropagation();
    props.onPlayClick(data, index);
  };

  const albumartContents = getAlbumArtContents(data);
  const playButton = hasPlayButton(data) ? (
    <Button
      styles={{
        baseClassName: 'Item__button',
        bundle: styles,
        extraClassNames: [ styles['Item__button--play'] ]
      }}
      icon="play_arrow"
      onClick={handlePlayClicked} />
  ) : null;

  const getMenu = () => {
    const itemActions = getItemActions(props.location, props.data);
    if (!itemActions || itemActions.length === 0) {
      return null;
    }

    const menuItems = itemActions.map<PopupMenuItem>(({ action, icon }) => ({
      type: 'item',
      key: `${action}_${index}`,
      value: {
        itemIndex: index,
        action
      },
      icon,
      title: t(`action.${action}`)
    }));

    const menu = (
      <PopupMenu
        styles={{
          baseClassName: 'PopupMenu',
          bundle: styles,
          extraClassNames: [ 'menu-button' ]
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
