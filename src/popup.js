function onPageDetailsReceived(pageDetails)  { 
    document.getElementById('generated_password').value = pageDetails.password
}

function genUniqueNumber(minval, maxval) {

    var array = new Uint8Array(5);
    var random_number = 0;
    var range = maxval - minval + 1;

    while (1){
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
    // Cancel the form submit
    event.preventDefault();

    var pass = "";
    var MAX_PASS_LEN = 100;
    var passoutput = document.getElementById('generated_password');
    passoutput.value= "";
    // Get specified length or range
    var passlengthval = document.getElementById('length').value;
    var maxlen = 10;
    var minlen = 10;
    var passlength = 10;
    // Make sure length is a number
    if (passlengthval.value != "" && !isNaN(passlengthval) && passlengthval.length > 0)
    {
        // Limit max length
        if (passlengthval <= MAX_PASS_LEN) {
            passlength = parseInt(passlengthval, 10);
        } else {
            showError("Password length too long")
            return -2;
        }

    } else if (passlengthval.includes("-"))
    {
        // Split into elements
        var range = passlengthval.split("-");
        range = range.sort(function(a, b){return a-b});
        minlen = parseInt(range[0], 10);
        maxlen = parseInt(range[1], 10);
        if (!isNaN(minlen) && !isNaN(maxlen)) 
        {
            // Limit max length
            if (minlen <= MAX_PASS_LEN && maxlen <= MAX_PASS_LEN) {
                // Pick a number from range
                passlength = genUniqueNumber(minlen, maxlen);
            } else {
                showError("Password length too long");
                return -2;
            }
        }
        
    } else {
        showError("Invalid password length");
        return -1;
    }


    // Get possible characters
    var customchars = document.getElementById('custom').value;
    var excludechars = document.getElementById('exclude').value;
    // Add custom characters
    var possible = customchars;

    // Include numbers
    var numberscb = document.getElementById('numbers');
    if (numberscb.checked) {
        possible +=  "0123456789";
    }
    // Include lowercase characters
    var lowercasecb = document.getElementById('lowercase');
    if (lowercasecb.checked) {
        possible +=  "abcdefghijklmnopqrstuvwxyz";
    }
    // Include uppercase characters
    var uppercasecb = document.getElementById('uppercase');
    if (uppercasecb.checked) {
        possible += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }

    // Remove exclusion characters
    for (var i = 0, len = excludechars.length; i < len; i++) {
        possible = possible.replace(excludechars[i], "");
    }

    pass = genUniqueString(possible, passlength);
    passoutput.value = pass;
    passoutput.focus ();
    passoutput.select ();
    document.execCommand('copy');
    passoutput.blur ();
    saveOptions();

    if (passoutput.value.length < 8) {
        showWarning('Weak password');
    }

}

function showError(msg) {
    var error = document.getElementById('error');
    error.textContent = msg;
    setTimeout(function() {
      error.textContent = '';
    }, 2000);

}

function showWarning(msg){
    var warning = document.getElementById('warning');
    warning.textContent = msg;
    setTimeout(function() {
      warning.textContent = '';
    }, 2000); 
}

function saveOptions() {
  var customchars = document.getElementById('custom').value;
  var excludechars = document.getElementById('exclude').value;
  var passlength = document.getElementById('length').value;
  var numbers = document.getElementById('numbers').checked;
  var uppercase = document.getElementById('uppercase').checked;
  var lowercase = document.getElementById('lowercase').checked;
  chrome.storage.sync.set({
    customChars: customchars,
    excludeChars: excludechars,
    passLength: passlength,
    numbers: numbers,
    uppercase: uppercase,
    lowercase: lowercase
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Password copied to clipboard';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    customChars: '',
    excludeChars: '',
    passLength: '10-14',
    numbers: true,
    uppercase: true,
    lowercase: true
  }, function(items) {
    document.getElementById('custom').value = items.customChars;
    document.getElementById('exclude').value = items.excludeChars;
    document.getElementById('length').value = items.passLength;
    document.getElementById('numbers').checked = items.numbers;
    document.getElementById('uppercase').checked = items.uppercase;
    document.getElementById('lowercase').checked = items.lowercase;
  });
}

 // Add options restore event listener
document.addEventListener('DOMContentLoaded', restore_options);
// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Update version label
    var manifest = chrome.runtime.getManifest();
    document.getElementById('version').textContent = manifest.version_name;
    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status-display');
    // Handle the password generation form submit event with our genpassword function
    document.getElementById('genpassword').addEventListener('submit', genPassword);
    
});