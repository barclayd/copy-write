chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'copyContextMenu',
    title: 'CopyWrite - Copy',
    contexts: ['all']
  });
});

let cachedTabId = null;

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  console.log(tabId, tab);
  cachedTabId = tabId;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log(info);
  chrome.tabs.sendMessage(tab?.id, {
    type: 'copy',
    content: info.selectionText
  });
  // switch (info.mediaType) {
  // case 'image': {
  //   chrome.tabs.sendMessage(tab.id, {
  //     type: 'copy',
  //     content: info.srcUrl
  //   });
  //   break;
  // }
  // }
});

chrome.commands.onCommand.addListener(function (command) {
  (async () => {
    const currentTab = await chrome.tabs.getCurrent();
    const tabId = currentTab?.id ?? cachedTabId;
    console.log(tabId);
    switch (command) {
      case 'copy': {
        chrome.tabs.sendMessage(currentTab?.id ?? cachedTabId, {
          type: 'copy-command'
        });
      }
    }
  })();
});
