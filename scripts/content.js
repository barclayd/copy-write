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
})();

const copyToClipboard = (content) => {
  navigator.clipboard
    .writeText(content)
};
