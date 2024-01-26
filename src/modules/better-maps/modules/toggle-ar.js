import { getArEl, makeElement, mapper } from '@utils';

const addArDataToMap = async (mapData) => {
  let type = 'mouse';
  if (mapData?.goals?.mouse.length === 0) {
    type = 'item';
  }

  const mice = mapData?.goals?.[type] || [];

  if (! mice || mice.length === 0) {
    return;
  }

  // Remove the hidden class if we've already added the AR data.
  const goals = document.querySelectorAll('.treasureMapView-goals-groups');
  if (goals && goals.length > 0) {
    let hasAdded = false;

    goals.forEach((goal) => {
      if (goal.classList.contains('mh-ui-ar-hidden')) {
        goal.classList.remove('mh-ui-ar-hidden');
        hasAdded = true;
      }
    });

    if (hasAdded) {
      return;
    }
  }

  mice.forEach(async (mouse) => {
    const mouseEl = document.querySelector(`.treasureMapView-goals-group-goal[data-unique-id="${mouse.unique_id}"]`);
    if (! mouseEl) {
      return;
    }

    if (mouseEl.classList.contains('complete')) {
      return;
    }

    if (mouseEl.getAttribute('data-mh-ui-ar')) {
      const existing = mouseEl.querySelector('.mh-ui-ar');
      if (existing) {
        existing.remove();
      }
    }

    const name = mouseEl.querySelector('.treasureMapView-goals-group-goal-name');
    if (! name) {
      return;
    }

    const arEl = await getArEl(mouse.unique_id, type);
    if (! arEl) {
      return;
    }

    name.append(arEl);

    mouseEl.setAttribute('data-mh-ui-ar', true);
  });
};

const toggleAr = async () => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  const toggle = mapView.querySelector('.mh-ui-toggle-ar-button');
  if (! toggle) {
    return;
  }

  // Disable until we're done.
  toggle.classList.add('disabled');

  const text = toggle.querySelector('.toggle-ar-text');
  if (! text) {
    return;
  }

  let arText = 'AR';
  let arTitle = 'Attraction Rates';
  const mapClass = mapView.classList.toString();
  if (mapClass.includes('scavenger')) {
    arText = 'DR';
    arTitle = 'Drop Rates';
  }

  const showing = mapView.classList.contains('mh-ui-ar-showing');
  if (showing) {
    mapView.classList.remove('mh-ui-ar-showing');
    mapView.classList.add('mh-ui-ar-hidden');
    text.innerText = `Show ${arText}`;
    toggle.title = `Show ${arTitle}`;
  } else {
    mapView.classList.add('mh-ui-ar-showing');
    mapView.classList.remove('mh-ui-ar-hidden');
    text.innerText = '···';
    await addArDataToMap(mapper('mapData'));
    text.innerText = `Hide ${arText}`;
    toggle.title = `Hide ${arTitle}`;
  }

  toggle.classList.remove('disabled');
};

const maybeClickArToggle = () => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  const toggle = mapView.querySelector('.mh-ui-toggle-ar-button');
  if (! toggle) {
    return;
  }

  const showing = mapView.classList.contains('mh-ui-ar-showing');
  const currentButtonState = toggle
    .querySelector('.toggle-ar-text')
    .innerText.replace('AR', '')
    .replace('DR', '')
    .trim();
  if (showing && currentButtonState !== 'Hide') {
    toggle.click();
  } else if (! showing && currentButtonState !== 'Show') {
    toggle.click();
  }
};

const addArToggle = async (tab = 'goals') => {
  const mapView = document.querySelector('.treasureMapView');
  if (! mapView) {
    return;
  }

  const exists = document.querySelector('.mh-ui-toggle-ar-button');
  if (exists) {
    exists.classList.remove('hidden');
    // if mapView has the showing class and we're on the goals tab, then
    // we need to also add the AR data to the map.
    if ('goals' === tab && mapView.classList.contains('mh-ui-ar-showing')) {
      addArDataToMap(mapper('mapData'));
    }

    return;
  }

  const wrapper = document.querySelector('.treasureMapRootView-subTabRow');
  if (! wrapper) {
    return;
  }

  const toggle = makeElement('button', ['mousehuntActionButton', 'tiny', 'mh-ui-toggle-ar-button']);

  let arText = 'AR';
  let arTitle = 'Attraction Rates';
  if (mapper('mapData').is_scavenger_hunt) {
    arText = 'DR';
    arTitle = 'Drop Rates';
  }

  makeElement('span', 'toggle-ar-text', `Show ${arText}`, toggle);
  toggle.title = `Show ${arTitle}`;

  toggle.addEventListener('click', toggleAr);

  wrapper.append(toggle);

  await toggleAr();

  maybeClickArToggle();
};

const removeArToggle = () => {
  const toggle = document.querySelector('.mh-ui-toggle-ar-button');
  if (toggle) {
    toggle.classList.add('hidden');
  }
};

export {
  addArToggle,
  removeArToggle
};
