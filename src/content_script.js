import { GetBrowserStorage } from './utilities.js'

setTimeout(() => {
  let storage = GetBrowserStorage()
  // Show add button on issue list page
  let jiraPage = document.querySelector("body#jira")
  if (typeof(jiraPage) !== 'undefined' && jiraPage !== null) {
    let barFragment = document.createDocumentFragment()

    let bar = document.createElement("div")
    bar.id = "pokrex-jira-assistant"

    let addTicketButton = document.createElement("button")
    let issueLink = toTicketLink(document.location.href)
    addTicketButton.className = "pokrex-add-to-btn-issue-page"
    bar.appendChild(addTicketButton)

    let openExtensionButton = document.createElement("button")
    openExtensionButton.className = "pokrex-open-extension-btn"
    openExtensionButton.addEventListener("click", function(e) {
      chrome.runtime.sendMessage({message: "openExtension"}, () => {
      })
    })
    bar.appendChild(openExtensionButton)

    barFragment.appendChild(bar)

    storage.get("prepItems", (result) => {
      let prepItems = result["prepItems"] || []
      if(prepItems.find(item => item.link == issueLink)) {
        addTicketButton.classList.add("saved")
      }
    })

    addTicketButton.addEventListener("click", function(e) {
      e.preventDefault()
      e.stopPropagation()
      let issueTitle = document.title
      let issueTitleNode = document.querySelector(`[data-test-id="issue.views.issue-base.foundation.summary.heading"]`)
      if (typeof issueTitleNode  !== "undefined" || issueTitleNode !== null) {
        issueTitle = issueTitleNode.textContent
      }

      storage.get("prepItems", (result) => {
        console.log("===Result", result)
        let prepItems = ( result && result["prepItems"] ) || []
        if(!prepItems.find(item => item.link == issueLink)) {
          prepItems.push({link: issueLink, desc: issueTitle})
          addTicketButton.classList.add("saved")
        } else {
          prepItems = prepItems.filter(item => item.link !== issueLink)
          addTicketButton.classList.remove("saved")
        }
        storage.set({prepItems: prepItems}, () => {
          console.dir("list: ", prepItems)
        });
      })
    })

    jiraPage.appendChild(barFragment)
  }

  function openExtensionWithRoomId(roomId) {
    let slug = roomId || location.pathname.slice(7)
    chrome.runtime.sendMessage({message: "synkLinkClicked", roomId: slug}, () => {
    })
  }

  function toTicketLink(issueLink) {
    // http://localhost:8080/browse/POK-4 => http://localhost:8080/rest/api/2/issue/POK-1
    const anchorTag = document.createElement('a')
    anchorTag.href = issueLink
    const matches = /\/browse\/(.*)/.exec(anchorTag.pathname)
    return matches && `${anchorTag.origin}/browse/${matches[1]}`
  }

  // Listen to "Sync" on click event from room page
  const synkLink = document.querySelector("#synk-link")
  if(typeof synkLink !== "undefined" && synkLink !== null) {
    synkLink.addEventListener("click", (e) => {
      openExtensionWithRoomId(synkLink.dataset.roomId)
    })
  }

  // Delegate sync button click event to board
  const board = document.querySelector("#board")
  if (typeof board !== "undefined" && board !== null) {
    board.addEventListener("click", (e) => {
      let target = e.target
      if (target.id === "synk-button") {
        openExtensionWithRoomId(target.dataset.roomId)
      }
    })
  }

  // Fill DIV with extension id
  const extensionCheckElement = document.getElementById("browser-extension-check")
  if (typeof(extensionCheckElement) !== 'undefined' && extensionCheckElement !== null) {
    extensionCheckElement.innerText = chrome.runtime.id
  }
}, 1000)

