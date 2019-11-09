export function GetBrowserStorage() {
  if (typeof chrome !== "undefined") {
    if (typeof browser !== "undefined") {
      return browser.storage.local
    } else {
      return chrome.storage.sync
    }
  }
}
