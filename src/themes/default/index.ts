/// <reference types="../../declaration.d.ts" />

import { Theme } from '../../contexts/settings/ThemeProvider';
import styles from './styles.module.scss';

const theme: Theme = {
  name: 'default',
  className: styles.DefaultTheme
};

export default theme;
