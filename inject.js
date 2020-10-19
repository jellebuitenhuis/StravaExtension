if(document.getElementById('runningDiv')) {
    document.getElementById('runningDiv').remove()
}
if (typeof s === 'undefined') {
    let s = document.createElement('script');
    s.src = chrome.extension.getURL('injected.js');
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
} else {
    s = document.createElement('script');
    s.src = chrome.extension.getURL('injected.js');
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}