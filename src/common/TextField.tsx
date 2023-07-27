import './TextField.scss';
import classNames from 'classnames';
import React, { HTMLProps, useCallback, useState } from 'react';
import { StylesBundleProps } from './StylesBundle';

export interface TextFieldProps extends StylesBundleProps {
  icon?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: HTMLProps<HTMLInputElement>['onChange'];
}

export type TextFieldElement = HTMLInputElement;

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const baseClassName = props.styles ? props.styles.baseClassName : null;
  const stylesBundle = baseClassName ? props.styles?.bundle : null;
  const extraClassNames = (props.styles ? props.styles.extraClassNames : null) || [];
  const [ focused, setFocused ] = useState(false);

  const mainClassName = (baseClassName && stylesBundle) ?
    classNames(
      stylesBundle[baseClassName] || 'TextField',
      focused ? stylesBundle[`${baseClassName}--focus`] || 'TextField--focus' : null,
      [ ...extraClassNames ]
    )
    :
    classNames(
      'TextField',
      focused ? 'TextField--focus' : null,
      [ ...extraClassNames ]
    );

  const getElementClassName = (element: string) => (baseClassName && stylesBundle) ?
    stylesBundle[`${baseClassName}__${element}`] || `TextField__${element}` :
    `TextField__${element}`;

  const onInputFocus = useCallback(() => {
    setFocused(true);
  }, [ setFocused ]);

  const onInputBlur = useCallback(() => {
    setFocused(false);
  }, [ setFocused ]);

  return (
    <div
      className={mainClassName}>
      {props.icon ? <span className={getElementClassName('icon')}>{props.icon}</span> : null}
      <input
        ref={ref}
        type="text"
        className={getElementClassName('input')}
        placeholder={props.placeholder}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
        onFocus={onInputFocus}
        onBlur={onInputBlur} />
    </div>
  );
});

TextField.displayName = 'TextField';

export default TextField;
