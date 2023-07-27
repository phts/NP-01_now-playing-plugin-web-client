import './PopupMenu.scss';
import classNames from 'classnames';
import { ControlledMenu, ControlledMenuProps, MenuDivider, MenuHeader, MenuItem, useMenuState } from '@szhsin/react-menu';
import React, { SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import Button, { ButtonElement } from './Button';
import { usePerformanceContext } from '../contexts/SettingsProvider';
import { StylesBundleProps } from './StylesBundle';

export interface PopupMenuItem {
  type: 'header' | 'divider' | 'item';
  key: string;
  value?: any;
  title?: string;
  icon?: string;
}

export interface PopupMenuProps extends StylesBundleProps {
  menuItems: PopupMenuItem[];
  align?: ControlledMenuProps['align'];
  position?: ControlledMenuProps['position'];
  direction?: ControlledMenuProps['direction'];
  boundingBoxRef?: ControlledMenuProps['boundingBoxRef'];
  onMenuItemClick?: ControlledMenuProps['onItemClick'];
  onMenuOverlay?: (overlay: boolean) => void;
  menuButtonIcon?: string;
}

function PopupMenu(props: PopupMenuProps) {
  const { disableTransitions } = usePerformanceContext();
  const { menuItems, onMenuItemClick, onMenuOverlay } = props;
  const menuButtonRef = useRef<ButtonElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const [ menuProps, toggleMenu ] = useMenuState({ transition: !disableTransitions });

  const openMenu = useCallback((e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleMenu(true);
  }, [ toggleMenu ]);

  const closeMenu = useCallback(() => {
    toggleMenu(false);
  }, [ toggleMenu ]);

  const menuOpened = menuProps.state !== undefined && menuProps.state !== 'closed';

  const getMenu = () => {
    const getIcon = (item: PopupMenuItem) => item.icon ?
      (<span className={classNames('material-icons', getElementClassName('menuItemIcon'))}>{item.icon}</span>)
      : null;

    return (
      <ControlledMenu
        {...menuProps}
        anchorRef={menuButtonRef}
        onClose={closeMenu}
        unmountOnClose
        theming="dark"
        align={props.align || 'start'}
        position={props.position || 'anchor'}
        direction={props.direction || 'left'}
        boundingBoxRef={props.boundingBoxRef}
        boundingBoxPadding="8"
        overflow="auto"
        onItemClick={onMenuItemClick}
      >
        {menuItems.map((item) => {
          if (item.type === 'header') {
            return (
              <MenuHeader key={item.key}>
                {getIcon(item)}
                {item.title}
              </MenuHeader>
            );
          }
          else if (item.type === 'divider') {
            return (
              <MenuDivider key={item.key} />
            );
          }

          return (
            <MenuItem
              key={item.key}
              value={item.value}>
              {getIcon(item)}
              {item.title}
            </MenuItem>
          );

        })}
      </ControlledMenu>
    );
  };

  const supportsHover = !window.matchMedia('(hover: none)').matches;
  const menuOverlay = !supportsHover && menuOpened && menuProps.state !== 'closing';

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      closeMenu();
    };

    const menuOverlayEl = menuOverlayRef.current;
    if (menuOverlay && menuOverlayEl) {
      menuOverlayEl.addEventListener('touchstart', handler, { passive: false });

      return () => {
        menuOverlayEl.removeEventListener('touchstart', handler);
      };
    }
  }, [ menuOverlay, closeMenu ]);

  useEffect(() => {
    onMenuOverlay && onMenuOverlay(menuOverlay);
  }, [ onMenuOverlay, menuOverlay ]);

  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles?.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];

  const mainClassName = (baseClassName && stylesBundle) ?
    classNames(
      stylesBundle[baseClassName] || 'PopupMenu',
      menuOpened ? (stylesBundle[`${baseClassName}--opened`] || 'PopupMenu--opened') : null,
      [ ...extraClassNames ]
    )
    :
    classNames(
      'PopupMenu',
      menuOpened ? 'PopupMenu--opened' : null,
      [ ...extraClassNames ]
    );

  const getElementClassName = (element: string) => (baseClassName && stylesBundle) ?
    stylesBundle[`${baseClassName}__${element}`] || `PopupMenu__${element}` :
    `PopupMenu__${element}`;

  return (
    <div className={mainClassName}>
      <Button
        ref={menuButtonRef}
        styles={{
          extraClassNames: [ getElementClassName('menuButton') ]
        }}
        className={getElementClassName('menuButton')}
        icon={props.menuButtonIcon || 'more_vert'}
        onKeyDown={!menuOpened ? openMenu : closeMenu}
        onMouseDown={!menuOpened ? openMenu : closeMenu} />
      {menuOverlay ?
        <div ref={menuOverlayRef} className={getElementClassName('overlay')}></div>
        : null}
      {getMenu()}
    </div>
  );
}

export default PopupMenu;
