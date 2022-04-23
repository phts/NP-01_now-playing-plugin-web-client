import Button from "../common/Button";
import styles from './MetadataModal.module.scss';
import MetadataPanel from "../common/MetadataPanel";
import { useRef } from "react";
import ContextualModal from "../common/ContextualModal";

function MetadataModal(props) {
  const overlayEl = useRef(null);
  const { closeDialog } = props;
  const {song, album, artist, placeholderImage} = props.modalData || {};

  const modalOverlayClassNames = {
    base: styles.Overlay,
    afterOpen: styles['Overlay--after-open'],
    beforeClose: styles['Overlay--before-close']
  };

  const modalClassNames = {
    base: `${styles.Layout}`,
    afterOpen: styles['Layout--after-open'],
    beforeClose: styles['Layout--before-close']
  };

  return (
    <ContextualModal
      closeTimeoutMS={200}
      overlayClassName={modalOverlayClassNames}
      className={modalClassNames}
      overlayRef={node => (overlayEl.current = node)}
      {...props}>
      <div className={styles.Layout__header}>
        <Button
          styles={{
            baseClassName: 'Button',
            bundle: styles,
            extraClassNames: [styles['Button--close']]
          }}
          icon="close"
          onClick={closeDialog} />
      </div>
      <MetadataPanel
        styles={{
          baseClassName: 'MetadataPanel',
          bundle: styles
        }}
        song={song}
        album={album}
        artist={artist}
        placeholderImage={placeholderImage} />
    </ContextualModal>
  );
}

export default MetadataModal;
