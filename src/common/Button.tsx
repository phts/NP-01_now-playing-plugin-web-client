import './Button.scss';
import classNames from 'classnames';
import React from 'react';
import { StylesBundleProps } from './StylesBundle';

export interface ButtonProps extends StylesBundleProps {
  toggleable?: boolean;
  toggled?: boolean;
  disabled?: boolean;
  image?: string;
  icon?: string;
  text?: string;
  [k: string]: any; // Data attrs
}

export type ButtonElement = HTMLButtonElement;

const Button = React.forwardRef<ButtonElement, ButtonProps>((props, ref) => {
  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles?.bundle : null;
  const extraClassNames = props.styles?.extraClassNames || [];

  const mainClassName = (baseClassName && stylesBundle) ?
    classNames(
      stylesBundle[baseClassName] || 'Button',
      props.toggleable ? stylesBundle[`${baseClassName}--toggleable`] || 'Button--toggleable' : null,
      props.toggled ? stylesBundle[`${baseClassName}--toggled`] || 'Button--toggled' : null,
      props.disabled ? stylesBundle[`${baseClassName}--disabled`] || 'Button--disabled' : null,
      [ ...extraClassNames ]
    )
    :
    classNames(
      'Button',
      props.toggleable ? 'Button--toggleable' : null,
      props.toggled ? 'Button--toggled' : null,
      props.disabled ? 'Button--disabled' : null,
      [ ...extraClassNames ]
    );

  const getElementClassName = (element: string) => (baseClassName && stylesBundle) ?
    stylesBundle[`${baseClassName}__${element}`] || `Button__${element}` :
    `Button__${element}`;

  const dataKeys = Object.keys(props).filter((key) => key.startsWith('data-'));
  const dataAttrs = dataKeys.reduce<Record<string, any>>((prev, current) => {
    prev[current] = props[current];
    return prev;
  }, {});

  return (
    <button
      ref={ref}
      className={mainClassName}
      onClick={props.onClick}
      onKeyDown={props.onKeyDown}
      onMouseDown={props.onMouseDown}
      {...dataAttrs}>
      {props.image ? <img className={getElementClassName('image')} src={props.image} alt="" /> : null}
      {props.icon ? <span className={getElementClassName('icon')}>{props.icon}</span> : null}
      {props.text ? <span className={getElementClassName('text')}>{props.text}</span> : null}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
