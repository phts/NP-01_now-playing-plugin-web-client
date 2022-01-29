import React, { useCallback } from 'react';
import Item from './Item';

/*const compareProps = (prevProps, nextProps) => {
  return prevProps.styles === nextProps.styles && 
    prevProps.items === nextProps.items;
};*/

const Items = React.memo((props) => {
  const getItems = useCallback(() => {
    return props.items.map((item, index) => (
      <Item 
        key={index}
        styles={props.styles} 
        index={index} 
        data={item} 
        onClick={props.onItemClick}
        onPlayClick={props.onPlayClick} />
    ));
  }, [props.items, props.styles, props.onItemClick, props.onPlayClick]);

  return (
    <>{getItems()}</>
  );
}/*, compareProps*/);

Items.displayName = 'BrowseScreenItems';

export default Items;
