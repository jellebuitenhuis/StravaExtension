chrome.tabs.onUpdated.addListener(function (details) {
    chrome.tabs.executeScript(null, {file: "inject.js"});

});