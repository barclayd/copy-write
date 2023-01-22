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
