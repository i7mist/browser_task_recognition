// background.js

var tabDict = {};
var tabList = [];
var tabHistory = [];

class TabRecord {
  constructor(tabUID, timestamp) {
    this.tabUID = tabUID;
    this.timestamp = timestamp;
  }
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    tabList.push(tab)
    tabDict[tabId] = tabList.length-1
    tabHistory.push(new TabRecord(tabDict[tabId], (new Date()).getTime()))
//     chrome.runtime.sendMessage("mpkbfmdhciepiffhidjiloldcfejkebc", {"tabActivated": tabHistory[tabHistory.length-1]})
//     chrome.runtime.sendMessage("mpkbfmdhciepiffhidjiloldcfejkebc", {"newTab": {"id":tabList.length-1, "tab": tab}})
    tabActivatedRecord = {}
    tabActivatedRecord["tabActivated-" + (tabHistory.length-1)] = tabHistory[tabHistory.length-1]
    chrome.storage.sync.set(tabActivatedRecord)
    tabListRecord = {}
    tabListRecord["newTab-" + (tabList.length-1)] = tab
    chrome.storage.sync.set(tabListRecord)
  }
})

chrome.tabs.onActivated.addListener(function(activeTab) {
  if (typeof tabDict[activeTab.tabId] !== "undefined") {
    console.log(tabDict[activeTab.tabId])
    tabHistory.push(new TabRecord(tabDict[activeTab.tabId], (new Date()).getTime()))
//     chrome.runtime.sendMessage("mpkbfmdhciepiffhidjiloldcfejkebc", {"tabActivated": tabHistory[tabHistory.length-1]})
    tabActivatedRecord = {}
    tabActivatedRecord["tabActivated-" + (tabHistory.length-1)] = tabHistory[tabHistory.length-1]
    chrome.storage.sync.set(tabActivatedRecord)
  }
});
