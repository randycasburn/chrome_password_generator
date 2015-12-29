/**
 * Settings Singleton object for management of user settings
 *
 * Use: var settings = new Settings(); to generate instance then use var s = Settings(); for copies
 *
 * To modify settings at runtime with user defined settings use the set method thus:
 *     - Settings.set({custom: '!@#$%^&*()'});
 *
 * Uses sync'd settings so user profile carries these around
 *
 * Creates and Dispatches a custom event to notify that change is registered on the singleton. To notify user you must
 * listen for the 'refreshed' event:
 *     - document.addEventListener('refreshed',...) (document refers to the background document)
 *
 * @singleton
 */
function Settings() {
    // Ensures only one copy in memory
    if ( Settings.prototype._singletonInstance ) {
        return Settings.prototype._singletonInstance;
    }
    Settings.prototype._singletonInstance = this;

    // Create the reasonable defaults - only required setting is passlength
    this.passlength = '10-14';
    this.custom = '';
    this.exclude = '';
    this.numbers = true;
    this.uppercase = true;
    this.lowercase = true;
    // Need access from callbacks
    var self = this;
    // Expose public API
    this.set = set;
    this.get = get;
    // Call get here to initialize settings from sync
    this.get();
    /**
     * Dynamically adds settings to the singleton and stores them in chrome.sync.storage
     *
     * Send any object and it's properties will be added to settings
     * @param updates - Object
     */
    function set(updates) {
        update(updates);
        chrome.storage.sync.set(JSON.parse(JSON.stringify(updates)),
            signalRefresh(updates));
    };

    /**
     * Upon first use; this will overwrite the defaults and user settings with stored settings. Then
     * it will simply return what is stored.
     */
    function get() {
        chrome.storage.sync.get(null, function (items) {
            update(items);
            signalRefresh(items);
        });
    }

    /**** Private Utility Methods ****/
    /**
     * private method for updating properties on the singleton
     *
     * @param updates - object
     */
    function update(updates) {
        for (var update in updates) {
            if (updates.hasOwnProperty(update)) {
                self[update] = updates[update];
            }
        }
    }
    /**
     * Implements a custom event type to broadcast settings upon successful chrome.storage operation
     *
     * chrome.storage is Async so this is the easiest way to keep the UI updated
     * @param refreshedSettings
     */
    function signalRefresh(refreshedSettings) {
        var refreshEvent = new CustomEvent('refreshed', {detail: {settings: refreshedSettings}});
        document.dispatchEvent(refreshEvent);
        refreshEvent = null;
    }
};
