let cachedTabId = null;

chrome.tabs.onUpdated.addListener((tabId) => {
  cachedTabId = tabId;
});

const notify = (message) =>
  chrome.notifications.create({
    title: chrome.runtime.getManifest().name,
    message,
    type: 'basic',
    iconUrl: 'images/icon-48.png'
  });

const onClicked = (tabId, obj) =>
  chrome.scripting.executeScript(
    {
      target: {
        tabId,
        ...obj
      },
      files: ['inject/core.js']
    },
    () => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        console.warn(lastError);
        notify(lastError.message);
      }
    }
  );
chrome.action.onClicked.addListener((tab) =>
  onClicked(tab.id, {
    allFrames: true
  })
);

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'status') {
    chrome.scripting.executeScript(
      {
        target: {
          tabId: sender.tab.id
        },
        func: () => window.pointers.status
      },
      (r) => response(r[0].result)
    );

    return true;
  } else if (request.method === 'inject') {
    if (sender.frameId === 0) {
      chrome.action.setIcon({
        tabId: sender.tab.id,
        path: {
          16: 'images/icon-16.png',
          32: 'images/icon-32.png',
          48: 'images/icon-48.png'
        }
      });
    }
    for (const file of request.files) {
      chrome.scripting.executeScript({
        target: {
          tabId: sender.tab.id,
          frameIds: [sender.frameId]
        },
        files: ['inject/' + file]
      });
    }
  } else if (request.method === 'release') {
    if (sender.frameId === 0) {
      chrome.action.setIcon({
        tabId: sender.tab.id,
        path: {
          16: 'images/icon-16.png',
          32: 'images/icon-32.png',
          48: 'images/icon-48.png'
        }
      });
    }
  } else if (request.method === 'inject-unprotected') {
    chrome.scripting.executeScript({
      target: {
        tabId: sender.tab.id,
        frameIds: [sender.frameId]
      },
      func: (code) => {
        const script = document.createElement('script');
        script.classList.add('copyWrite');
        script.textContent =
          'document.currentScript.dataset.injected = true;' + code;
        document.documentElement.appendChild(script);
        if (script.dataset.injected !== 'true') {
          const s = document.createElement('script');
          s.classList.add('copyWrite');
          s.src = 'data:text/javascript;charset=utf-8;base64,' + btoa(code);
          document.documentElement.appendChild(s);
          script.remove();
        }
      },
      args: [request.code],
      world: 'MAIN'
    });
  } else if (request.method === 'simulate-click') {
    onClicked(sender.tab.id, {
      frameIds: [sender.frameId]
    });
  }
});

{
  const observe = () =>
    chrome.storage.local.get(
      {
        monitor: false,
        hostnames: []
      },
      async (prefs) => {
        await chrome.scripting.unregisterContentScripts();

        if (prefs.monitor && prefs.hostnames.length) {
          const matches = new Set();
          for (const hostname of prefs.hostnames) {
            if (hostname.includes('*')) {
              matches.add(hostname);
            } else {
              matches.add(hostname);
              matches.add(hostname);
            }
          }
          for (let m of matches) {
            if (m.includes(':') === false) {
              m = '*://' + m;
            }
            if (m.endsWith('*') === false) {
              if (m.endsWith('/')) {
                m += '*';
              } else {
                m += '/*';
              }
            }
            console.log(m);
            chrome.scripting
              .registerContentScripts([
                {
                  allFrames: true,
                  matchOriginAsFallback: true,
                  runAt: 'document_start',
                  id: 'monitor-' + Math.random(),
                  js: ['/monitor.js'],
                  matches: [m]
                }
              ])
              .catch((e) => {
                console.error(e);
                notify(
                  `Cannot use the following automation rule: ${m}:` + e.message
                );
              });
          }
        }
      }
    );
  observe();
  chrome.storage.onChanged.addListener((prefs) => {
    if (
      (prefs.monitor && prefs.monitor.newValue !== prefs.monitor.oldValue) ||
      (prefs.hostnames && prefs.hostnames.newValue !== prefs.hostnames.oldValue)
    ) {
      observe();
    }
    if (prefs.monitor) {
      permission();
    }
  });
}

const permission = () =>
  chrome.permissions.contains({
    origins: ['*://*/*']
  });

{
  const callback = () => {
    chrome.contextMenus.create({
      id: 'add-to-whitelist',
      title: 'Activate on this site',
      contexts: ['action']
    });
  };
  chrome.runtime.onInstalled.addListener(callback);
  chrome.runtime.onStartup.addListener(callback);
}
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const url = tab.url || info.pageUrl;
  if (url.startsWith('http')) {
    const { hostname } = new URL(url);
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

    chrome.permissions.contains(
      {
        origins: ['*://*/*']
      },
      (granted) => {
        if (granted) {
          chrome.storage.local.set({
            monitor: true
          });
        } else {
          setTimeout(() => chrome.runtime.openOptionsPage(), 1000);
        }
      }
    );
  } else {
    notify(`Invalid URL provided: ${url}`);
  }
});
