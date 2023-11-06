import globalStyles from './_required/styles/global-styles.css';

const addAdvancedSettings = () => {
  // Add the advanced override settings.
  const advancedTab = {
    id: 'mousehunt-improved-settings-overrides',
    name: 'Overrides',
    default: true,
    description: 'Modify MouseHunt Improved.'
  };

  addSetting(
    'Custom Styles',
    'override-styles',
    '',
    'Add custom CSS to the page.',
    advancedTab,
    'mousehunt-improved-settings',
    { type: 'textarea' }
  );

  addSetting(
    'Custom Flags',
    'override-flags',
    '',
    'Apply custom flags to modify MouseHunt Improved\'s behavior.',
    advancedTab,
    'mousehunt-improved-settings',
    { type: 'input' }
  );
};

const addSettingForModule = (module) => {
  module.modules.forEach((subModule) => {
    if (! subModule.alwaysLoad) {
      addSetting(
        subModule.name,
        subModule.id,
        subModule.default,
        subModule.description,
        { id: module.id, name: module.name,
          description: module.description },
        'mousehunt-improved-settings'
      );
    }

    if (subModule.settings && (subModule.alwaysLoad || getSetting(subModule.id, subModule.default, 'mousehunt-improved-settings'))) {
      subModule.settings(module);
    }
  });
};

const showLoadingError = (e) => {
  console.error('Error loading MouseHunt Improved:', e); // eslint-disable-line no-console

  // Add the error to the page.
  const errorElement = document.createElement('div');
  errorElement.classList.add('mousehunt-improved-error');
  errorElement.innerHTML = `
    <h1>Error loading MouseHunt Improved</h1>
    <p>There was an error loading MouseHunt Improved. Try refreshing the page. If the error persists, please add an issue to the <a href="https://github.com/MHCommunity/mousehunt-improved">GitHub repo</a>.</p>
  `;
  document.body.appendChild(errorElement);

  const errorStyles = document.createElement('style');
  errorStyles.innerHTML = globalStyles;
  document.head.appendChild(errorStyles);
};

export {
  addAdvancedSettings,
  addSettingForModule,
  showLoadingError
};
