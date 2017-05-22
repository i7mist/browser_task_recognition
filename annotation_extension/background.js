// background.js

var storedTabDict = {};
var storedTabList = [];
var storedTabHistory = [];
var newTabIdBegin = 0;
var newTabIdEnd = 513;
// var tabHistoryBegin = 0;
var tabHistoryBegin = 0;
var tabHistoryEnd = 1138;
var speedup = 5;

var pauseReplayTab = newTabIdBegin
var traceLoaded = false

function replayTabHistory(id) {
  console.log("id: " + id)
  tabUID = id
  if (!(tabUID in storedTabDict)) {
    console.log("tab not exist")
//     console.log(storedTabList)
//     console.log(tabUID - newTabIdBegin)
//     console.log(storedTabList[tabUID - newTabIdBegin])
//     console.log(storedTabList[tabUID - newTabIdBegin].url)
    chrome.tabs.create({url: storedTabList[tabUID - newTabIdBegin].url}, function(tab) {
      storedTabDict[tabUID] = tab;
      console.log("create new tab callback")
      console.log(storedTabDict[tabUID])
      console.log(tabUID in storedTabDict)
      creatingTab = false;
      replayTabHistory(id);
    })
  } else {
    console.log("UID: " + tabUID)
    console.log(storedTabDict[tabUID])
    console.log("tabid: " + storedTabDict[tabUID].id)
    chrome.tabs.update(storedTabDict[tabUID].id, {active:true})
//     chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
//       console.log("tabs")
//       console.log(tabs)
//       chrome.tabs.sendMessage(tabs[0].id, {UID: tabUID})
//     })
  }
}

function getTabList(id) {
  if (id >= newTabIdEnd) {
    return;
  }
  chrome.storage.local.get("newTab-" + id, function(items) {
//     console.log(items["newTab-" + id])
//     console.log(storedTabList)
    storedTabList.push(items["newTab-" + id])
    getTabList(id + 1)
  })
}

function getTabHistory(id) {
  if (id >= tabHistoryEnd) {
    getTabList(newTabIdBegin)
    return;
  }
  chrome.storage.local.get("tabActivated-" + id, function(items) {
//     console.log(items["tabActivated-" + id])
//     console.log(storedTabHistory)
    storedTabHistory.push(items["tabActivated-" + id])
    getTabHistory(id + 1)
  });
}

function loadTrace() {
  getTabHistory(tabHistoryBegin)
}

// browser action
// to toggle replay mode
chrome.browserAction.onClicked.addListener(function(tab) {
  if (!traceLoaded) {
    loadTrace()
    traceLoaded = true
  } else {
    if (pauseReplayTab < newTabIdEnd) {
      replayTabHistory(pauseReplayTab)
    } else {
      pauseReplayTab = 0
    }
    pauseReplayTab = pauseReplayTab + 1
  }
})
