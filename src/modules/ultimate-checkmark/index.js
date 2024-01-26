import {
  addStyles,
  doRequest,
  getCurrentPage,
  getCurrentTab,
  getFlag,
  getSetting,
  makeElement,
  onNavigation,
  sessionGet,
  sessionSet
} from '@utils';

import categories from '@data/ultimate-checkmark.json';

import settings from './settings';
import styles from './styles.css';

const getItems = async (required, queryTab, queryTag, allItems = []) => {
  if (! allItems.length) {
    // cache the data for a minute

    const cachedData = sessionGet('ultimate-checkmark') || '{}';

    let inventoryData = cachedData[queryTab]?.data || null;
    const lastCachedTime = cachedData[queryTab]?.time || 0;

    // Cache the data for 5 minutes.
    if (! inventoryData || Date.now() - lastCachedTime > 5 * 60 * 1000) {
      inventoryData = await doRequest('managers/ajax/pages/page.php', {
        page_class: 'Inventory',
        'page_arguments[legacyMode]': '',
        'page_arguments[tab]': queryTab,
        'page_arguments[sub_tab]': 'false',
      });

      cachedData[queryTab] = {
        data: inventoryData,
        time: Date.now(),
      };

      sessionSet('ultimate-checkmark', cachedData);
    }

    // Find the inventoryData.page.tabs array item that has type=special
    const specialTab = inventoryData.page.tabs.find((tab) => queryTab === tab.type);
    if (! specialTab || ! specialTab.subtabs || ! specialTab.subtabs.length || ! specialTab.subtabs[0].tags) {
      return [];
    }

    const owned = specialTab.subtabs[0].tags.filter((tag) => queryTag === tag.type);
    if (! owned || ! owned.length || ! owned[0].items) {
      return [];
    }

    allItems = owned[0].items;
  }

  // Merge the required allItems with the owned allItems
  required.forEach((requiredItem) => {
    const ownedItem = allItems.find((i) => i.type === requiredItem.type);
    if (! ownedItem) {
      allItems.push(requiredItem);
    }
  });

  allItems = allItems.map((item) => {
    const requiredItem = required.find((i) => i.type === item.type);

    return {
      item_id: item.item_id, // eslint-disable-line camelcase
      type: item.type,
      name: item.name,
      thumbnail: item.thumbnail_gray || item.thumbnail, // eslint-disable-line camelcase
      quantity: item.quantity || 0,
      quantity_formatted: item.quantity_formatted || '0', // eslint-disable-line camelcase
      le: ! requiredItem,
    };
  });

  // sort the items array by name
  allItems.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  return allItems;
};

const getProgress = (items, required) => {
  // Count the number of required chests that are owned
  let le = 0;
  let requiredCompleted = 0;
  items.forEach((item) => {
    if (item.quantity <= 0) {
      return;
    }

    if (! item.le) {
      requiredCompleted++;
    } else if (item.le) {
      le++;
    }
  });

  return {
    checkmark: required.total >= requiredCompleted,
    completed: requiredCompleted,
    required: required.length,
    le,
  };
};

const makeProgressString = (progress) => {
  const { completed, required, le } = progress;

  let text = `${completed} of ${required}`;
  if (le && le > 0) {
    text += ` (+${le} LE)`;
  }

  return text;
};

const makeCategory = (category, name, progress) => {
  const exists = document.querySelector(`.hunterProfileItemsView-category[data-category="${category}"]`);
  if (exists) {
    return;
  }

  const sidebar = document.querySelector('.hunterProfileItemsView-directory');
  if (! sidebar) {
    return;
  }

  const catSidebarCategory = makeElement('a', 'hunterProfileItemsView-category');
  if (progress.completed === progress.required) {
    catSidebarCategory.classList.add('complete');
  }

  catSidebarCategory.title = name;
  catSidebarCategory.href = '#';
  catSidebarCategory.setAttribute('data-category', category);
  catSidebarCategory.addEventListener('click', () => {
    hg.views.HunterProfileItemsView.showCategory(category);
    return false;
  });

  const catSidebarCategoryMargin = makeElement('div', 'hunterProfileItemsView-category-margin');

  makeElement('div', 'hunterProfileItemsView-category-name', name, catSidebarCategoryMargin);
  makeElement('div', 'hunterProfileItemsView-category-progress', makeProgressString(progress), catSidebarCategoryMargin);
  makeElement('div', 'hunterProfileItemsView-category-status', '', catSidebarCategoryMargin);

  catSidebarCategory.append(catSidebarCategoryMargin);

  sidebar.append(catSidebarCategory);
};

