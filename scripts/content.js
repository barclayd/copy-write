(() => {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    switch (message.type) {
      case 'copy': {
        copyToClipboard(message.content);
        break;
      }
      case 'copy-command': {
        const selection = document.getSelection();
        copyToClipboard(selection);
        break;
      }
    }
    sendResponse('received');
  });

  document.addEventListener('copy', () => {
    console.log('I copied');
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe, index) => {
    iframes[index].parentNode.removeChild(iframe);
  });
});

const copyToClipboard = (content) => {
  navigator.clipboard.writeText(content);
};
