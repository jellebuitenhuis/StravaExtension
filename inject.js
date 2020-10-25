if (document.getElementById('runningDiv')) {
    document.getElementById('runningDiv').remove()
}
if (typeof s === 'undefined') {
    let s = document.createElement('script');
    s.src = chrome.extension.getURL('injected.js');
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);

    let jqry = document.createElement('script');
    jqry.src = "https://code.jquery.com/jquery-3.5.1.min.js";
    // (document.head || document.documentElement).appendChild(jqry);

} else {
    s = document.createElement('script');
    s.src = chrome.extension.getURL('injected.js');
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    let jqry = document.createElement('script');
    jqry.src = "https://code.jquery.com/jquery-3.5.1.min.js";
    // (document.head || document.documentElement).appendChild(jqry);
}