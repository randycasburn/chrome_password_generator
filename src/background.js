var settings = new Settings({custom: '!@#$%^&*()'});
// Password class instance - uses settings instance with passed in defaults
var pw = new Password();

/**
 * Context Menu Item and Message Event Handlers
 */
/* Add context menu item */
chrome.contextMenus.create({id: '1', "title": "Generate Password", "contexts": ['editable']})
/* Listen for context menu - send content script a new password */
chrome.contextMenus.onClicked.addListener(function () {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabArray) {
        chrome.tabs.sendMessage(tabArray[0].id, pw.genPassword());
    });
});

/**
 * Popup Window Messaging Event Handlers
 */

/**
 * Responds to updates to the settings details and broadcasts the new settings
 */
document.addEventListener('refreshed', function (e) {
    sendMessage(e.detail);
});
/**
 * Listens for Messages from the Popup and responds with:
 *   - getSettings - call to get settings from Chrome storage (async) and dispatch refresh event upon completion
 *   - getPassword - return password synchronously
 *   - update - Listen for changes to Chrome data to update status, then save data and dispatch refresh
 */
chrome.runtime.onMessage.addListener(function (msg) {
    if (msg === 'getSettings') {
        settings.get();
    } else if (msg === 'getPassword') {
        sendMessage(pw.genPassword());
    } else if (msg.update) {
        chrome.storage.onChanged.addListener(function () {
            var status = chrome.runtime.lastError ? chrome.runtime.lastError : 'Settings Updated';
            sendMessage({status: status});
        });
        settings.set(msg.update);
    }
});


/**
 * Messaging utility to simplify code elsewhere
 *
 * @param msg
 */
function sendMessage(msg) {
    chrome.runtime.sendMessage(msg);
}

/**
 * Settings object for management of user settings (This should be a singleton!!)
 *
 * TODO: rewrite in OLN as a singleton - should not be a constructor
 *
 * Uses sync'd settings so user profile carries these around
 *
 * NOTE: When saving settings, you must listen for changes to storage if you intend to notify the user
 * of success or error
 *
 * chrome.storage.onChanged.addListener(...)
 *
 * Creates a CustomEvent to broadcast via dispatchEvent upon completion of getters/setter
 *
 * @constructor
 */
function Settings(userSettings) {
    // Create the default settings - only required setting is passlength
    this.custom = '';
    this.exclude = '';
    this.passlength = '10-14';
    this.numbers = true;
    this.uppercase = true;
    this.lowercase = true;
    // Override the defaults with user defined settings
    for (setting in userSettings) {
        if (userSettings.hasOwnProperty(setting)) {
            this[setting] = userSettings[setting];
        }
    }

    this.signalRefresh = function (refreshedSettings) {
        var refreshEvent = new CustomEvent('refreshed', {detail: {settings: refreshedSettings}});
        document.dispatchEvent(refreshEvent);
        refreshEvent = null;
    };

    this.set = function (updates) {
        this.custom = updates.custom;
        this.exclude = updates.exclude;
        this.passlength = updates.passlength;
        this.numbers = updates.numbers;
        this.uppercase = updates.uppercase;
        this.lowercase = updates.lowercase;
        chrome.storage.sync.set({
            custom: updates.custom,
            exclude: updates.exclude,
            passlength: updates.passlength,
            numbers: updates.numbers,
            uppercase: updates.uppercase,
            lowercase: updates.lowercase
        }, this.signalRefresh(updates))
    }

    /**
     * Upon first use, this will overwrite the defaults and user settings with stored settings. Then
     * it will simply return what is stored.
     */
    this.get = function () {
        var self = this;
        chrome.storage.sync.get(null, function (items) {
            self.custom = items.custom;
            self.exclude = items.exclude;
            self.passlength = items.passlength;
            self.numbers = items.numbers;
            self.uppercase = items.uppercase;
            self.lowercase = items.lowercase;
            self.signalRefresh(items);
        });
    }
}

/**
 * Generates simple passwords
 *
 * Exposes the genPassword method. Create a new Password object then call genPassword on that object.
 *
 * TODO: Change from using a global Settings Object - being lazy
 *
 * genPassword() returns and object with one of the following structures:
 *    {password: ... } - contains a new password
 *    {error: ...  } - contains an error message
 *
 *
 * @returns {{genPassword: genPassword}} Exposes only the genPassword method
 * @constructor
 */
function Password() {

    function genUniqueNumber(minval, maxval) {

        var array = new Uint8Array(5);
        var random_number = 0;
        var range = maxval - minval + 1;

        while (1) {
            // Generate random values and check if they fall within range
            window.crypto.getRandomValues(array);
            for (var i = 0; i < array.length; i++) {
                random_number = array[i];
                if (random_number <= maxval && random_number >= minval) {
                    return random_number;
                }
            }
        }
    }

    function genUniqueString(space, length) {

        pass = "";

        //Generate string with specified length
        for (var i = 0; i < length; i++) {
            pass += space[genUniqueNumber(0, space.length - 1)]
        }

        return pass;
    }

    function genPassword() {
        var pass = "";
        var MAX_PASS_LEN = 100;
        // Get specified length or range
        var passlengthval = settings.passlength;
        var maxlen = 10;
        var minlen = 10;
        var passlength = 10;
        // Make sure length is a number
        if (passlengthval.value !== "" && !isNaN(passlengthval) && passlengthval.length > 0) {
            // Limit max length
            if (passlengthval <= MAX_PASS_LEN) {
                passlength = parseInt(passlengthval, 10);
            } else {
                return {error: "Password length too long"};
            }

        } else if (passlengthval.includes("-")) {
            // Split into elements
            var range = passlengthval.split("-");
            range = range.sort(function (a, b) {
                return a - b
            });
            minlen = parseInt(range[0], 10);
            maxlen = parseInt(range[1], 10);
            if (!isNaN(minlen) && !isNaN(maxlen)) {
                // Limit max length
                if (minlen <= MAX_PASS_LEN && maxlen <= MAX_PASS_LEN) {
                    // Pick a number from range
                    passlength = genUniqueNumber(minlen, maxlen);
                } else {
                    return {error: "Password length too long"};
                }
            }

        } else {
            return {error: "Invalid password length"};
        }

        var possible = settings.custom;
        // Include numbers
        if (settings.numbers) {
            possible += "0123456789";
        }
        // Include lowercase characters
        if (settings.lowercase) {
            possible += "abcdefghijklmnopqrstuvwxyz";
        }
        // Include uppercase characters
        if (settings.uppercase) {
            possible += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }

        // Remove exclusion characters
        for (var i = 0, len = settings.exclude.length; i < len; i++) {
            possible = possible.replace(settings.exclude[i], "");
        }

        pass = genUniqueString(possible, passlength);
        return {password: pass};
    }

    /* Expose only the genPassword() method of this API */
    return {genPassword: genPassword}

}

