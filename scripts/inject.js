{
    let s = document.createElement('script');
    s.src = chrome.extension.getURL('scripts/injected.js');

    let sortHelpers = document.createElement('script');
    sortHelpers.src = chrome.extension.getURL('scripts/sortHelpers.js');
    (document.head || document.documentElement).appendChild(sortHelpers);

    let elementCreateHelpers = document.createElement('script');
    elementCreateHelpers.src = chrome.extension.getURL('scripts/elementCreateHelpers.js');
    (document.head || document.documentElement).appendChild(elementCreateHelpers);

    let util = document.createElement('script');
    util.src = chrome.extension.getURL('scripts/util.js');
    util.onload = function () {
        (document.head || document.documentElement).appendChild(s);
    };
    (document.head || document.documentElement).appendChild(util);
}