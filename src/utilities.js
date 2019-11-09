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
  host = "https://pokrex.com"
} else {
  host = "http://dev.local:3000"
}
export const SERVER_HOST = host

export function ServerHost() {
  if (process.env.NODE_ENV === "development") {
    return "http://dev.local:3000"
  } else {
    return "https://pokrex.com"
  }
}
