import classNames from 'classnames';
import React, { useCallback, useRef, useState } from 'react';
import styles from './SearchBox.module.scss';

const SearchBox = React.forwardRef((props, ref) => {
  const [focused, setFocused] = useState(false);
  const inputTimer = useRef(null);

  const onTextInputFocused = useCallback(() => {
    setFocused(true);
  }, [setFocused]);

  const onTextInputBlur = useCallback(() => {
    setFocused(false);
  }, [setFocused]);

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
    <div className={classNames([styles.Layout, 'no-swipe', focused ? styles['Layout--focused'] : null])}>
      <span className={classNames([styles.Icon, 'material-icons'])}>search</span>
      <input 
        ref={ref} 
        type="text" 
        placeholder={props.placeholder}
        onFocus={onTextInputFocused} 
        onBlur={onTextInputBlur} 
        onChange={onInput}
        className={styles.TextInput} />
    </div>
  );
});

export default SearchBox;
