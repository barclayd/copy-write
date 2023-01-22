const queryOptions = { active: true, lastFocusedWindow: true };

const updateIsActiveStyling = () => {
  if (document.getElementById('is-active') === null) {
    const statusSpan = document.createElement('span');
    statusSpan.className = 'status-container';
    const isActiveIconSpan = document.createElement('span');
    isActiveIconSpan.id = 'is-active-logo';
    isActiveIconSpan.className = 'is-active';
    isActiveIconSpan.textContent = '✓ ';
    const isActiveSpan = document.createElement('span');
    isActiveSpan.id = 'is-active';
    isActiveSpan.className = 'is-active';
    statusSpan.append(isActiveIconSpan, isActiveSpan);
    document.getElementById('active-status').append(statusSpan);
  }
  document.getElementById('is-active').textContent = 'Active on this site';
};

const updateHostnames = (tab) => {
  chrome.storage.local.get(
    {
      hostnames: []
    },
    (preferences) => {
      const isExtensionActiveForTab =
        preferences.hostnames.find((hostname) =>
          hostname.includes(new URL(tab.url).hostname)
        ) !== undefined;

      if (isExtensionActiveForTab) {
        updateIsActiveStyling();
      } else {
        if (document.getElementById('activate-button') !== null) {
          return;
        }
        const activateButton = document.createElement('button');
        activateButton.id = 'activate-button';
        activateButton.className = 'secondary-button';
        activateButton.innerText = 'Activate on this site';
        activateButton.onclick = () => {
          if (tab.url.startsWith('http')) {
            const { hostname } = new URL(tab.url);
            chrome.storage.local.get(
              {
                hostnames: []
              },
              (prefs) => {
                chrome.storage.local.set({
                  hostnames: [...prefs.hostnames, hostname].filter(
                    (s, i, l) => s && l.indexOf(s) === i
                  )
                });
              }
            );

            chrome.storage.local.set({
              monitor: true
            });
            chrome.tabs.reload(tab.id);
            activateButton.remove();
          }
        };
        document.getElementById('active-status').appendChild(activateButton);
      }
    }
  );
};

let lastUrlHostname = null;

chrome.permissions.onAdded.addListener(() => {
  chrome.tabs.query(queryOptions).then(([tab]) => {
    updateHostnames(tab);
  });
});

chrome.tabs.onUpdated.addListener((tabId, _, tab) => {
  if (lastUrlHostname !== new URL(tab.url).hostname) {
    updateHostnames(tab);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query(queryOptions).then(([tab]) => {
    updateHostnames(tab);
  });
});
