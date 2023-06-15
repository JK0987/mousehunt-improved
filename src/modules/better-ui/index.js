import { addUIStyles } from '../utils';

// Unsorted styles.
import styles from './styles.css';

import betterLuckyCatchIcon from './styles/better-lucky-catch-icon.css';
import friends from './styles/friends.css';
import footer from './styles/footer.css';
import overlays from './styles/overlays.css';
import scoreboards from './styles/scoreboards.css';
import select2 from './styles/select2.css';
import sendSupplies from './styles/send-supplies.css';
import sidebar from './styles/sidebar.css';
import tabs from './styles/tabs.css';
import team from './styles/team.css';
import tournamentStyles from './styles/tournaments.css';
import traps from './styles/traps.css';
import maps from './styles/maps.css';

// HUD styles
import toxicSpill from './location-styles/toxic-spill.css';
import train from './location-styles/train.css';

// scripts
import updateFriends from './friends';
import updateTournaments from './tournaments';

export default () => {
  addUIStyles([
    betterLuckyCatchIcon,
    friends,
    footer,
    overlays,
    scoreboards,
    select2,
    sendSupplies,
    sidebar,
    styles,
    tabs,
    team,
    tournamentStyles,
    traps,
    maps,
    toxicSpill,
    train,
  ].join('\n'));

  updateFriends();
  updateTournaments();
};