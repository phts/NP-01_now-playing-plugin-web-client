/// <reference types="../declaration.d.ts" />

import React, { useCallback, useRef } from 'react';
import Button, { ButtonElement } from '../common/Button';
import styles from './WebRadioDialog.module.scss';
import { usePlaylistService } from '../contexts/ServiceProvider';
import { Scrollbars } from 'rc-scrollbars';
import TextField, { TextFieldElement } from '../common/TextField';
import ContextualModal, { ContextualModalProps } from '../common/ContextualModal';
import { useTranslation } from 'react-i18next';

export interface WebRadioDialogProps extends ContextualModalProps {
  closeDialog: () => void;
  modalData: {
    mode: 'add' | 'edit';
    name: string;
    url: string;
  }
}

function WebRadioDialog(props: WebRadioDialogProps) {

  const playlistService = usePlaylistService();
  const overlayEl = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<TextFieldElement | null>(null);
  const urlInputRef = useRef<TextFieldElement | null>(null);
  const okButtonRef = useRef<ButtonElement | null>(null);
  const { closeDialog } = props;
  const mode = props.modalData ? (props.modalData.mode || 'add') : 'add';
  const { t } = useTranslation();

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
  };

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
  }, [ mode, playlistService, closeDialog ]);

  const title = t(`modal.webRadio.${mode}.title`);
  const okText = t(`modal.webRadio.${mode}.confirmButton`);

  return (
    <ContextualModal
      closeTimeoutMS={200}
      overlayClassName={modalOverlayClassNames}
      className={modalClassNames}
      overlayRef={(node) => (overlayEl.current = node)}
      onAfterOpen={onDialogOpen}
      {...props}>
      <div className={styles.Layout__header}>
        <span className={styles.Title}>{title}</span>
        <Button
          styles={{
            baseClassName: 'Button',
            bundle: styles,
            extraClassNames: [ styles['Button--close'] ]
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
          <TextField ref={nameInputRef} placeholder={t('modal.webRadio.namePlaceholder')} icon="radio" onChange={onInputChange} />
          <TextField ref={urlInputRef} placeholder={t('modal.webRadio.urlPlaceholder')} icon="link" onChange={onInputChange} />
        </div>
      </Scrollbars>
      <div className={styles.Layout__footer}>
        <Button
          ref={okButtonRef}
          styles={{
            baseClassName: 'Button',
            bundle: styles,
            extraClassNames: [ styles['Button--ok'] ]
          }}
          text={okText}
          onClick={onOK}
        />
      </div>
    </ContextualModal>
  );
}

export default WebRadioDialog;
