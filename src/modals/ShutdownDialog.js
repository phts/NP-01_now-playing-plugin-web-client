import { useRef } from "react";
import Button from "../common/Button";
import styles from './ShutdownDialog.module.scss';
import { Scrollbars } from 'rc-scrollbars';
import ContextualModal from "../common/ContextualModal";
import { useTranslation } from "react-i18next";
import { useSocket } from "../contexts/SocketProvider";

function ShutdownDialog(props) {
  const { socket } = useSocket();
  const overlayEl = useRef(null);
  const { closeDialog } = props;
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

  const restart = () => {
    socket.emit('reboot');
    closeDialog();
  }

  const shutdown = () => {
    socket.emit('shutdown');
    closeDialog();
  }

  const title = t('modal.shutdown.title');
  const powerOffText = t('modal.shutdown.powerOff');
  const restartText = t('modal.shutdown.restart');

  return (
    <ContextualModal
      closeTimeoutMS={200}
      overlayClassName={modalOverlayClassNames}
      className={modalClassNames}
      overlayRef={node => (overlayEl.current = node)}
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
          <Button
            styles={{
              baseClassName: 'Button',
              bundle: styles,
              extraClassNames: [styles['Button--powerOff']]
            }}
            text={powerOffText}
            icon="power_settings_new"
            onClick={shutdown}
          />
          <Button
            styles={{
              baseClassName: 'Button',
              bundle: styles,
              extraClassNames: [styles['Button--restart']]
            }}
            text={restartText}
            icon="restart_alt"
            onClick={restart}
          />
        </div>
      </Scrollbars>
    </ContextualModal>
  );
}

export default ShutdownDialog;
