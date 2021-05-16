import axios from 'axios'

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
  let today = new Date()
  if (today.getDate() > 23) {
    host = "https://agilemana.com"
  } else {
    host = "https://pokrex.com"
  }
} else {
  host = "http://dev.local:3000"
}

export const SERVER_HOST = host

