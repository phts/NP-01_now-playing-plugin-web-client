import './PlayerButtonGroup.scss';
import Button from './Button';
import classNames from 'classnames';
import { useCallback, useContext } from 'react';
import { SocketContext } from '../contexts/SocketProvider';

function PlayerButtonGroup(props) {
  const socket = useContext(SocketContext);
  const playerState = props.playerState;

  // Button event handlers
  const onRepeatClicked = useCallback(() => {
    let repeat = playerState.repeat ? (playerState.repeatSingle ? false : true) : true;
    let repeatSingle = repeat && playerState.repeat;
    socket.emit('setRepeat', { value: repeat, repeatSingle });
  }, [playerState.repeat, playerState.repeatSingle, socket]);

  const onPreviousClicked = useCallback(() => {
    socket.emit('prev');
  }, [socket]);

  const onPlayClicked = useCallback(() => {
    socket.emit('toggle');
  }, [socket]);

  const onNextClicked = useCallback(() => {
    socket.emit('next');
  }, [socket]);

  const onRandomClicked = useCallback(() => {
    socket.emit('setRandom', { value: !playerState.random });
  }, [socket, playerState.random]);

  const getButtonStyles = (buttonName) => {
    if (props.buttonStyles) {
      const baseClassName = props.buttonStyles.baseClassName;
      return {
        ...props.buttonStyles,
        extraClassNames: [props.buttonStyles.bundle[`${baseClassName}--${buttonName}`]]
      };
    }
    return null;
  };

  const createButtonComponentByName = (buttonName) => {
    let buttonProps;
    switch(buttonName) {
      case 'repeat':
        buttonProps = {
          key: 'repeat',
          icon: playerState.repeatSingle ? 'repeat_one' : 'repeat',
          styles: getButtonStyles('repeat'),
          toggleable: true,
          toggled: playerState.repeat,
          onClick: onRepeatClicked
        };
        break;
      case 'previous': 
        buttonProps = {
          key: 'previous',
          icon: 'skip_previous',
          styles: getButtonStyles('previous'),
          onClick: onPreviousClicked
        };
        break;
      case 'play': 
        buttonProps = {
          key: 'play',
          icon: playerState.status === 'play' ? 
            (playerState.duration ? 'pause' : 'stop') : 'play_arrow',
          styles: getButtonStyles('play'),
          onClick: onPlayClicked
        };
        break;
      case 'next': 
        buttonProps = {
          key: 'next',
          icon: 'skip_next',
          styles: getButtonStyles('next'),
          className: classNames('Button--next', props.buttonClassName),
          onClick: onNextClicked
        };
        break;
      case 'random': 
        buttonProps = {
          key: 'random',
          icon: 'shuffle',
          styles: getButtonStyles('random'),
          toggleable: true,
          toggled: playerState.random,
          onClick: onRandomClicked
        };
        break;
      default:
        buttonProps = null;
    }
    if (buttonProps) {
      return (
        <Button {...buttonProps} />
      );
    }
    return null;
  };

  const getButtons = () => {
    const buttons = props.buttons || ['repeat', 'previous', 'play', 'next', 'random'];
    const components = [];
    buttons.forEach( button => {
      if (typeof button === 'string') {
        components.push(createButtonComponentByName(button));
      }
      else {
        components.push(button);
      }
    });
    return components;
  };

  return (
    <div className={ props.className || 'PlayerButtonGroup' }>
      {getButtons()}
    </div>
  );
}

export default PlayerButtonGroup;