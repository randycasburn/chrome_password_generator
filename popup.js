function onPageDetailsReceived(pageDetails)  { 
    document.getElementById('generated_password').value = pageDetails.password
}

function genPassword() {
    // Cancel the form submit
    event.preventDefault();

    var pass = "";

    //Get specified length or range
    var passlengthval = document.getElementById('length').value;
    var maxlen = 10;
    var minlen = 10;
    var passlength = 10;
    //Make sure length is a number
    if (passlengthval.value != "" && !isNaN(passlengthval))
    {
        passlength = parseInt(passlengthval);
    } 

    //Check if length is a range
    if (passlengthval.includes("-"))
    {
        //Split into elements
        var range = passlengthval.split("-");
        minlen = parseInt(range[0]);
        maxlen = parseInt(range[1]);
        if (!isNaN(minlen) && !isNaN(maxlen)) 
        {
            //Pick a number from range
            passlength = Math.floor(Math.random() * (maxlen - minlen + 1)) + minlen;
        }
        
    }

    //Get possible characters
    var customchars = document.getElementById('custom').value;
    var excludechars = document.getElementById('exclude').value;
    //Add custom characters
    var possible = customchars;

    //TODO: Add if check for numbers and uppercase/lowercase characters
    //Include numbers
    var numberscb = document.getElementById('numbers');
    if (numberscb.checked) {
        possible +=  "0123456789";
    }
    //Include lowercase characters
    var lowercasecb = document.getElementById('lowercase');
    if (lowercasecb.checked) {
        possible +=  "abcdefghijklmnopqrstuvwxyz";
    }
    //Include uppercase characters
    var uppercasecb = document.getElementById('uppercase');
    if (uppercasecb.checked) {
        possible += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }

    //Remove exclusion characters
    for (var i = 0, len = excludechars.length; i < len; i++) {
        possible = possible.replace(excludechars[i], "");
    }

    for( var i=0; i < passlength; i++ )
        pass += possible.charAt(Math.floor(Math.random() * possible.length));


    var passoutput = document.getElementById('generated_password')
    passoutput.value = pass;
    passoutput.focus ();
    passoutput.select ();
    document.execCommand('copy');
    passoutput.blur ();
    saveOptions();

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

    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status-display');
    // Handle the password generation form submit event with our genpassword function
    document.getElementById('genpassword').addEventListener('submit', genPassword);
    
});