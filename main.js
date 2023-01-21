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
  console.log('I was clicked!', info);
  switch (info.mediaType) {
    case 'image': {
      chrome.tabs.sendMessage(tab.id, {
        type: 'copy',
        content: info.srcUrl
      });
    }
  }
});

chrome.commands.onCommand.addListener(function (command) {
  console.log('command', command);
  switch (command) {
    case 'copy': {
      chrome.tabs.sendMessage(contentId, {
        type: 'copy-command'
      });
    }
  }
});
