/// <reference types="../../declaration.d.ts" />

import React, { useCallback } from 'react';
import Item, { QueueScreenItemProps } from './Item';
import styles from './Items.module.scss';
import { QueueItem } from '../../services/QueueService';

export interface QueueScreenItemsProps {
  items: QueueItem[];
  currentPlayingPosition: number;
  onItemClick: QueueScreenItemProps['onClick'];
  onRemoveClick: QueueScreenItemProps['onRemoveClick'];
}

const Items = React.memo((props: QueueScreenItemsProps) => {
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
  }, [ props.items, props.currentPlayingPosition, props.onItemClick, props.onRemoveClick ]);

  return (
    <div className={styles.Layout}>{getItems()}</div>
  );
});

Items.displayName = 'QueueScreenItems';

export default Items;
