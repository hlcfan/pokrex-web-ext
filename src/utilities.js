export function GetBrowserStorage() {
  if (typeof chrome !== "undefined") {
    if (typeof browser !== "undefined") {
      return browser.storage.local
    } else {
      return chrome.storage.sync
    }
  }
}

let host
if (process.env.NODE_ENV === "production") {
  host = "https://agilemana.com"
} else {
  // host = "http://dev.local:3000"
  host = "https://agilemana.com"
}

export const SERVER_HOST = host

