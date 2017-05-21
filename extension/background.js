// background.js

var tabDict = {};
var tabList = [];
var tabHistory = [];

var replayMode = false;

class TabRecord {
  constructor(tabUID, timestamp) {
    this.tabUID = tabUID;
    this.timestamp = timestamp;
  }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (replayMode) {
    tabList.push(tab)
    tabDict[tabId] = tabList.length-1
    tabHistory.push(new TabRecord(tabDict[tabId], (new Date()).getTime()))
//     chrome.runtime.sendMessage("mpkbfmdhciepiffhidjiloldcfejkebc", {"tabActivated": tabHistory[tabHistory.length-1]})
//     chrome.runtime.sendMessage("mpkbfmdhciepiffhidjiloldcfejkebc", {"newTab": {"id":tabList.length-1, "tab": tab}})
    tabActivatedRecord = {}
    tabActivatedRecord["tabActivated-" + (tabHistory.length-1)] = tabHistory[tabHistory.length-1]
    chrome.storage.local.set(tabActivatedRecord)
    tabListRecord = {}
    tabListRecord["newTab-" + (tabList.length-1)] = tab
    chrome.storage.local.set(tabListRecord)
  }
})

chrome.tabs.onActivated.addListener(function(activeTab) {
  if (replayMode) {
    return;
  }
  console.log("onActivated")
  if (typeof tabDict[activeTab.tabId] !== "undefined") {
    console.log(tabDict[activeTab.tabId])
    tabHistory.push(new TabRecord(tabDict[activeTab.tabId], (new Date()).getTime()))
//     chrome.runtime.sendMessage("mpkbfmdhciepiffhidjiloldcfejkebc", {"tabActivated": tabHistory[tabHistory.length-1]})
    tabActivatedRecord = {}
    tabActivatedRecord["tabActivated-" + (tabHistory.length-1)] = tabHistory[tabHistory.length-1]
    chrome.storage.local.set(tabActivatedRecord)
  }
});

//
// The following code is for replay purpose
//

var storedTabDict = {};
var storedTabList = [];
var storedTabHisotry = [];
var newTabIdBegin = 0;
var newTabIdEnd = 186;
var tabHistoryBegin = 0;
// var tabHistoryEnd = 326;
var tabHistoryEnd = 30;
var speedup = 2;

chrome.alarms.onAlarm.addListener(function(alarm) {
  replayTabHistory(parseInt(alarm.name) + 1)
});

function replayTabHistory(id) {
  if (!replayMode) {
    return;
  }
  console.log("id: " + id)
  tabUID = storedTabHistory[id].tabUID
  if (!(tabUID in storedTabDict)) {
//     console.log("tab not exist")
//       console.log(storedTabList[tabUID - newTabIdBegin].url)
    chrome.tabs.create({url: storedTabList[tabUID - newTabIdBegin].url}, function(tab) {
      storedTabDict[tabUID] = tab;
      console.log("creat new tab callback")
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
    if (id + tabHistoryBegin + 1 >= tabHistoryEnd) {
      return;
    }
    var timeInterval = (storedTabHistory[id + 1].timestamp - storedTabHistory[id].timestamp) / speedup
    console.log("timeInterval: " + timeInterval);
//     setTimeout(replayTabHistory(id+1), timeInterval);
    chrome.alarms.create(String(id), {when: Date.now() + timeInterval})
  }
}

function getTabList(id) {
  if (!replayMode) {
    return;
  }
  if (id >= newTabIdEnd) {
    replayTabHistory(0)
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
  if (!replayMode) {
    return;
  }
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

function replayTrace() {
  if (!replayMode) {
    return;
  }
  getTabHistory(tabHistoryBegin)
}

// browser action
// to toggle replay mode
chrome.browserAction.onClicked.addListener(function(tab) {
  replayMode = !replayMode
  if (!replayMode) {
    return;
  }
  storedTabDict = {}
  storedTabList = []
  storedTabHistory = []
  console.log("replayMode " + replayMode)
  replayTrace()
})
