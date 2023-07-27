/// <reference types="../../declaration.d.ts" />

import React, { ChangeEvent, useRef } from 'react';
import TextField, { TextFieldElement } from '../../common/TextField';
import styles from './SearchBox.module.scss';

export interface BrowseScreenSearchBoxProps {
  defaultValue: string;
  placeholder?: string;
  onQuery: (query: string, commit: boolean) => void;
}

export type BrowseScreenSearchBoxElement = TextFieldElement;

const SearchBox = React.forwardRef<BrowseScreenSearchBoxElement, BrowseScreenSearchBoxProps>((props, ref) => {
  const inputTimer = useRef<NodeJS.Timeout | null>(null);

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (inputTimer.current) {
      clearTimeout(inputTimer.current);
      inputTimer.current = null;
    }
    const query = e.currentTarget.value.trim();
    props.onQuery && props.onQuery(query, false);
    if (query.length >= 3) {
      inputTimer.current = setTimeout(() => {
        props.onQuery && props.onQuery(query, true);
        inputTimer.current = null;
      }, 500);
    }
  };

  return (
    <TextField
      ref={ref}
      placeholder={props.placeholder}
      icon="search"
      onChange={onInput}
      defaultValue={props.defaultValue}
      styles={{
        baseClassName: 'TextField',
        bundle: styles,
        extraClassNames: [ 'no-swipe' ]
      }} />
  );
});

export default SearchBox;
