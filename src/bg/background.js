// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
        if (tab.url.indexOf('http://localhost') > -1) {
            chrome.pageAction.show(tabId);
        }
    });