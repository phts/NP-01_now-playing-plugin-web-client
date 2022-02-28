import React, { useRef } from 'react';
import TextField from '../../common/TextField';
import styles from './SearchBox.module.scss';

const SearchBox = React.forwardRef((props, ref) => {
  const inputTimer = useRef(null);

  const onInput = (e) => {
    if (inputTimer.current) {
      clearTimeout(inputTimer.current);
      inputTimer.current = null;
    }
    let query = e.currentTarget.value.trim();
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
      styles={{ 
        baseClassName: 'TextField',
        bundle: styles,
        extraClassNames: ['no-swipe'] 
      }} />
  );
});

export default SearchBox;
