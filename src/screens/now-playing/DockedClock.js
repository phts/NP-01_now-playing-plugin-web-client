import Clock from '../../common/Clock';
import styles from './DockedClock.module.scss';

function DockedClock(props) {
  const {fontSize, dateColor, timeColor, margin} = props;

  const dockedStyles = {
    '--docked-font-size': fontSize,
    '--docked-date-color': dateColor,
    '--docked-time-color': timeColor,
    '--docked-margin': margin
  };
  
  return (
    <div style={dockedStyles}>
      <Clock
        styles={{
          baseClassName: 'DockedClock',
          bundle: styles
        }} />
    </div>
  );
}

export default DockedClock;
