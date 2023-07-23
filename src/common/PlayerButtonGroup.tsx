import './PlayerButtonGroup.scss';
import Button, { ButtonProps } from './Button';
import React, { useCallback } from 'react';
import { useSocket } from '../contexts/SocketProvider';
import { PlayerState } from '../contexts/player/PlayerStateProvider';
import { StylesBundleProps } from './StylesBundle';

export interface PlayerButtonGroupProps {
  playerState: PlayerState;
  className: string;
  buttons?: Array<'repeat' | 'previous' | 'play' | 'next' | 'random' | React.ReactNode>;
  buttonStyles: StylesBundleProps['styles'];
}

function PlayerButtonGroup(props: PlayerButtonGroupProps) {
  const {socket} = useSocket();
  const playerState = props.playerState;

  // Button event handlers
  const onRepeatClicked = useCallback(() => {
    if (!socket) {
      return;
    }
    const repeat = playerState.repeat ? (!playerState.repeatSingle) : true;
    const repeatSingle = repeat && playerState.repeat;
    socket.emit('setRepeat', { value: repeat, repeatSingle });
  }, [ playerState.repeat, playerState.repeatSingle, socket ]);

  const onPreviousClicked = useCallback(() => {
    if (socket) {
      socket.emit('prev');
    }
  }, [ socket ]);

  const onPlayClicked = useCallback(() => {
    if (socket) {
      socket.emit('toggle');
    }
  }, [ socket ]);

  const onNextClicked = useCallback(() => {
    if (socket) {
      socket.emit('next');
    }
  }, [ socket ]);

  const onRandomClicked = useCallback(() => {
    if (socket) {
      socket.emit('setRandom', { value: !playerState.random });
    }
  }, [ socket, playerState.random ]);

  const getButtonStyles = (buttonName: string): ButtonProps['styles'] => {
    if (props.buttonStyles) {
      const baseClassName = props.buttonStyles.baseClassName;
      const buttonStyles = {
        ...props.buttonStyles
      };
      if (props.buttonStyles.bundle?.[`${baseClassName}--${buttonName}`]) {
        buttonStyles.extraClassNames = [ props.buttonStyles.bundle?.[`${baseClassName}--${buttonName}`] ];
      }
      return buttonStyles;
    }
    return undefined;
  };

  const createButtonComponentByName = (buttonName: string) => {
    let buttonProps: ButtonProps | null;
    switch (buttonName) {
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
    const buttons = props.buttons || [ 'repeat', 'previous', 'play', 'next', 'random' ];
    const components: React.ReactNode[] = [];
    buttons.forEach((button) => {
      if (typeof button === 'string') {
        const el = createButtonComponentByName(button);
        if (el) {
          components.push(el);
        }
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
