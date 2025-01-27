import { addStyles } from '@utils';

import styles from './styles.css';

const toggleBigTimer = () => {
  const timer = document.querySelector('.huntersHornView__timer');
  if (! timer) {
    return;
  }

  timer.addEventListener('click', () => {
    timer.classList.toggle('big-timer');
  });
};

export default async () => {
  addStyles(styles, 'big-timer');

  setTimeout(toggleBigTimer, 1000);
};
