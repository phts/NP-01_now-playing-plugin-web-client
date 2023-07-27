/// <reference types="../../declaration.d.ts" />

import React, { SyntheticEvent } from 'react';
import classNames from 'classnames';
import Button from '../../common/Button';
import Image from '../../common/Image';
import PopupMenu, { PopupMenuItem, PopupMenuProps } from '../../common/PopupMenu';
import styles from './Header.module.scss';
import { BrowseContentsHeader } from '../../services/BrowseService';
import { ClickEvent } from '@szhsin/react-menu';

export interface BrowseScreenHeaderProps {
  info: BrowseContentsHeader;
  screenMaximized: boolean;
  screenRef: PopupMenuProps['boundingBoxRef'];
  onMenuOverlay?: PopupMenuProps['onMenuOverlay'];
  callItemAction: (item: BrowseContentsHeader, action: string) => void;
}

function Header(props: BrowseScreenHeaderProps) {
  const data = props.info;
  const excludeItemTypes = [
    'play-playlist'
  ];

  if (data.type && excludeItemTypes.includes(data.type)) {
    return null;
  }

  const titleText = data.title || data.album || data.artist || '';
  const titleIsArtist = !data.title && !data.album && data.artist;
  const artistText = titleIsArtist ? '' : data.artist || '';
  const extraProps: Array<keyof BrowseContentsHeader> = [ 'year', 'duration', 'genre', 'trackType' ];
  const extra = extraProps.reduce<React.JSX.Element[]>((prev, field) => {
    if (data[field]) {
      prev.push(<span key={field}>{data[field]}</span>);
      prev.push(<span key={`${field}-separator`} className={styles['Info__extra--separator']}>&#8231;</span>);
    }
    return prev;
  }, []);

  const handleButtonClicked = (e: SyntheticEvent) => {
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    if (el.dataset.action) {
      props.callItemAction(data, el.dataset.action);
    }
  };

  const handleMenuItemClicked = (e: ClickEvent) => {
    e.syntheticEvent.stopPropagation();
    const { action } = e.value;
    props.callItemAction(data, action);
  };

  const actionComponents: React.JSX.Element[] = [];
  actionComponents.push((
    <Button
      key="play"
      styles={{
        baseClassName: 'Button',
        bundle: styles,
        extraClassNames: [ styles['Button--play'] ]
      }}
      icon="play_arrow"
      data-action="play"
      onClick={handleButtonClicked} />
  ));

  const menuItems: PopupMenuItem[] = [];
  menuItems.push({
    type: 'item',
    key: 'addToPlaylist',
    title: 'Add to Playlist',
    icon: 'playlist_add',
    value: { action: 'addToPlaylist' }
  });
  menuItems.push({
    type: 'item',
    key: 'addToQueue',
    title: 'Add to Queue',
    icon: 'add_to_queue',
    value: { action: 'addToQueue' }
  });
  if (data.type === 'album' || data.type === 'artist' || data.artist || data.album) {
    menuItems.push({
      type: 'item',
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
  );
}

export default Header;
