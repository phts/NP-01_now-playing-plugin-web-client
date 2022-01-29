import { useCallback } from "react";
import Button from "../../common/Button";
import Image from "../../common/Image";
import { secondsToString } from "../../utils/track";
import { hasPlayButton } from "./helper";

function Item(props) {
  const styles = props.styles;
  const data = props.data;
  const index = props.index;

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
  
  return (
    <div
      key={index}
      className={styles.Item}
      onClick={handleItemClicked}>
      <div className={styles.Item__albumart}>{albumartContents}{playButton}</div>
      <div className={styles.Item__titleAlbumArtist}>
        <div className={styles.Item__title} dangerouslySetInnerHTML={{ __html: title }} />
        <div className={styles.Item__album} dangerouslySetInnerHTML={{ __html: album }} />
        <div className={styles.Item__artist} dangerouslySetInnerHTML={{ __html: artist }} />
        <div className={styles.Item__albumArtist} dangerouslySetInnerHTML={{ __html: albumArtist }} />
      </div>
      <div className={styles.Item__duration}>{duration}</div>
      { /* <div className={styles.Item__ellipsis}><button className="menu-trigger"><i class="fa fa-ellipsis-v"></i></button></div>*/}
    </div>
  );
}

export default Item;
