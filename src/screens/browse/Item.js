import { ControlledMenu, MenuItem, useMenuState } from "@szhsin/react-menu";
import { useCallback, useEffect, useRef } from "react";
import Button from "../../common/Button";
import Image from "../../common/Image";
import { secondsToString } from "../../utils/track";
import { getMenuItems, hasPlayButton } from "./helper";
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/theme-dark.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { eventPathHasClass } from "../../utils/event";
import classNames from "classnames";

function Item(props) {
  const itemRef = useRef(null);
  const menuButtonRef = useRef();
  const menuOverlayRef = useRef();
  const { toggleMenu, ...menuProps } = useMenuState({ transition: true });
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

  const openMenu = useCallback((e) => {
    e.preventDefault();
    toggleMenu(true);
  }, [toggleMenu]);

  const closeMenu = useCallback(() => {
    toggleMenu(false);
  }, [toggleMenu]);

  const menuOpened = menuProps.state !== undefined && menuProps.state !== 'closed';

  const getMenu = () => {
    const menuItems = getMenuItems(props.location, props.data);
    if (!menuItems || menuItems.length === 0) {
      return null;
    }

    const menu = (
      <ControlledMenu 
        {...menuProps}
        anchorRef={menuButtonRef}
        onClose={closeMenu}
        unmountOnClose
        theming='dark'
        align='start'
        position='anchor'
        direction='left'
        onItemClick={props.onMenuItemClick}
      >
        {menuItems.map(item => {
          return (
            <MenuItem 
              key={`${item.action}_${index}`}
              value={{
                itemIndex: index,
                action: item.action
              }}>
                {item.icon ? 
                  (<span className={classNames('material-icons', styles['Item__menuItemIcon'])}>{item.icon}</span>) 
                  : null }
                {item.title}
            </MenuItem>
          )
        })}
      </ControlledMenu>
    );

    return menu;
  };

  const menu = getMenu();

  const supportsHover = !window.matchMedia('(hover: none)').matches;
  const menuOverlay = !supportsHover && menuOpened && menuProps.state !== 'closing';

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      closeMenu();
    };

    const menuOverlayEl = menuOverlayRef.current;
    if (menuOverlay && menuOverlayEl) {
      menuOverlayEl.addEventListener('touchstart', handler, {passive: false});

      return () => {
        menuOverlayEl.removeEventListener('touchstart', handler);
      }
    }
  }, [menuOverlay, closeMenu]);

  const onMenuOverlay = props.onMenuOverlay;
  useEffect(() => {
    onMenuOverlay && onMenuOverlay(menuOverlay);
  }, [onMenuOverlay, menuOverlay]);

  return (
    <div
      ref={itemRef}
      key={index}
      className={classNames(styles.Item, menuOpened ? styles['Item--menuOpened'] : null)}
      onClick={handleItemClicked}>
      <div className={styles.Item__albumart}>{albumartContents}{playButton}</div>
      <div className={styles.Item__titleAlbumArtist}>
        <div className={styles.Item__title} dangerouslySetInnerHTML={{ __html: title }} />
        <div className={styles.Item__album} dangerouslySetInnerHTML={{ __html: album }} />
        <div className={styles.Item__artist} dangerouslySetInnerHTML={{ __html: artist }} />
        <div className={styles.Item__albumArtist} dangerouslySetInnerHTML={{ __html: albumArtist }} />
      </div>
      <div className={styles.Item__duration}>{duration}</div>
      {menu ?
        <div className={classNames(styles.Item__ellipsis, 'menu-button')}>
          <Button 
            ref={menuButtonRef}
            styles={{
              baseClassName: 'Item__button',
              bundle: styles,
              extraClassNames: [styles['Item__button--menu'], 'menu-button']
            }}
            icon="more_vert"
            onKeyDown={!menuOpened ? openMenu : closeMenu}
            onMouseDown={!menuOpened ? openMenu : closeMenu} />
          {menuOverlay ? 
            <div ref={menuOverlayRef} className={styles.MenuOverlay}></div> 
          : null}
          {menu}
        </div>
      : null}
    </div>
  );
}

export default Item;
