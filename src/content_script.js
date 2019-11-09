import { GetBrowserStorage } from './storage.js'
setTimeout(() => {
  let storage = GetBrowserStorage()
  // Show add button on issue list page
  let jiraPage = document.getElementById("jira")
  if (typeof(jiraPage) !== 'undefined' && jiraPage !== null) {
    let issueSearchItems = document.querySelectorAll(".issuerow .issuekey")
    let tooltipBar = document.querySelector(".aui-toolbar2-primary, .toolbar-split-left")

    if (typeof(tooltipBar) !== 'undefined' && tooltipBar !== null) {
      let buttonOnIssuePage = document.createElement("button")
      let issueLink = location.origin + location.pathname
      buttonOnIssuePage.className = "pokrex-add-to-btn-issue-page"
      storage.get("prepItems", (result) => {
        let prepItems = result["prepItems"] || []
        if(prepItems.find(item => item.link == issueLink)) {
          buttonOnIssuePage.classList.add("saved")
        }
      })
      buttonOnIssuePage.addEventListener("click", function(e) {
        e.preventDefault()
        e.stopPropagation()
        let issueId = document.querySelector("#key-val,.issue-link").getAttribute("data-issue-key")
        let issueTitle = document.querySelector("#summary-val").innerText
        storage.get("prepItems", (result) => {
          let prepItems = ( result && result["prepItems"] ) || []
          if(!prepItems.find(item => item.link == issueLink)) {
            prepItems.push({link: issueLink, desc: issueTitle})
            buttonOnIssuePage.classList.add("saved")
          } else {
            prepItems = prepItems.filter(item => item.link !== issueLink)
            buttonOnIssuePage.classList.remove("saved")
          }
          storage.set({prepItems: prepItems}, () => {
            console.dir("list", prepItems)
          });
        })
      })
      tooltipBar.appendChild(buttonOnIssuePage)
    }
  }

  function openExtensionWithRoomId(roomId) {
    let slug = roomId || location.pathname.slice(7)
    chrome.runtime.sendMessage({message: "synkLinkClicked", roomId: slug}, () => {
    })
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

