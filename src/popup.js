// Holds view wide settings
var settings = {};
// Holds the output element for the generated password
var outputElement;
/**
 * Document Load Event listeners
 *
 * When document loads set the outputElement, listen for form submit, listen for input changes to update settings
 *
 */
window.addEventListener('load', function () {
    outputElement = document.getElementById('generated_password');
    // Listen for the form submission
    document.getElementById('genpassword').addEventListener('submit', getPassword);
    // Record changes to the text settings <inputs>
    document.addEventListener('change', function (e) {
        settings[e.target.id] = (e.target.type === 'checkbox') ? e.target.checked : e.target.value;
        sendMessage({update:settings});
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
        document.getElementById('custom').value = settings.custom;
        document.getElementById('exclude').value = settings.exclude;
        document.getElementById('passlength').value = settings.passlength;
        document.getElementById('numbers').checked = settings.numbers;
        document.getElementById('uppercase').checked = settings.uppercase;
        document.getElementById('lowercase').checked = settings.lowercase;
    } else if (msg.password) {
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
sendMessage("getSettings");

/**
 * Utility functions for the Popup UI
 */
function sendMessage(msg) {
    chrome.runtime.sendMessage(msg);
}

function getPassword(e) {
    e.preventDefault();
    sendMessage('getPassword');
}

function showStatus(type, msg) {
    var el = document.getElementById(type);
    el.innerHTML = (el.textContent.length) ? '<br>' + msg[type] : msg[type];;
    setTimeout(function () {
        error.textContent = '';
    }, 2000);

}

