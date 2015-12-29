/**
 * Generates simple passwords
 *
 * Exposes the genPassword method. Create a new Password object then call genPassword on that object.
 *
 * genPassword() returns and object with one of the following structures:
 *    {password: ... } - contains a new password
 *    {error: ...  } - contains an error message
 *
 * @depends Settings
 * @returns {{genPassword: genPassword}} Exposes only the genPassword method
 * @constructor
 */
function Password() {
    // Although Settings looks like a constructor, it is actually an instance of a singleton shared with main.js
    var settings = new Settings();
    var MAX_PASS_LEN = 100;

    /**
     * Given a range will securely select a single number from with the range and return it
     * @param minval
     * @param maxval
     * @returns {Number} - within the range;
     */
    function genUniqueNumber(minval, maxval) {
        var array = new Uint8Array(5);
        while (1) {
            // Generate random values and check if they fall within range
            window.crypto.getRandomValues(array);
            random_number = array.find(function (random_number) {
                if (random_number <= maxval && random_number >= minval) return random_number;
            });
            if (random_number) return random_number;
        }
    }

    /**
     * Validates and returns the password length
     *
     * @depends Settings
     */
    function determinePasswordLength() {
        var error = false;
        var range = settings.passlength.split('-');
        range.forEach(function (limit, index) {
            range[index] = parseInt(limit.trim(), 10);
        });
        // Failure modes
        // length isNaN
        if (range.find(function (limit) {
                if (isNaN(limit)) return true;
            })) {
            error = "Password length must be a number";
        }
        // length order is reversed (22 - 11) or length is greater than 2 (222-222-222)
        if (range.length === 2 && range[0] > range[1] || range.length > 2) {
            error = "Length range should be low-high (15-20)";
        }
        // any values are beyond MAX_PASS_LEN
        if ((range[0] >= MAX_PASS_LEN) || (range[1] && range[1] >= MAX_PASS_LEN)) {
            error = "Password length must be less than 100";
        }
        if (error) return error;
        // We have a setting
        if (range.length === 2) {
            passlength = genUniqueNumber(range[0], range[1]);
        } else {
            passlength = range[0];
        }
        return passlength;

    }

    function genPassword() {
        var pass = '';
        var passwordLength = determinePasswordLength();
        if (isNaN(passwordLength)) return {error: passwordLength};

        var seed = settings.custom;
        seed += (settings.numbers) ? "0123456789" : '';
        seed += (settings.lowercase) ? "abcdefghijklmnopqrstuvwxyz" : '';
        seed += (settings.uppercase) ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : '';
        // Remove exclusion characters
        seed = seed.replace(new RegExp('['+settings.exclude+']+', 'g'), '');
        //Generate string with specified length
        for (var i = 0; i < passwordLength; i++) {
            pass += seed[genUniqueNumber(0, seed.length - 1)]
        }
        return {password: pass};
    }

    /* Expose only the genPassword() method of this API */
    return {genPassword: genPassword}

}

