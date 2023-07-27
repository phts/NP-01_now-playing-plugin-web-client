/// <reference types="../../declaration.d.ts" />

import React, { SyntheticEvent } from 'react';
import Button from '../../common/Button';
import Image from '../../common/Image';
import playingImage from '../../assets/equalizer.gif';
import { QueueItem } from '../../services/QueueService';

export interface QueueScreenItemProps {
  styles: Record<string, any>;
  data: QueueItem;
  index: number;
  isPlaying: boolean;
  onClick: (index: number) => void;
  onRemoveClick: (index: number) => void;
}

function Item(props: QueueScreenItemProps) {
  const { styles, data, index } = props;

  const title = data.title || data.name || '';

  let artistAlbum = data.artist || '';
  if (data.album) {
    artistAlbum += artistAlbum ? ' - ' : '';
    artistAlbum += data.album;
  }

  const handleItemClicked = (e: SyntheticEvent) => {
    e.stopPropagation();
    props.onClick(index);
  };

  const handleRemoveClicked = (e: SyntheticEvent) => {
    e.stopPropagation();
    props.onRemoveClick(index);
  };

  const getButtonStyles = (buttonName: string) => {
    return {
      baseClassName: 'Item__button',
      bundle: styles,
      extraClassNames: [ styles[`Item__button--${buttonName}`] ]
    };
  };

  return (
    <div
      key={index}
      className={styles.Item}
      onClick={handleItemClicked}>
      <div className={styles.Item__albumart}>
        <Image
          className={styles.Item__image}
          src={!props.isPlaying ? data.albumart : playingImage} />
      </div>
      <div className={styles.Item__titleArtistAlbum}>
        <div className={styles.Item__title} dangerouslySetInnerHTML={{ __html: title }} />
        <div className={styles.Item__artistAlbum} dangerouslySetInnerHTML={{ __html: artistAlbum }} />
      </div>
      <div className={styles.Item__buttons}>
        <Button
          styles={getButtonStyles('remove')}
          icon="remove_circle_outline"
          onClick={handleRemoveClicked} />
      </div>
    </div>
  );
}

export default Item;
