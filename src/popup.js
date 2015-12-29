// Popup doesn't have access to the Settings singleton
// settings - local to the popup
var settings;
// Holds the output element for the generated password
var outputElement;
/**
 * Document Load Event listeners
 *
 * When document loads set the outputElement, listen for form submit, listen for input changes to update settings
 *
 */
window.addEventListener('load', function () {
    // Listen for the form submission
    document.getElementById('generate').addEventListener('click', getPassword);
    // Record changes to the text settings <inputs>
    document.addEventListener('change', function (e) {
        settings[e.target.id] = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;
        chrome.runtime.sendMessage({update:settings});
    });
});
/**
 * Chrome Runtime messaging events
 *
 *  On receiving:
 *    settings - update popup view with new settings
 *    password - update outputElement with password, copy to clipboard, show status and warning if necessary
 *    error, warning, or status - show appropriate message by type
 */
chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.settings) {
        settings = msg.settings;
        var manifest = chrome.runtime.getManifest();
        document.getElementById('version').textContent = manifest.version_name;
        for(var setting in settings){
            if(!setting.search(/^(numbers|uppercase|lowercase)$/)){
                document.getElementById(setting).checked = settings[setting];
            } else {
                document.getElementById(setting).value = settings[setting];
            }
        }
    } else if (msg.password) {
        outputElement = document.getElementById('generated_password');
        outputElement.value = msg.password;
        outputElement.focus();
        outputElement.select();
        document.execCommand('copy');
        outputElement.blur();
        showStatus('status', {status: 'Copied to Clipboard'});
        if (msg.password.length < 8) showStatus('warning', {warning: "Weak Password"});
    } else if (msg.error) {
        showStatus('error', msg);
    } else if (msg.warning) {
        showStatus('warning', msg);
    } else if (msg.status) {
        showStatus('status', msg);
    }
});
/**
 * Initialize the UI by retreiving the settings
 */
chrome.runtime.sendMessage("getSettings");

function getPassword(e) {
    e.preventDefault();
    sendMessage('getPassword');
}

function showStatus(type, msg) {
    (function(el){
        el.textContent = msg[type]
        setTimeout(function () {
            el.textContent = '';
        }, 2000);
    })(document.getElementById(type));
}

