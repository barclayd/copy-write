chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'copyContextMenu',
    title: 'CopyWrite - Copy',
    contexts: ['all']
  });
});

let contentId = null;

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  contentId = tabId;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.mediaType) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'copy',
      content: info.selectionText
    });
    return;
  }
  switch (info.mediaType) {
    // case 'image': {
    //   chrome.tabs.sendMessage(tab.id, {
    //     type: 'copy',
    //     content: info.srcUrl
    //   });
    //   break;
    // }
  }
});

chrome.commands.onCommand.addListener(function (command) {
  switch (command) {
    case 'copy': {
      chrome.tabs.sendMessage(contentId, {
        type: 'copy-command'
      });
    }
  }
});
