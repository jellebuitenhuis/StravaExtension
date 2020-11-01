chrome.tabs.onUpdated.addListener(function (details) {
    chrome.tabs.executeScript(null, {file: "inject.js"});

});

{
    var segmentId = 0;
    var baseEffort = 0;
    var compareEffort = 0;
    var segmentRegex = /strava\.com\/segments\/.*\/compare\/.*\/.*/
    var compareRegex = /strava\.com\/segments\/.*\/compare_efforts\?reference_id=.*&comparing_id=.*/
    var effortRegex = /strava\.com\/segment_efforts\/.*\/get_base_streams/
    var flybyRegex = /labs\.strava\.com\/flyby\/viewer\/#\d+(\/\d+)+/
    var matchesRegex = /nene\.strava\.com\/flyby\/matches\/\d+/
    var streamCompareRegex =/nene\.strava\.com\/flyby\/stream_compare\/\d+\/\d+/

    var equalizeTime = false;
    var baseTime = 0;
    var testing = false;

    var jsonTemplate = {
        "activity": {

        },
        "matches": [

        ],
        "athletes": {
        }

    }
    //    https://labs.strava.com/flyby/viewer/#4267063442/4266960806/4267455658

    var jsonTest = {
        "activity": {

        },
        "matches": [
            {
                "otherActivity": {
                    "id": 4266960806,
                    "athleteId": 33490643,
                    "startTime": 1604154313,
                    "elapsedTime": 4960,
                    "name": "Morning Walk with San",
                    "distance": 5340.7,
                    "activityType": "Walk"
                },
                "correlation": {
                    "correlation": 0,
                    "spatialCorrelation": 0,
                    "closestPoint": {
                        "point": {
                            "lat": 52.18637,
                            "lng": 5.233713
                        },
                        "time": 1604133460
                    },
                    "closestDistance": 0
                }
            },
            {
                "otherActivity": {
                    "id": 4267063442,
                    "athleteId": 17109486,
                    "startTime": 1604132363,
                    "elapsedTime": 25010,
                    "name": "MTB Hoge Vuursche, Lage Vuursche, Zeist en Austerlitz met Rosemarie",
                    "distance": 112866,
                    "activityType": "Ride"
                },
                "correlation": {
                    "correlation": 1,
                    "spatialCorrelation": 1,
                    "closestPoint": {
                        "point": {
                            "lat": 0,
                            "lng": 0
                        },
                        "time": 0
                    },
                    "closestDistance": 0
                }
            }
        ],
        "athletes": {
            "33490643": {
                "id": 33490643,
                "firstName": "Jelle"
            },
            "17109486": {
                "id": 17109486,
                "firstName": "Marije"
            }
        }
    }
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details)
    {
        if (matchesRegex.test(details.url))
        {
            let headers = details.requestHeaders;
            headers[headers.length] = {"name":"Origin","value":"https://labs.strava.com"};
            headers[headers.length] = {"name":"origin","value":"https://labs.strava.com"};
            return {requestHeaders: headers}
        }
    },
    {urls: ["https://nene.strava.com/flyby/*"]},
    ["requestHeaders","blocking","extraHeaders"]);

chrome.webRequest.onHeadersReceived.addListener(
    function (details)
    {
        let headers = details.responseHeaders
        for(let header of headers)
        {
            if(header.name === 'access-control-allow-origin')
            {
                header.value = "*"
            }
        }
        return {responseHeaders: headers}
    },
    {urls: ["https://nene.strava.com/flyby/*"]},
    ["responseHeaders","extraHeaders","blocking"]);

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if(segmentRegex.test(details.url))
        {
            let matches = details.url.match(/\d+/g)
            segmentId = matches[0]
            baseEffort = matches[1]
            compareEffort = matches[2]
            return {redirectUrl: `https://www.strava.com/segments/${segmentId}/compare`};
        }
        if(segmentId !== 0) {
            if (compareRegex.test(details.url) && details.url.match(/\d+/g)[0] === segmentId) {
                if (details.url.match(/\d+/g)[1] !== baseEffort && details.url.match(/\d+/g)[2] !== compareEffort) {
                    return {redirectUrl: `https://www.strava.com/segments/${segmentId}/compare_efforts?reference_id=${baseEffort}&comparing_id=${compareEffort}`};
                }
            }
            if (effortRegex.test(details.url) && details.url.match(/\d+/g)[0] !== baseEffort) {
                return {redirectUrl: `https://www.strava.com/segment_efforts/${baseEffort}/get_base_streams`}
            }
        }

        if(flybyRegex.test(details.url))
        {
            let ids = details.url.match(/\d+/g);
            let promises = []
            equalizeTime = details.url.includes(`?equalize=true`)
            for(let i = 0; i < ids.length; i++)
            {
                promises.push(fetch(`https://nene.strava.com/flyby/matches/${ids[i]}`).then((response) => {
                    return response.json().then((json) => {
                        return json
                    })
                }))
            }
            return Promise.all(promises).then(
                (json) => {
                    for(let i = 0; i < json.length; i++) {
                        if (i === 0) {
                            jsonTemplate.activity = json[i].activity
                            baseTime = json[i].activity.startTime
                        }
                        if(equalizeTime)
                        {
                            json[i].activity.startTime = baseTime
                        }
                        jsonTemplate.matches.push({correlation: {}, otherActivity: json[i].activity})
                        jsonTemplate.athletes[json[i].activity.athleteId] = json[i].athletes[json[i].activity.athleteId]
                    }

                }
            )
        }
        if(matchesRegex.test(details.url))
        {
            if(jsonTemplate.activity.id !== undefined){
                let temp = jsonTemplate;
                jsonTemplate = {
                    "activity": {

                    },
                    "matches": [


                    ],
                    "athletes": {
                    }

                }
                return {redirectUrl: `data:text/plain;base64,${btoa(JSON.stringify(temp))}`}
            }
        }

        if(streamCompareRegex.test(details.url) && !testing && equalizeTime)
        {
            testing = true
            let json = {}
            let request2 = new XMLHttpRequest();
            request2.open("GET", details.url,false);
            request2.setRequestHeader("x-requested-with", "XMLHttpRequest");
            request2.onreadystatechange = function () {
                if (request2.readyState === XMLHttpRequest.DONE) {
                    json = JSON.parse(request2.responseText)
                }
            }
            request2.send()
            let initialTime = json.stream[0].time;
            for(let i = 0; i < json.stream.length; i++)
            {
                json.stream[i].time += baseTime-initialTime
            }
            testing = false;
            return {redirectUrl: `data:text/plain;base64,${btoa(JSON.stringify(json))}`}
        }
    },
    {urls: ["*://labs.strava.com/flyby/viewer/*","*://*.strava.com/activities/*","*://*.strava.com/segments/*", "*://*.strava.com/segment_efforts/*","https://nene.strava.com/flyby/*"]},
    ["blocking"]);
