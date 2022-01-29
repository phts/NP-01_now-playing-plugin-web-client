import classNames from "classnames";
import { useCallback } from "react";
import Button from "./Button";
import styles from './Toast.module.scss';

function Toast(props) {
  const iconClasses = classNames(
    styles.Icon,
    styles[`Icon--${props.type}`]
  );

  const getIcon = useCallback(type => {
    switch(type) {
      case 'success':
        return 'check_circle_outline';
      case 'info':
        return 'info';
      case 'warning':
        return 'warning_amber';
      case 'error':
      case 'stickyerror':
        return 'error_outline';
      default:
        return null;
    }
  }, [])
  const icon = getIcon(props.type);

  return (
    <div className={styles.Layout}>
      <div className={iconClasses}>
        { icon ? <span className="material-icons">{icon}</span> : null}
      </div>
      <div className={styles.Layout__contents}>
        { props.title ? <div className={styles.Title}>{props.title}</div> : null}
        <div className={styles.Message}>{props.message}</div>
      </div>
      <div className={styles.Layout__actions}>
        <Button 
          styles={{
            baseClassName: 'Button',
            bundle: styles
          }}
          icon="close"
          onClick={props.closeToast} />
      </div>
    </div>
  );
}

export default Toast;