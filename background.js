chrome.tabs.onUpdated.addListener(function (details) {
    chrome.tabs.executeScript(null, {file: "inject.js"});

});


chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        console.log(details)
        if( details.url === "https://www.strava.com/segments/9857730/compare_efforts?reference_id=2693973757825279035&comparing_id=2713043196238199512" )
            return {redirectUrl: "https://www.strava.com/segments/9857730/compare_efforts?reference_id=2746058350135595344&comparing_id=44603065039"};
        if(details.url === "https://www.strava.com/segment_efforts/2693973757825279035/get_base_streams")
        {
            console.log("effots")
            return {redirectUrl: "https://www.strava.com/segment_efforts/2746058350135595344/get_base_streams" }
        }
    },
    {urls: [    "*://*.strava.com/activities/*","*://*.strava.com/segments/*", "*://*.strava.com/segment_efforts/*","*://d3nn82uaxijpm6.cloudfront.net/assets/strava/segments/analysis/*.js"]},
    ["blocking"]);