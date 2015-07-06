function onPageDetailsReceived(pageDetails)  { 
    document.getElementById('generated_password').value = pageDetails.password
}

function genPassword() {
    // Cancel the form submit
    event.preventDefault();

    var pass = "";

    //Get specified length or range
    var passlengthval = document.getElementById('length').value
    var maxlen = 10
    var minlen = 10
    var passlength = 10
    //Make sure length is a number
    if (passlengthval.value != "" && !isNaN(passlengthval))
    {
        passlength = parseInt(passlengthval)
    } 

    //Check if length is a range
    if (passlengthval.includes("-"))
    {
        //Split into elements
        var range = passlengthval.split("-")
        minlen = parseInt(range[0])
        maxlen = parseInt(range[1])
        if (!isNaN(minlen) && !isNaN(maxlen)) 
        {
            //Pick a number from range
            passlength = Math.floor(Math.random() * (maxlen - minlen + 1)) + minlen;
        }
        
    }

    //Get possible characters
    var customchars = document.getElementById('custom').value
    var excludechars = document.getElementById('exclude').value
    //Add custom characters
    var possible = customchars

    //TODO: Add if check for numbers and uppercase/lowercase characters
    possible += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

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

}

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status-display');
    // Handle the password generation form submit event with our genpassword function
    document.getElementById('genpassword').addEventListener('submit', genPassword);
    // Get the event page
    
});