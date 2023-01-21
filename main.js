chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'copyContextMenu',
    title: 'CopyWrite - Copy',
    contexts: ['all']
  });
});

let cachedTabId = null;

chrome.tabs.onUpdated.addListener((tabId) => {
  cachedTabId = tabId;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.sendMessage(tab.id, {
    type: 'copy',
    content: info.selectionText
  });
});

chrome.commands.onCommand.addListener(() => {
  if (cachedTabId) {
    chrome.tabs.sendMessage(cachedTabId, {
      type: 'copy-command'
    });
    return;
  }

  chrome.tabs.getCurrent().then((tab) => {
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'copy-command'
      });
    }
  });
});
