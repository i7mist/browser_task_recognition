
chrome.runtime.onMessageExternal.addListener(
  function(message, sender, sendResponse) {
    if (message.tabActivated) {
      console.log("tabActivated")
      console.log(message)
    } else if (message.newTab) {
      console.log("newTab")
      console.log(message)
    }
  });

