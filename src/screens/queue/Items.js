import React, { useCallback } from 'react';
import Item from './Item';
import styles from './Items.module.scss';

const Items = React.memo((props) => {
  const getItems = useCallback(() => {
    return props.items.map((item, index) => (
      <Item 
        key={index}
        styles={styles} 
        index={index} 
        data={item} 
        isPlaying={props.currentPlayingPosition === index}
        onClick={props.onItemClick}
        onRemoveClick={props.onRemoveClick} />
    ));
  }, [props.items, props.currentPlayingPosition, props.onItemClick, props.onRemoveClick]);

  return (
    <div className={styles.Layout}>{getItems()}</div>
  );
});

Items.displayName = 'QueueScreenItems';

export default Items;
