import classNames from 'classnames';
import React, { useCallback, useRef, useState } from 'react';
import Button from '../../common/Button';
import { isHome } from './helper';
import SearchBox from './SearchBox';
import styles from './Toolbar.module.scss';

const Toolbar = React.forwardRef((props, ref) => {

  const searchBoxRef = useRef(null);

  const [isCollapsibleSearchBoxExpanded, setCollapsibleSearchBoxExpanded] = useState(false);

  const toggleCollapsibleSearchBox = useCallback(() => {
    if (isCollapsibleSearchBoxExpanded) {
      searchBoxRef.current.blur();
    }
    else {
      searchBoxRef.current.focus();
    }
    setCollapsibleSearchBoxExpanded(!isCollapsibleSearchBoxExpanded);
  }, [setCollapsibleSearchBoxExpanded, isCollapsibleSearchBoxExpanded]);

  const getToggleListViewIcon = useCallback(() => {
    const toggled = props.currentListView === 'grid' ? 'list' : 'grid';
    return toggled === 'grid' ? 'grid_view' : 'view_list';
  }, [props.currentListView]);

  const supportsMultipleListViews = () => {
    const contents = props.currentLocation.contents || {};
    if (contents.navigation && Array.isArray(contents.navigation.lists)) {
      return contents.navigation.lists.find( list => 
        Array.isArray(list.availableListViews) && 
        list.availableListViews.length > 1 );
    }
    return false;
  };

  const handleButtonClicked = (e) => {
    props.onButtonClick(e.currentTarget.dataset.action);
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

  const getButtonStyles = (buttonName) => ({
    ...baseButtonStyles,
    extraClassNames: [styles[`Button--${buttonName}`], 'no-swipe']
  });

  return (
    <div ref={ref} className={styles.Layout}>
      <div className={styles['Layout__main']}>
        <Button 
          styles={getButtonStyles('home')}
          icon="home"
          data-action="home"
          onClick={handleButtonClicked}
          />
        { !isHome(props.currentLocation) ? <Button 
            styles={getButtonStyles('back')} 
            icon="arrow_back"
            data-action="back"
            onClick={handleButtonClicked} /> 
            : null }
        { supportsMultipleListViews() ? <Button 
            styles={getButtonStyles('toggleListView')} 
            icon={getToggleListViewIcon()} 
            data-action="toggleListView"
            onClick={handleButtonClicked} /> 
            : null }
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
            placeholder={props.currentLocation.service ? props.currentLocation.service.prettyName : ''} />
        </div>
      </div>
      <div className={styles['Layout__screen']}>
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