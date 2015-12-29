/**
 * Main - Background application used as a messaging bus between popup and content script
 *
 * Adds custom settings, the context menu item and calls genPassword() from Password object where needed
 *
 * @depends Settings, Password
 */
// Settings is a singleton used as if it were a constructor - keeps things simple
var settings = new Settings();
// Can set user defined settings thus:
settings.set({custom: '!@#$%^&*()'});
// Password class instance - is Dependent upon Settings();
var pw = new Password();
// Add context menu item
chrome.contextMenus.create({id: '1', "title": "Generate Password", "contexts": ['editable']})


/**
 * Message channel for Context Menu Item
 *
 * Listens for context menu clicks - sends content script a new password
 */
chrome.contextMenus.onClicked.addListener(function () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabArray) {
        chrome.tabs.sendMessage(tabArray[0].id, pw.genPassword());
    });
});

/**
 * Message channel for Popup Window
 *
 * Listens for Messages from the Popup and responds with:
 *   - getSettings - call to get settings from Chrome storage (async) and dispatch refresh event upon completion
 *   - getPassword - return password synchronously
 *   - update - Listen for changes to Chrome data to update status, then save data and dispatch refresh
 */
chrome.runtime.onMessage.addListener(function (msg) {
    if (msg === 'getSettings') {
        settings.get();
    } else if (msg === 'getPassword') {
        chrome.runtime.sendMessage(pw.genPassword());
    } else if (msg.update) {
        chrome.storage.onChanged.addListener(function () {
            var status = chrome.runtime.lastError ? chrome.runtime.lastError : 'Settings Updated';
            chrome.runtime.sendMessage({status: status});
        });
        settings.set(msg.update);
    }
});
/**
*   Listens for updates to the settings and broadcasts the new settings to the Popup
*/
document.addEventListener('refreshed', function (e) {
    chrome.runtime.sendMessage(e.detail);
});
