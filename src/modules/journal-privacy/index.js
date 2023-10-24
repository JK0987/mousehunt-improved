import { addUIStyles } from '../utils';
import styles from './styles.css';

const applyClassToNames = () => {
  const entries = document.querySelectorAll('#journalContainer .entry.relicHunter_start .journaltext');
  if (! entries) {
    return;
  }

  entries.forEach((entry) => {
    if (! entry || ! entry.textContent) {
      return;
    }

    // if entry matches a name, add class
    const match = entry.textContent.match(/(.*)( has joined the | has left the | used Rare Map Dust |, the map owner, has )/);
    if (match && match[1]) {
      // Wrap the match in a span.
      const span = document.createElement('span');
      span.classList.add('mh-journal-privacy-name');
      span.textContent = match[1];

      // Replace the match with the span.
      entry.innerHTML = entry.innerHTML.replace(match[1], span.outerHTML);
    }
  });
};

export default () => {
  addUIStyles(styles);

  onAjaxRequest(() => {
    applyClassToNames();
  }, 'managers/ajax/pages/journal.php');
};