import { doRequest } from '@utils';

import { exportPopup, recursiveFetch } from './exporter';

// import scoreboards from '@data/scoreboards';
const scoreboards = [
  { id: 'QuestRiftValour::highest_floor_reached', name: 'Highest Gauntlet Floor Reached' },
  { id: 'QuestRiftValour::longest_ultimatum_distance_traveled', name: 'Highest Umbra Gauntlet Steps Reached' },
  { id: 'QuestRiftValour::highest_ultimatum_floor_reached', name: 'Highest Umbra Gauntlet Floor Reached' },
  { id: 'QuestFloatingIslands::total_islands_explored', name: 'Total Islands &amp; Vaults Fully Explored' },
  { id: 'QuestFloatingIslands::total_islands_explored_low_altitude', name: 'Total Low Altitude Islands Fully Explored' },
  { id: 'QuestFloatingIslands::total_islands_explored_high_altitude', name: 'Total High Altitude Islands Fully Explored' },
];

const getData = async (scoreboard) => {
  const totalItemsEl = document.querySelector(`.item-wrapper[data-region="${scoreboard.id}"] .total-items`);
  totalItemsEl.textContent = '...';

  const response = await doRequest('managers/ajax/pages/scoreboards.php', {
    action: 'get_page',
    category: 'main',
    scoreboard: scoreboard.id,
    page: 1,
    weekly: 0,
    friends_only: 0,
    search: '',
  });

  if (null === response.scoreboard_page?.viewer_row) {
    totalItemsEl.textContent = '-';

    return {
      scoreboard: scoreboard.name,
      rank: '',
      value: '',
    };
  }

  const entry = {
    rank: response.scoreboard_page.viewer_row.rank,
    points: response.scoreboard_page.viewer_row.points,
  };

  const rankSuffix = response.scoreboard_page.viewer_row.rank_formatted.replaceAll(/[\d\s]+/g, '');
  totalItemsEl.textContent = `${entry.rank.toLocaleString()}${rankSuffix}`;

  // resolve the promise with the data
  return {
    scoreboard: scoreboard.name,
    rank: entry.rank,
    value: entry.points,
  };
};

const exportScoreboards = () => {
  let inventoryMarkup = '';
  scoreboards.forEach((region) => {
    inventoryMarkup += `<div class="item-wrapper scoreboard" data-region="${region.id}">
      <div class="region-name">${region.name}</div>
      <div class="total-items">-</div>
  </div>`;
  });

  exportPopup({
    type: 'scoreboard-rankings',
    text: 'Scoreboard Rankings',
    headerMarkup: '<div class="region-name">Scoreboard</div><div class="total-items">Place</div>',
    itemsMarkup: inventoryMarkup,
    fetch: () => recursiveFetch(scoreboards, getData),
    download: {
      headers: [
        'Scoreboard',
        'Rank',
        'Value',
      ],
    }
  });
};

export default exportScoreboards;