const makeItem = (item) => {
  const { item_id, type, name, thumbnail, thumbnail_gray, quantity, quantity_formatted, le } = item; // eslint-disable-line camelcase

  const itemDiv = makeElement('div', 'hunterProfileItemsView-categoryContent-item');
  if (quantity > 0) {
    itemDiv.classList.add('collected');
    if (le) {
      itemDiv.classList.add('limited_edition');
    }
  } else {
    itemDiv.classList.add('uncollected');
    itemDiv.classList.add('hidden');
  }

  itemDiv.setAttribute('data-id', item_id);
  itemDiv.setAttribute('data-type', type);

  const itemPadding = makeElement('div', 'hunterProfileItemsView-categoryContent-item-padding');
  itemPadding.addEventListener('click', () => {
    hg.views.ItemView.show(type);
  });

  const itemImage = makeElement('div', 'itemImage');
  itemImage.style.backgroundImage = (quantity > 0 && thumbnail_gray) ? `url(${thumbnail_gray})` : `url(${thumbnail})`; // eslint-disable-line camelcase

  if (quantity > 0) {
    makeElement('div', 'quantity', quantity_formatted, itemImage);
  }

  const itemName = makeElement('div', 'hunterProfileItemsView-categoryContent-item-name');
  makeElement('span', '', name, itemName);

  itemPadding.append(itemImage);
  itemPadding.append(itemName);

  itemDiv.append(itemPadding);

  return itemDiv;
};

const makeContent = (id, name, items, completed) => {
  const content = document.querySelector('.hunterProfileItemsView-content-padding');
  if (! content) {
    return;
  }

  const categoryDiv = makeElement('div', 'hunterProfileItemsView-categoryContent');
  if (completed) {
    categoryDiv.classList.add('collected');
  }

  categoryDiv.setAttribute('data-category', id);

  const nameDiv = makeElement('div', 'hunterProfileItemsView-categoryContent-name', name);

  const itemsDiv = document.createElement('div');

  // sort the items by name
  items.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return 0;
  });

  items.forEach((item) => {
    itemsDiv.append(makeItem(item));
  });

  categoryDiv.append(nameDiv);
  categoryDiv.append(itemsDiv);

  content.append(categoryDiv);
};

const sendToApi = async (type, subtype, items) => {
  items = items.map((item) => {
    return {
      item_id: item.item_id, // eslint-disable-line camelcase
      type: item.type,
      name: item.name,
      thumbnail: item.thumbnail.replaceAll('https://www.mousehuntgame.com/images/', ''), // eslint-disable-line camelcase
      quantity: item.quantity,
      quantity_formatted: item.quantity_formatted, // eslint-disable-line camelcase
      le: item.le,
    };
  });

  await fetch('https://ultimate-checkmark.mouse.rip/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snuid: user.sn_user_id,
      type,
      subtype,
      items,
    }),
  });
};

const getItemsFromApi = async (userId, type, subtype) => {
  userId = 'hg_a07516a70978d1dbaf9e29ce638073d9';

  const response = await fetch(`https://ultimate-checkmark.mouse.rip/get/${userId}/${type}/${subtype}`);
  const data = await response.json();

  const items = JSON.parse(data.items).map((item) => {
    return {
      item_id: item.item_id, // eslint-disable-line camelcase
      type: item.type,
      name: item.name,
      thumbnail: `https://www.mousehuntgame.com/images/${item.thumbnail}`, // eslint-disable-line camelcase
      quantity: item.quantity,
      quantity_formatted: item.quantity_formatted, // eslint-disable-line camelcase
      le: item.le,
    };
  });

  return items;
};

const addCategoryAndItems = async (required, type, subtype, key, name, userId = null) => {
  const exists = document.querySelector(`.hunterProfileItemsView-categoryContent[data-category="${key}"]`);
  if (exists) {
    return;
  }

  let items;

  if (isOwnProfile()) {
    items = await getItems(required, type, subtype);

    if (syncWithServer) {
      sendToApi(type, subtype, items);
    }
  } else {
    if (! syncWithServer) {
      return;
    }

    items = await getItemsFromApi(userId, type, subtype);
  }

  const progress = getProgress(items, required);

  makeCategory(key, name, progress);
  makeContent(key, name, items, progress.completed);

  return true;
};

const isOwnProfile = () => {
  const params = hg.utils.PageUtil.getQueryParams();
  if (! params || ! params.snuid) {
    return false;
  }

  return params.snuid === user.sn_user_id;
};

const run = async () => {
  if (! ('hunterprofile' === getCurrentPage() && 'items' === getCurrentTab())) {
    return;
  }

  const params = hg.utils.PageUtil.getQueryParams();
  if (! params) {
    return;
  }

  let userId = null;
  if (! isOwnProfile()) {
    if (! syncWithServer) {
      return;
    }

    userId = params.snuid;
  }

  for (const category of categories) {
    if (! getSetting(`ultimate-checkmark-categories-${category.id}`, true)) {
      continue;
    }

    await addCategoryAndItems(category.items, category.type, category.subtype, category.key, category.name, userId);
  }
};

let syncWithServer = false;
/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  if (getFlag('ultimate-checkmark-sync')) {
    syncWithServer = true;
  }

  onNavigation(run, {
    page: 'hunterprofile',
    tab: 'items',
  });
};

export default {
  id: 'ultimate-checkmark',
  name: 'Ultimate Checkmark',
  type: 'feature',
  default: true,
  description: 'Adds more things collect on your Hunter profile.',
  load: init,
  alwaysLoad: true,
  settings,
};
