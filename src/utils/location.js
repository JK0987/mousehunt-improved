import { getHeaders, sessionGet, sessionSet } from './data';

/**
 * Get the current location.
 *
 * @return {string} The current location.
 */
const getCurrentLocation = () => {
  const location = user?.environment_type || '';
  return location.toLowerCase();
};

/**
 * Ping https://rh-api.mouse.rip/ to get the current location of the Relic Hunter.
 *
 * @return {Object} Relic Hunter location data.
 */
const getRelicHunterLocation = () => {
  // Cache it in session storage for 5 minutes.
  const cacheExpiry = 5 * 60 * 1000;
  const cacheKey = 'mh-improved-relic-hunter-location';
  let cached = sessionGet(cacheKey);
  if (cached) {
    cached = JSON.parse(cached);
  }

  // If we have a cached value and it's not expired, return it.
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  // Otherwise, fetch the data and cache it.
  return fetch('https://rh-api.mouse.rip/', { headers: getHeaders() })
    .then((response) => response.json())
    .then((data) => {
      const expiry = Date.now() + cacheExpiry;
      sessionSet(cacheKey, JSON.stringify({ expiry, data }));
      return data;
    })
    .catch((error) => {
      console.error(error); // eslint-disable-line no-console
    });
};

export {
  getCurrentLocation,
  getRelicHunterLocation
};
