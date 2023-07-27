/// <reference types="../../declaration.d.ts" />

import classNames from 'classnames';
import React, { SyntheticEvent, useCallback, useRef, useState } from 'react';
import Button from '../../common/Button';
import { isHome } from './helper';
import SearchBox, { BrowseScreenSearchBoxElement, BrowseScreenSearchBoxProps } from './SearchBox';
import styles from './Toolbar.module.scss';
import { BrowseContentsPage, BrowseServiceLocation } from '../../services/BrowseService';

export interface BrowseScreenToolbarProps {
  currentListView: 'grid' | 'list';
  currentContents: BrowseContentsPage;
  currentLocation: BrowseServiceLocation;
  screenMaximizable: boolean;
  screenMaximized: boolean;
  initialSearchQuery: string;
  onSearchQuery: BrowseScreenSearchBoxProps['onQuery'];
  onButtonClick: (action: string) => void;
}

export type BrowseScreenToolbarElement = HTMLDivElement;

const Toolbar = React.forwardRef<BrowseScreenToolbarElement, BrowseScreenToolbarProps>((props, ref) => {

  const searchBoxRef = useRef<BrowseScreenSearchBoxElement | null>(null);

  const [ isCollapsibleSearchBoxExpanded, setCollapsibleSearchBoxExpanded ] = useState(false);

  const toggleCollapsibleSearchBox = useCallback(() => {
    if (!searchBoxRef.current) {
      return;
    }
    if (isCollapsibleSearchBoxExpanded) {
      searchBoxRef.current.blur();
    }
    else {
      searchBoxRef.current.focus();
    }
    setCollapsibleSearchBoxExpanded(!isCollapsibleSearchBoxExpanded);
  }, [ setCollapsibleSearchBoxExpanded, isCollapsibleSearchBoxExpanded ]);

  const getToggleListViewIcon = useCallback(() => {
    const toggled = props.currentListView === 'grid' ? 'list' : 'grid';
    return toggled === 'grid' ? 'grid_view' : 'view_list';
  }, [ props.currentListView ]);

  const supportsMultipleListViews = () => {
    const contents = props.currentContents || {};
    if (contents.navigation && Array.isArray(contents.navigation.lists)) {
      return contents.navigation.lists.find((list) =>
        Array.isArray(list.availableListViews) &&
        list.availableListViews.length > 1);
    }
    return false;
  };

  const handleButtonClicked = (e: SyntheticEvent) => {
    if (e.currentTarget) {
      const el = e.currentTarget as HTMLElement;
      if (el.dataset.action) {
        props.onButtonClick(el.dataset.action);
      }
    }
  };

  const searchClassNames = classNames([
    styles.Search,
    isCollapsibleSearchBoxExpanded ? styles['Search--collapsibleExpanded'] : null,
    'no-swipe'
  ]);

  const baseButtonStyles = {
    baseClassName: 'Button',
    bundle: styles
  };

  const getButtonStyles = (buttonName: string) => ({
    ...baseButtonStyles,
    extraClassNames: [ styles[`Button--${buttonName}`], 'no-swipe' ]
  });

  const toolbarClassNames = classNames(
    styles.Layout,
    props.screenMaximized ? styles['Layout--maximized'] : null
  );

  return (
    <div ref={ref} className={toolbarClassNames}>
      <div className={styles['Layout__main']}>
        <Button
          styles={getButtonStyles('home')}
          icon="home"
          data-action="home"
          onClick={handleButtonClicked}
        />
        {!isHome(props.currentLocation) ? <Button
          styles={getButtonStyles('back')}
          icon="arrow_back"
          data-action="back"
          onClick={handleButtonClicked} />
          : null}
        {supportsMultipleListViews() ? <Button
          styles={getButtonStyles('toggleListView')}
          icon={getToggleListViewIcon()}
          data-action="toggleListView"
          onClick={handleButtonClicked} />
          : null}
        <Button
          styles={getButtonStyles('search')}
          icon="search"
          toggled={isCollapsibleSearchBoxExpanded}
          onClick={toggleCollapsibleSearchBox}
        />
        <div className={searchClassNames}>
          <SearchBox
            ref={searchBoxRef}
            onQuery={props.onSearchQuery}
            defaultValue={props.initialSearchQuery}
            placeholder={props.currentLocation.service ? props.currentLocation.service.prettyName : ''} />
        </div>
      </div>
      <div className={styles['Layout__screen']}>
        {
          props.screenMaximizable ?
            <Button
              styles={getButtonStyles('toggleScreenMaximize')}
              icon={!props.screenMaximized ? 'fullscreen' : 'fullscreen_exit'}
              data-action="toggleScreenMaximize"
              onClick={handleButtonClicked} />
            : null
        }
        <Button
          styles={getButtonStyles('actionPanel')}
          icon="more_horiz"
          data-action="openActionPanel"
          onClick={handleButtonClicked} />
        <Button
          styles={getButtonStyles('close')}
          icon="close"
          data-action="close"
          onClick={handleButtonClicked} />
      </div>
    </div>
  );
});

export default Toolbar;
