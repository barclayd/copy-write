const permissions = {
  origins: ['*://*/*']
};

const queryOptions = { active: true, lastFocusedWindow: true };

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
        document.getElementById('is-active').textContent =
          '✓ Active on this site';
        document.getElementById('is-active').style.color = 'rgb(52,168,83)';
      } else {
        const activateButton = document.createElement('button');
        activateButton.id = 'activate-button';
        activateButton.innerText = 'Activate for this site';
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

            chrome.permissions.contains(permissions, (granted) => {
              if (granted) {
                chrome.storage.local.set({
                  monitor: true
                });
                chrome.tabs.reload(tab.id);
                activateButton.remove();
              } else {
                chrome.permissions.request(
                  {
                    origins: ['*://*/*']
                  },
                  (granted) => {
                    const lastError = chrome.runtime.lastError;

                    if (lastError) {
                      notify(lastError.message);
                    }

                    chrome.storage.local.set({
                      monitor: granted
                    });
                  }
                );
              }
            });
          }
        };
        document.getElementById('permissions').appendChild(activateButton);
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
