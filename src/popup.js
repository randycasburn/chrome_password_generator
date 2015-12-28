var port;
var settings = {};
var outputElement;

window.addEventListener('load', function () {
    outputElement = document.getElementById('generated_password');
    document.getElementById('genpassword').addEventListener('submit', generatePassword);
port = chrome.extension.connect({name: "PasswordGen"});
port.postMessage("getSettings");
port.onMessage.addListener(function (msg) {
    if (msg.constructor === Object) {
        settings = msg;
        var manifest = chrome.runtime.getManifest();
        document.getElementById('version').textContent = manifest.version_name;
        document.getElementById('custom').value = settings.customChars;
        document.getElementById('exclude').value = settings.excludeChars;
        document.getElementById('length').value = settings.passLength;
        document.getElementById('numbers').checked = settings.numbers;
        document.getElementById('uppercase').checked = settings.uppercase;
        document.getElementById('lowercase').checked = settings.lowercase;
    } else if (msg.constructor === String) {
        outputElement.value = msg;
        outputElement.focus();
        outputElement.select();
        //document.execCommand('copy');
        outputElement.blur();
    } else {
        outputElement.value = 'Unusable result';
    }
});

});



function generatePassword(e) {
    e.preventDefault();
    port.postMessage('getPassword');
}

function showError(msg) {
    var error = document.getElementById('error');
    error.textContent = msg;
    setTimeout(function () {
        error.textContent = '';
    }, 2000);

}

function showWarning(msg) {
    var warning = document.getElementById('warning');
    warning.textContent = msg;
    setTimeout(function () {
        warning.textContent = '';
    }, 2000);
}

function updateStatus(message) {
    if (!self.actionMenu) return;
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Password copied to clipboard';
    setTimeout(function () {
        status.textContent = '';
    }, 2000);
}

