/// <reference types="../../declaration.d.ts" />

import React from 'react';
import { useSettings } from '../../contexts/SettingsProvider';
import styles from './DockedMenu.module.scss';
import { CommonSettingsCategory } from 'now-playing-common';
import PopupMenu, { PopupMenuItem } from '../../common/PopupMenu';
import { ClickEvent } from '@szhsin/react-menu';
import { useTranslation } from 'react-i18next';

export interface DockedMenuProps {
  view: 'basic' | 'info';
  iconStyle: string;
  onMenuItemClick: (action: string) => void;
}

const ICONS = {
  'default': 'more_vert',
  'ellipsis_h': 'more_horiz',
  'ellipsis_v': 'more_vert',
  'hamburger': 'menu'
};

function DockedMenu(props: DockedMenuProps) {
  const { settings: screenSettings } = useSettings(CommonSettingsCategory.NowPlayingScreen);
  const settings = screenSettings.dockedMenu;
  const { t } = useTranslation();
  const { view, iconStyle, onMenuItemClick } = props;

  const dockedStyles = {
    '--docked-margin': settings.margin
  } as React.CSSProperties;

  if (settings.iconSettings === 'custom') {
    Object.assign(dockedStyles, {
      '--docked-icon-size': settings.iconSize
    });
  }

  const menuItems: PopupMenuItem[] = [
    {
      type: 'item',
      key: 'toggleView',
      value: {
        action: 'toggleView'
      },
      icon: view === 'basic' ? 'newspaper' : 'art_track',
      title: view === 'basic' ? t('screen.nowPlaying.infoView') : t('screen.nowPlaying.basicView')
    },
    {
      type: 'divider',
      key: 'divider1'
    },
    {
      type: 'item',
      key: 'gotoArtist',
      value: {
        action: 'gotoArtist'
      },
      icon: 'person',
      title: t('action.gotoArtist')
    },
    {
      type: 'item',
      key: 'gotoAlbum',
      value: {
        action: 'gotoAlbum'
      },
      icon: 'album',
      title: t('action.gotoAlbum')
    }
  ];

  const handleMenuItemClicked = (e: ClickEvent) => {
    e.syntheticEvent.stopPropagation();
    const { action } = e.value;
    onMenuItemClick(action);
  };

  return (
    <div style={dockedStyles}>
      <PopupMenu
        styles={{
          baseClassName: 'PopupMenu',
          bundle: styles,
          extraClassNames: [ 'no-swipe' ]
        }}
        key="nowPlayingDockedMenu"
        align="end"
        direction="bottom"
        menuItems={menuItems}
        onMenuItemClick={handleMenuItemClicked}
        menuButtonIcon={ICONS[iconStyle] || ICONS['default']}
      />
    </div>
  );
}

export default DockedMenu;
