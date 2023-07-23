/// <reference types="../../declaration.d.ts" />

import classNames from 'classnames';
import styles from './styles.module.scss';
import { Theme } from '../../contexts/settings/ThemeProvider';

const theme: Theme = {
  name: 'glass',
  className: classNames(styles.DefaultTheme, styles.GlassTheme)
};

export default theme;
