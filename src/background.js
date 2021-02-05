chrome.runtime.onInstalled.addListener(function() {
  // add an action here
});

chrome.browserAction.onClicked.addListener(function(tab){
  chrome.tabs.create({
    url: chrome.extension.getURL("prepare.html")
  })
})

// Listen on message from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message == "synkLinkClicked") {
    chrome.tabs.create({
      url: chrome.extension.getURL(`sync.html#${request.roomId}`)
    })
  }
});
