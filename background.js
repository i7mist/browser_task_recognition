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
    console.log(tabHistory)
    console.log(tabList)
  }
})

chrome.tabs.onActivated.addListener(function(activeTab) {
  if (typeof tabDict[activeTab.tabId] !== "undefined") {
    console.log(tabDict[activeTab.tabId])
    tabHistory.push(new TabRecord(tabDict[activeTab.tabId], (new Date()).getTime()))
    console.log(tabHistory)
    console.log(tabList)
  }
});
