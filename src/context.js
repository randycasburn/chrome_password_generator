/**
 *  Listens for messages from backend to populate "editables" with a password
 *
 *  The backend provides a contextMenu item for generating a password and this inserts the password into
 *  every <input type="password"> element on the page
 *
 *  It also will input the password into an active element (the input click on) that is not a password field just
 *  in-case someone wants to see the password
 *
 */
(function () {
    var activeElement;

    chrome.runtime.onMessage.addListener(function (msg) {
        [].forEach.call(document.querySelectorAll('input[type=password]'), function (input) {
            input.value = msg.password;
        });
        if (activeElement.name !== 'INPUT') {
            activeElement.value = msg.password;
        }
    });

    document.addEventListener('contextmenu', function (e) {
        activeElement = e.target;
    });

})();
