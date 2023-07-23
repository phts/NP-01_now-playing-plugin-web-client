import React, { useCallback } from 'react';
import Item, { BrowseScreenItemProps } from './Item';
import { BrowseContentsListItem, BrowseSource } from '../../services/BrowseService';

export interface BrowseScreenItemsProps {
  styles: Record<string, any>;
  items: BrowseScreenItemProps['data'][];
  location: BrowseScreenItemProps['location'];
  onItemClick: BrowseScreenItemProps['onClick'];
  onPlayClick: BrowseScreenItemProps['onPlayClick'];
  onMenuItemClick: BrowseScreenItemProps['onMenuItemClick'];
  onMenuOverlay: BrowseScreenItemProps['onMenuOverlay'];
}

const Items = React.memo((props: BrowseScreenItemsProps) => {
  const getItems = useCallback(() => {
    return props.items.map((item: BrowseContentsListItem | BrowseSource, index: number) => (
      <Item
        key={index}
        styles={props.styles}
        index={index}
        location={props.location}
        data={item}
        onClick={props.onItemClick}
        onPlayClick={props.onPlayClick}
        onMenuItemClick={props.onMenuItemClick}
        onMenuOverlay={props.onMenuOverlay} />
    ));
  }, [ props.items, props.styles, props.location, props.onItemClick, props.onPlayClick, props.onMenuItemClick, props.onMenuOverlay ]);

  return (
    <>{getItems()}</>
  );
});

Items.displayName = 'BrowseScreenItems';

export default Items;
