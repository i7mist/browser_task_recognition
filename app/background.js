var myFileSystem;
var timestamp = (new Date()).getTime()
var tabActivatedHistoryFileName = 'tabActivatedHistory-' + timestamp
var tabListFileName = 'tabList-' + timestamp

chrome.runtime.onMessageExternal.addListener(
  function(message, sender, sendResponse) {
    if (message.tabActivated) {
      console.log("tabActivated")
      console.log(message)
      myFileSystem.root.getFile(tabActivatedHistoryFileName, {create: false, exclusive: true}, function(fileEntry) {

        fileEntry.createWriter(function(fileWriter) {

          fileWriter.onwriteend = function(e) {
            console.log('tabActivated record Write completed.');
          };

          fileWriter.onerror = function(e) {
            console.log('tabActivated Write failed: ' + e.toString());
          };

          // Create a new Blob and write it to log.txt.
          var blob = new Blob([message], {type: 'text/plain'});

          fileWriter.seek(fileWriter.length);

          fileWriter.write(blob);

        }, errorHandler);

      }, errorHandler);
    } else if (message.newTab) {
      console.log("newTab")
      console.log(message)
      myFileSystem.root.getFile(tabListFileName, {create: false, exclusive: true}, function(fileEntry) {

        fileEntry.createWriter(function(fileWriter) {

          fileWriter.onwriteend = function(e) {
            console.log('newTab Write completed.');
          };

          fileWriter.onerror = function(e) {
            console.log('newTab Write failed: ' + e.toString());
          };

          // Create a new Blob and write it to log.txt.
          var blob = new Blob([message], {type: 'text/plain'});

          fileWriter.seek(fileWriter.length);

          fileWriter.write(blob);

        }, errorHandler);

      }, errorHandler);
    }
  }
);

function errorHandler(e) {
  console.log(e)
}
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

function onInitFs(fs) {
  console.log('Opened file system: ' + fs.name);

  console.log(tabActivatedHistoryFileName)
  console.log(tabListFileName)
  myFileSystem = fs
  fs.root.getFile(tabActivatedHistoryFileName, {create: true, exclusive: true}, function(fileEntry) {

     console.log(fileEntry.isFile)
     console.log(fileEntry.name)
     console.log(fileEntry.fullPath)

  }, errorHandler);

  fs.root.getFile(tabListFileName, {create: true, exclusive: true}, function(fileEntry) {

     console.log(fileEntry.isFile)
     console.log(fileEntry.name)
     console.log(fileEntry.fullPath)

  }, errorHandler);
}

// window.requestFileSystem(window.PERSISTENT, 20*1024*1024 /*5MB*/, onInitFs, errorHandler);

window.webkitStorageInfo.requestQuota(PERSISTENT, 20*1024*1024, function(grantedBytes) {
    window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
}, function(e) {
    console.log('Error', e);
});


