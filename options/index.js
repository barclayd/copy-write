const toast = document.getElementById('toast');
const notify = (message) => {
  clearTimeout(notify.id);
  toast.textContent = message;
  notify.id = setTimeout(() => (toast.textContent = ''), 2000);
};

chrome.storage.local.get(
  {
    hostnames: []
  },
  (preferences) => {
    document.getElementById('whitelist').value =
      preferences.hostnames.join(', ');
  }
);

document.getElementById('save').addEventListener('click', () => {
  const hostnames = document
    .getElementById('whitelist')
    .value.split(/\s*,\s*/)
    .map((s) => {
      s = s.trim();
      if (s && s.startsWith('http')) {
        try {
          return new URL(s).origin;
        } catch (e) {
          console.log(e);
          return '';
        }
      }
      return s;
    })
    .filter((s, i, l) => s && l.indexOf(s) === i);

  chrome.storage.local.set({
    monitor: hostnames.length > 0,
    hostnames
  });
  document.getElementById('whitelist').value = hostnames.join(', ');
  notify('Options saved');
});

chrome.permissions.contains(
  {
    origins: ['*://*/*']
  },
  (granted) => {
    document.getElementById('whitelist').disabled = granted === false;
    document.getElementById('hostaccess').checked = granted;
  }
);
document.getElementById('hostaccess').onchange = (e) => {
  if (e.target.checked) {
    chrome.permissions.request(
      {
        origins: ['*://*/*']
      },
      (granted) => {
        const lastError = chrome.runtime.lastError;

        if (lastError) {
          notify(lastError.message);
        }

        document.getElementById('whitelist').disabled = granted === false;
        document.getElementById('hostaccess').checked = granted;
        chrome.storage.local.set({
          monitor: granted
        });
      }
    );
  } else {
    document.getElementById('whitelist').disabled = true;
  }
};
