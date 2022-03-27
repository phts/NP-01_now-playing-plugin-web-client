import { useCallback, useRef } from "react";
import Button from "../common/Button";
import styles from './WebRadioDialog.module.scss';
import { usePlaylistService } from "../contexts/ServiceProvider";
import { Scrollbars } from 'rc-scrollbars';
import TextField from "../common/TextField";
import ContextualModal from "../common/ContextualModal";

function WebRadioDialog(props) {

  const playlistService= usePlaylistService();
  const overlayEl = useRef(null);
  const nameInputRef = useRef(null);
  const urlInputRef = useRef(null);
  const okButtonRef = useRef(null);
  const { closeDialog } = props;
  const mode = props.modalData ? (props.modalData.mode || 'add') : 'add';

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

  const onDialogOpen = () => {
    if (mode === 'add') {
      if (nameInputRef.current) {
        nameInputRef.current.value = '';
      }
      if (urlInputRef.current) {
        urlInputRef.current.value = '';
      }
      if (okButtonRef.current) {
        okButtonRef.current.disabled = true;
      }
    }
    else {
      if (nameInputRef.current) {
        nameInputRef.current.value = props.modalData.name || '';
      }
      if (urlInputRef.current) {
        urlInputRef.current.value = props.modalData.url || '';
      }
    }
  };

  const getNameInputValue = () => {
    return nameInputRef.current ? nameInputRef.current.value.trim() : '';
  };

  const getUrlInputValue = () => {
    return urlInputRef.current ? urlInputRef.current.value.trim() : '';
  }

  const onInputChange = () => {  
    const hasName = getNameInputValue().length > 0;
    const hasUrl = getUrlInputValue().length > 0;
    if (okButtonRef.current) {
      okButtonRef.current.disabled = !(hasName && hasUrl);
    }
  };

  const onOK = useCallback(() => {
    const item = {
      title: getNameInputValue(),
      uri: getUrlInputValue()
    };
    if (mode === 'add') {
      playlistService.addWebRadio(item);
    }
    else {
      playlistService.editWebRadio(item);
    }
    closeDialog();
  }, [mode, playlistService, closeDialog]);

  const title = (mode === 'add' ? 'Add' : 'Edit') + ' Web Radio';
  const okText = mode === 'add' ? 'Add' : 'Save';

  return (
    <ContextualModal
      closeTimeoutMS={200}
      overlayClassName={modalOverlayClassNames}
      className={modalClassNames}
      overlayRef={node => (overlayEl.current = node)}
      onAfterOpen={onDialogOpen}
      {...props}>
      <div className={styles.Layout__header}>
        <span className={styles.Title}>{title}</span>
        <Button
          styles={{
            baseClassName: 'Button',
            bundle: styles,
            extraClassNames: [styles['Button--close']]
          }}
          icon="close"
          onClick={closeDialog} />
      </div>
      <Scrollbars
        className={styles.Layout__contents}
        classes={{
          thumbVertical: 'Scrollbar__handle'
        }}
        autoHeight
        autoHeightMax='var(--max-contents-height)'
        autoHide
        >
        <div className={styles.ContentsWrapper}>
          <TextField ref={nameInputRef} placeholder="Name" icon="radio" onChange={onInputChange} />
          <TextField ref={urlInputRef} placeholder="URL" icon="link" onChange={onInputChange} />
        </div>
      </Scrollbars>
      <div className={styles.Layout__footer}>
        <Button
          ref={okButtonRef}
          styles={{
            baseClassName: 'Button',
            bundle: styles,
            extraClassNames: [styles['Button--ok']]
          }}
          text={okText}
          onClick={onOK}
        />
      </div>
    </ContextualModal>
  );
}

export default WebRadioDialog;
