window.pointers = window.pointers || {
  run: new Set(),
  cache: new Map(),
  status: ''
};

window.pointers.record = (e, name, value) => {
  window.pointers.cache.set(e, { name, value });
};

window.pointers.inject = (code) =>
  chrome.runtime.sendMessage({
    method: 'inject-unprotected',
    code
  });

{
  const next = () => {
    if (window.pointers.status === '' || window.pointers.status === 'removed') {
      window.pointers.status = 'ready';

      for (const script of [...document.querySelectorAll('script.copyWrite')]) {
        script.dispatchEvent(new Event('install'));
      }

      chrome.runtime.sendMessage({
        method: 'inject',
        files: ['user-select.js', 'styles.js', 'mouse.js', 'listen.js']
      });
    } else {
      window.pointers.status = 'removed';

      chrome.runtime.sendMessage({
        method: 'release'
      });

      for (const c of window.pointers.run) {
        c();
      }
      window.pointers.run = new Set();

      for (const script of [...document.querySelectorAll('script.copyWrite')]) {
        script.dispatchEvent(new Event('remove'));
      }

      for (const [e, { name, value }] of window.pointers.cache) {
        e.style[name] = value;
      }
      window.pointers.cache = new Set();
    }
  };

  if (window.top === window) {
    next();
  } else {
    chrome.runtime.sendMessage(
      {
        method: 'status'
      },
      (resp) => {
        if (resp === 'removed' && window.pointers.status === '') {
          window.pointers.status = 'ready';
        }
        next();
      }
    );
  }
}
