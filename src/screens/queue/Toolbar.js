import classNames from 'classnames';
import React from 'react';
import Button from '../../common/Button';
import PlayerButtonGroup from '../../common/PlayerButtonGroup';
import styles from './Toolbar.module.scss';

const Toolbar = React.forwardRef((props, ref) => {

  const handleButtonClicked = (e) => {
    props.onButtonClick(e.currentTarget.dataset.action);
  };

  const baseButtonStyles = {
    baseClassName: 'Button',
    bundle: styles
  };

  const getButtonStyles = (buttonName) => ({
    ...baseButtonStyles,
    extraClassNames: [styles[`Button--${buttonName}`]]
  });

  const addToPlaylistButton = (
    <Button 
      key="addToPlaylist"
      styles={getButtonStyles('addToPlaylist')}
      icon="playlist_add"
      data-action="addToPlaylist"
      onClick={handleButtonClicked} />
  );

  const clearButton = (
    <Button 
      key="clear"
      styles={getButtonStyles('clear')}
      icon="delete_sweep"
      data-action="clear"
      onClick={handleButtonClicked} />
  );

  const maximizeScreenButton = props.screenMaximizable ? 
    <Button
      key="maximizeScreen"
      styles={getButtonStyles('toggleScreenMaximize')}
      icon={!props.screenMaximized ? 'fullscreen' : 'fullscreen_exit'}
      data-action="toggleScreenMaximize"
      onClick={handleButtonClicked} />
    : null;

  const buttonGroupClassNames = classNames([
    styles.PlayerButtonGroup,
    'no-swipe'
  ]);

  return (
    <div ref={ref} className={styles.Layout}>
      <div className={styles['Layout__screen']}>
        <Button 
          styles={getButtonStyles('close')}
          icon="expand_more"
          data-action="close"
          onClick={handleButtonClicked} />
        <div className={styles['Title']}>
          <div className={styles['Title--primary']}>Queue</div>
          <div className={styles['Title--secondary']}>{`${props.itemCount} items`}</div>
        </div>
      </div>
      <div className={styles['Layout__main']}>
      <PlayerButtonGroup
          className={buttonGroupClassNames}
          buttonStyles={baseButtonStyles}
          buttons={['random', 'repeat', addToPlaylistButton, clearButton, maximizeScreenButton]}
          playerState={props.playerState} />
      </div>
    </div>
  );
});

export default Toolbar;
