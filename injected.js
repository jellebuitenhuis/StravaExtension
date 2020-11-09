{
    var equalize = false;
    var originalSort = false;
    var sortAmount = 0;
    var asc = 1;
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
}
if (!document.getElementById('runningDiv')) {
    let runningDiv = document.createElement('div');
    runningDiv.id = 'runningDiv';
    document.body.appendChild(runningDiv);
    if (window.location.pathname.split("/")[1] === "activities") {
        let check = document.getElementById('pagenav')
        let running = false;
        waitAnalysis();

        function waitAnalysis() {
            if (!check) {
                setTimeout(waitAnalysis, 100)
                check = document.getElementById('pagenav')
            } else if (!running) {
                running = false;
                addAnalysis();
            }

        }
    }
    let regex = /strava\.com\/activities\/\d+.*/
    if(regex.test(window.location.href))
    {
        if(!window.localStorage.getItem("flybyIds"))
        {
            window.localStorage.setItem("flybyIds","[]")
        }
        let menu = document.getElementById('pagenav')
        let flybyLink = document.createElement('li')
        flybyLink.innerHTML = `<a data-menu="flybys">Flybys</a>`
        flybyLink.id = 'flybyLink'
        flybyLink.onclick = () => {
            let matchId = window.location.href.match(/\d+/g)
            addFlybyTable(matchId).then((table) => {
                document.getElementById('view').innerHTML = ""
                document.getElementById('view').appendChild(table)
                let flybyButton = document.createElement('button')
                flybyButton.innerText = 'Open Flybys'
                flybyButton.className = 'btn btn-primary'
                flybyButton.onclick = () => {
                    let activityIds = JSON.parse(window.localStorage.getItem("flybyIds"))
                    let baseUrl = `https://labs.strava.com/flyby/viewer/#${matchId}`
                    for(let id of activityIds)
                    {
                        if(id != matchId)
                        {
                            baseUrl = baseUrl.concat(`/${id}`)
                        }
                    }
                    if(equalize)
                    {
                        baseUrl = baseUrl.concat(`?equalize=true`)
                    }
                    window.open(baseUrl)
                }
                document.getElementById('view').appendChild(flybyButton)
                let equalizeCheckbox = document.createElement('input')
                equalizeCheckbox.id = 'flybyEqualizeCheckbox'
                equalizeCheckbox.type = 'checkbox'
                equalizeCheckbox.style = 'margin-left: 10px; margin-right: 5px'
                let checkboxLabel = document.createElement('label')
                checkboxLabel.htmlFor = 'flybyEqualizeCheckbox'
                checkboxLabel.innerText = 'Equalize times?'
                checkboxLabel.style.display = "initial"
                equalizeCheckbox.onchange = (event) => {
                    equalize = event.target.checked
                }
                insertAfter(checkboxLabel,flybyButton)
                insertAfter(equalizeCheckbox,flybyButton)
                let idTable = buildFlybyIdTable(matchId)
                insertAfter(idTable,table)
            })
        }
        if(!document.getElementById('flybyLink')){
            menu.appendChild(flybyLink)
        }
    }
    if (window.location.pathname.split("/")[3] === "segments" && !isNaN(window.location.pathname.split("/")[4])) {
        let check = document.querySelector('[data-tracking-element="view_full_leaderboard"]')
        let running = false;
        wait();

        function wait() {
            if (!check) {
                setTimeout(wait, 100)
                check = document.querySelector('[data-tracking-element="view_full_leaderboard"]')
            } else if (!running) {
                running = true;
                getRank();
            }

        }

    } else if (window.location.pathname.split("/")[1] === "segments" && window.location.pathname.split("/")[3] !== "compare") {
        let runningLeaderboard = false;
        waitLeaderboard();

        function waitLeaderboard() {
            if (typeof currentAthlete === "undefined") {
                setTimeout(waitLeaderboard, 100)
            } else if (!runningLeaderboard) {
                runningLeaderboard = true;
                getLeaderBoard();
            }

        }
    }
}

function buildFlybyIdTable(matchId)
{
    let idTable = document.createElement('table')
    idTable.id = 'idTable'
    idTable.innerHTML = `
                <thead>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Athlete</th>
                    <th>Add</th>
                </thead>
                <tbody></tbody>
                `
    let activityIds = JSON.parse(window.localStorage.getItem("flybyIds"))
    for(let id of activityIds)
    {
        fetch(`https://nene.strava.com/flyby/matches/${id}`,{
            method: "GET"
        }).then((response) => {
            response.json().then((response) => {
                let tableRow = document.createElement('tr')
                let dateElement = document.createElement('td')
                let date = new Date(response.activity.startTime*1000)
                dateElement.innerText = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
                tableRow.appendChild(dateElement)

                let nameElement = document.createElement('td')
                nameElement.innerHTML = `<a href="https://strava.com/activities/${response.activity.id}">${response.activity.name}</a>`
                tableRow.appendChild(nameElement)

                let athleteElement = document.createElement('td')
                athleteElement.innerText = `${response.athletes[response.activity.athleteId].firstName}`
                tableRow.appendChild(athleteElement)

                let buttonElement = document.createElement('td')
                let addInput = buildCheckbox(response.activity, matchId)
                buttonElement.appendChild(addInput)
                tableRow.appendChild(buttonElement)
                idTable.appendChild(tableRow)
            })
        })
    }
    return idTable
}

function buildCheckbox(activity, matchId)
{
    let addInput = document.createElement('input')
    addInput.type = 'checkbox'
    addInput.value = activity.id
    addInput.checked = window.localStorage.getItem("flybyIds").includes(activity.id)
    addInput.onchange = (event) => {
        if(event.target.checked)
        {
            let localStorage = JSON.parse(window.localStorage.getItem("flybyIds"));
            localStorage.push(event.target.value)
            window.localStorage.setItem("flybyIds",JSON.stringify(localStorage))
            refreshFlybyTable(matchId)
        }
        else {
            let localStorage = JSON.parse(window.localStorage.getItem("flybyIds"));
            localStorage.splice(localStorage.indexOf(event.target.value),1)
            window.localStorage.setItem("flybyIds",JSON.stringify(localStorage))
            refreshFlybyTable(matchId)
        }
    }
    return addInput
}

function refreshFlybyTable(matchId)
{
    let table = document.getElementById('idTable')
    let idTable = buildFlybyIdTable(matchId)
    table.replaceWith(idTable)
    addFlybyTable(matchId).then((table) => {
        document.getElementById('flybyTable').replaceWith(table)
    })
}

function addFlybyTable(id)
{
    let table = document.createElement('table')
    table.id = 'flybyTable'
    table.innerHTML = `
    <thead>
    <th>Date</th>
    <th>Name</th>
    <th>Athlete</th>
    <th>Add</th>
    </thead>
    <tbody></tbody>`
    let flybys = getFlybys(id);
    return flybys.then((response) => {
        let matches = response.matches;
        matches = matches.reduce((unique = [], o) => {
            if (!unique.some(obj => obj.otherActivity.id === o.otherActivity.id)) {
                unique.push(o);
            }
            return unique;
        }, []);
        for(let match of matches)
        {
            let tableRow = document.createElement('tr')
            let date = new Date(match.otherActivity.startTime*1000)
            let addInput = buildCheckbox(match.otherActivity, id)
            tableRow.innerHTML = `
            <td>${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</td>
            <td><a href="https://strava.com/activities/${match.otherActivity.id}">${match.otherActivity.name}</a></td>
            <td>${response.athletes[match.otherActivity.athleteId].firstName}</td>
            `
            let tableData = document.createElement('td')
            tableData.appendChild(addInput)
            tableRow.appendChild(tableData)
            table.querySelector('tbody').appendChild(tableRow)
        }
        return table;
    })
}

function getFlybys(id) {
    let url = `https://nene.strava.com/flyby/matches/${id}`
    return fetch(url,{
        method: "GET"
    }).then((response) => {
        return response.json().then((result) => {
            return result
        })
    })
}

function addAnalysis() {
    let splitUrl = window.location.pathname.split("/")
    let premiumView = document.getElementById('premium-views')
    let bikePage;
    try {
        let activityData = JSON.parse(document.querySelector('[data-react-class="ActivityTagging"]').getAttribute('data-react-props'))
        bikePage = activityData["activityType"] === "ride"
    }
    catch (e)
    {
        bikePage = document.querySelector('[class="title"]').innerText.includes('Ride')
    }
    if (premiumView && !bikePage) {
        let list = document.getElementById('premium-views')
        let text = list.firstElementChild.innerText.split(' ')[1]
        list.id = 'new-analysis'
        list.className = 'track-click'
        list.onclick = () => {
            pageView.router().changeMenuTo(`analysis/0/1000`)
        }
        list.innerHTML = `<a>${text}</a>`
    } else if (!bikePage) {
        if (splitUrl[3] === 'analysis') {
            let list = document.getElementById('new-analysis')
            list.className = 'track-click selected'
        }
    }
    if (!document.getElementById('NewRow')) {
        if (!bikePage) {
            if (window.location.pathname.split("/")[3] === "segments") {
                let tableHeadRow = document.querySelector('[class*="dense hoverable marginless run segments"] > thead > tr');
                tableHeadRow.id = 'NewRow';
                let table = tableHeadRow.parentElement.parentElement.querySelector('tbody');

                const headers = tableHeadRow.querySelectorAll('th');
                let nameRow = headers[3]
                nameRow.onclick = () => {
                    sortSegmentTableName(table)
                }
                let timeRow = headers[4]
                timeRow.onclick = () => {
                    sortSegmentTableDivider(5, table)
                }
                let distanceRow = headers[5]
                distanceRow.onclick = () => {
                    sortSegmentTable(6, table)
                }
                let speedRow = headers[6]
                speedRow.onclick = () => {
                    sortSegmentTableDivider(7, table)
                }
                let elevationRow = headers[7]
                elevationRow.onclick = () => {
                    sortSegmentTable(8, table)
                }
                let hrRow = headers[8]
                hrRow.onclick = () => {
                    sortSegmentTable(9, table)
                }

                let percentileSegmentRow = document.createElement('th');
                percentileSegmentRow.innerText = '% slower than personal best';
                percentileSegmentRow.className = 'expanded-only';
                percentileSegmentRow.onclick = () => {
                    sortSegmentTable(14, table)
                }
                insertAfter(percentileSegmentRow, tableHeadRow.children[8]);

                let percentileKomRow = document.createElement('th');
                percentileKomRow.innerText = '% slower than KOM/QOM';
                percentileKomRow.className = 'expanded-only';
                percentileKomRow.onclick = () => {
                    sortSegmentTable(13, table)
                }
                insertAfter(percentileKomRow, tableHeadRow.children[8]);

                let percentileRow = document.createElement('th');
                percentileRow.innerText = 'Percentile';
                percentileRow.className = 'expanded-only';
                percentileRow.onclick = () => {
                    sortSegmentTable(12, table)
                }
                insertAfter(percentileRow, tableHeadRow.children[8]);

                let countRow = document.createElement('th');
                countRow.innerText = 'Count';
                countRow.className = 'expanded-only';
                countRow.onclick = () => {
                    sortSegmentTable(11, table)
                }
                insertAfter(countRow, tableHeadRow.children[8]);

                let rankRow = document.createElement('th');
                rankRow.innerText = 'Rank';
                rankRow.className = 'expanded-only';
                rankRow.onclick = () => {
                    sortSegmentTable(10, table)
                }
                insertAfter(rankRow, tableHeadRow.children[8]);


                let efforts = document.querySelectorAll('[data-segment-effort-id]');
                for (let effort of efforts) {
                    let id = effort.getAttribute('data-segment-effort-id')
                    let url = "https://www.strava.com/segment_efforts/" + id;
                    let request = new XMLHttpRequest();
                    request.open("GET", url);
                    request.setRequestHeader("x-requested-with", "XMLHttpRequest");
                    request.onreadystatechange = function () {
                        if (request.readyState === XMLHttpRequest.DONE) {
                            let response = JSON.parse(request.responseText)
                            let rank = response['overall_rank']
                            let count = response['viewer_overall_count']

                            document.querySelector(`[data-segment-effort-id="${id}"]`).children[0].value = response.start_index

                            let fastestTime = hmsToSecondsOnly(response.viewer_overall_time);
                            let currentTime = response.elapsed_time_raw;
                            let percentileSegmentElement = document.createElement('td')
                            let percent = Math.round((currentTime / fastestTime -1) * 100)
                            percentileSegmentElement.innerText = `${isNaN(percent) ? 'N/A' : percent+'%'}`
                            insertAfter(percentileSegmentElement, document.querySelector(`[data-segment-effort-id="${id}"]`).children[8])

                            let activityAthlete = document.evaluate('/html/body/script[30]/text()',document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue.textContent;
                            let gender = activityAthlete.match(/"gender":"."/)[0]
                            let komTime = gender.includes("M") ? hmsToSecondsOnly(response.kom_time) : hmsToSecondsOnly(response.qom_time)
                            console.log(komTime)
                            if(currentTime < komTime)
                            {
                                komTime = currentTime;
                            }
                            let percentileKomElement = document.createElement('td')
                            percent = Math.round((currentTime / komTime - 1) * 100);
                            percentileKomElement.innerText = `${isNaN(percent) ? 'N/A' : percent+'%'}`
                            insertAfter(percentileKomElement, document.querySelector(`[data-segment-effort-id="${id}"]`).children[8])

                            let percentileElement = document.createElement('td')
                            percentileElement.innerText = Math.round((1 - (rank - 1) / count) * 100)
                            insertAfter(percentileElement, document.querySelector(`[data-segment-effort-id="${id}"]`).children[8])

                            let countElement = document.createElement('td')
                            countElement.innerText = count
                            insertAfter(countElement, document.querySelector(`[data-segment-effort-id="${id}"]`).children[8])

                            let rankElement = document.createElement('td')
                            rankElement.innerText = rank
                            insertAfter(rankElement, document.querySelector(`[data-segment-effort-id="${id}"]`).children[8])
                        }
                    }
                    request.send()
                }
            }
        } else {
            let tableHeadRow = document.querySelector('[class*="dense hoverable marginless segments"] > thead > tr');
            tableHeadRow.id = 'NewRow';
            let table = document.getElementById("segments").firstElementChild.children[1].children[1];

            const headers = tableHeadRow.querySelectorAll('th');
            let nameRow = headers[3]
            nameRow.onclick = () => {
                sortSegmentTableName(table)
            }
            let timeRow = headers[4]
            timeRow.onclick = () => {
                sortSegmentTableDivider(6, table)
            }
            let speedRow = headers[5]
            speedRow.onclick = () => {
                sortSegmentTableDivider(7, table)
            }
            let hrRow = headers[8]
            hrRow.onclick = () => {
                sortSegmentTable(10, table)
            }

            let percentileSegmentRow = document.createElement('th');
            percentileSegmentRow.innerText = '% slower than personal best';
            percentileSegmentRow.className = 'expanded-only';
            percentileSegmentRow.onclick = () => {
                sortSegmentTable(15, table)
            }
            insertAfter(percentileSegmentRow, tableHeadRow.children[8]);

            let percentileKomRow = document.createElement('th');
            percentileKomRow.innerText = '% slower than KOM/QOM';
            percentileKomRow.className = 'expanded-only';
            percentileKomRow.onclick = () => {
                sortSegmentTable(14, table)
            }
            insertAfter(percentileKomRow, tableHeadRow.children[8]);

            let percentileRow = document.createElement('th');
            percentileRow.innerText = 'Percentile';
            percentileRow.className = 'expanded-only';
            percentileRow.onclick = () => {
                sortSegmentTable(13, table)
            }
            insertAfter(percentileRow, tableHeadRow.children[8]);

            let countRow = document.createElement('th');
            countRow.innerText = 'Count';
            countRow.className = 'expanded-only';
            countRow.onclick = () => {
                sortSegmentTable(12, table)
            }
            insertAfter(countRow, tableHeadRow.children[8]);

            let rankRow = document.createElement('th');
            rankRow.innerText = 'Rank';
            rankRow.className = 'expanded-only';
            rankRow.onclick = () => {
                sortSegmentTable(11, table)
            }
            insertAfter(rankRow, tableHeadRow.children[8]);


            let efforts = document.querySelectorAll('[data-segment-effort-id]');
            for (let effort of efforts) {
                let id = effort.getAttribute('data-segment-effort-id')
                let url = "https://www.strava.com/segment_efforts/" + id;
                let request = new XMLHttpRequest();
                request.open("GET", url);
                request.setRequestHeader("x-requested-with", "XMLHttpRequest");
                request.onreadystatechange = function () {
                    if (request.readyState === XMLHttpRequest.DONE) {
                        let response = JSON.parse(request.responseText)
                        let rank = response['overall_rank']
                        let count = response['viewer_overall_count']

                        document.querySelector(`[data-segment-effort-id="${id}"]`).children[0].value = response.start_index

                        let percentileElement = document.createElement('td')
                        percentileElement.innerText = Math.round((1 - (rank - 1) / count) * 100)

                        let secondToLastElement = document.querySelector(`[data-segment-effort-id="${id}"]`).children[9];
                        insertAfter(percentileElement, secondToLastElement)

                        let countElement = document.createElement('td')
                        countElement.innerText = count
                        insertAfter(countElement, secondToLastElement)

                        let rankElement = document.createElement('td')
                        rankElement.innerText = rank
                        insertAfter(rankElement, secondToLastElement)

                        let fastestTime = hmsToSecondsOnly(response.viewer_overall_time);
                        let currentTime = response.elapsed_time_raw;
                        let percentileSegmentElement = document.createElement('td')
                        let percent = Math.round((currentTime / fastestTime -1) * 100)
                        percentileSegmentElement.innerText = `${isNaN(percent) ? 'N/A' : percent+'%'}`
                        insertAfter(percentileSegmentElement, percentileElement)

                        let komTime = currentAthlete.attributes.gender === "M" ? hmsToSecondsOnly(response.kom_time) : hmsToSecondsOnly(response.qom_time)
                        if(currentTime < komTime)
                        {
                            komTime = currentTime;
                        }
                        let percentileKomElement = document.createElement('td')
                        percentileKomElement.innerText = `${Math.round((currentTime / komTime - 1) * 100)}%`
                        insertAfter(percentileKomElement, percentileElement)
                    }
                }
                request.send()
            }
        }
    }

}

function hmsToSecondsOnly(str) {
    let p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

//Todo: use fetch?
function getLeaderBoard() {
    let domRank = JSON.parse(document.querySelector('[class*="leaderboard row"]').getAttribute('data-tracking')).viewer_rank;
    if (domRank > 10) {
        let url = "https://www.strava.com/athlete/segments/" + window.location.pathname.split("/")[2] + "/history";
        let request = new XMLHttpRequest();
        request.open("GET", url);
        request.setRequestHeader("x-requested-with", "XMLHttpRequest");
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                let history = JSON.parse(request.responseText.replace(/"id":(\d+)/g, '"id":"$1"'));
                let ms = history.athlete_best_efforts[0]['created_at'];
                let date = new Date(Date.parse(ms));
                let activityID = history.athlete_best_efforts[0]['activity_id']
                let bestEffortID = history.athlete_best_efforts[0]['id']
                if (history.athlete_best_efforts[0].activity_type === 1) {
                    window.jQuery('body').on('click', '.options:eq(6)', () => {

                        let check = window.jQuery('.table.table-striped.table-padded.table-leaderboard:eq(0) > tbody > tr')
                        waitLeaderboardChange();

                        function waitLeaderboardChange() {
                            if (!check || check[9] === window.jQuery('.table.table-striped.table-padded.table-leaderboard:eq(0) > tbody > tr')[9]) {
                                setTimeout(waitLeaderboardChange, 100)
                                check = window.jQuery('.table.table-striped.table-padded.table-leaderboard:eq(0) > tbody > tr')
                            } else {
                                processBikeSegment(date, monthNames, activityID, bestEffortID, history)
                            }

                        }
                    })
                    processBikeSegment(date, monthNames, activityID, bestEffortID, history)
                } else {
                    window.jQuery('body').on('click', '.options:eq(6)', () => {
                        processRunSegment(date, monthNames, activityID, bestEffortID, history)
                    })
                    processRunSegment(date, monthNames, activityID, bestEffortID, history)
                }
            }
        }
        request.send();
    } else {
        let url = "https://www.strava.com/athlete/segments/" + window.location.pathname.split("/")[2] + "/history";
        let request = new XMLHttpRequest();
        request.open("GET", url);
        request.setRequestHeader("x-requested-with", "XMLHttpRequest");
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                let history = JSON.parse(request.responseText.replace(/"id":(\d+)/g, '"id":"$1"'));
                if (!document.getElementById('effort_table')) {
                    getRecentEfforts(history);
                }
                let url = "https://www.strava.com/segment_efforts/" + history['athlete_best_efforts'][1]['id'];
                let request2 = new XMLHttpRequest();
                request2.open("GET", url);
                request2.setRequestHeader("x-requested-with", "XMLHttpRequest");
                request2.onreadystatechange = function () {
                    if (request2.readyState === XMLHttpRequest.DONE) {
                        let response = JSON.parse(request2.responseText)
                        addCountLeaderboard(response, domRank)
                    }
                }
                request2.send()

            }
        }
        request.send();
    }
}

function processBikeSegment(date, monthNames, activityID, bestEffortID, history) {
    let url = "https://www.strava.com/segment_efforts/" + bestEffortID;
    let request2 = new XMLHttpRequest();
    request2.open("GET", url);
    request2.setRequestHeader("x-requested-with", "XMLHttpRequest");
    request2.onreadystatechange = function () {
        if (request2.readyState === XMLHttpRequest.DONE) {
            let response = JSON.parse(request2.responseText)

            let rank = response["viewer_overall_rank"];
            addCountLeaderboard(response, rank)
            let time = response["viewer_overall_time"];
            let HR = response["avg_hr"];
            let watt = response["avg_watts_raw"];
            let wattAbbr = response["avg_watts"];
            let speed = response["avg_speed"];
            if (rank != null || domRank != null) {
                let tableBody = document.querySelector('[class*="table-leaderboard"] > tbody')
                let newRank = document.createElement('tr');
                let newRankCell = document.createElement('td');
                newRankCell.className = "text-center"
                newRankCell.innerText = rank ? rank : domRank;
                newRank.id = "RankElement"
                newRank.className = "highlighted"
                newRank.appendChild(newRankCell);

                let newRankAthlete = document.createElement('td');
                let newRankAthleteLink = document.createElement('a');
                newRankAthleteLink.href = '/athletes/' + currentAthlete.id;
                newRankAthleteLink.innerText = currentAthlete.attributes.display_name;
                newRankAthlete.className = "athlete track-click"
                newRankAthlete.appendChild(newRankAthleteLink)
                newRank.appendChild(newRankAthlete)

                let newRankActivity = document.createElement('td');
                let newRankActivityLink = document.createElement('a');
                newRankActivityLink.href = '/activities/' + activityID;
                newRankActivityLink.innerText = `${monthNames[date.getMonth()]} ${date.getDate()},${date.getFullYear()}`;
                newRankActivity.className = "track-click"
                newRankActivity.appendChild(newRankActivityLink)
                newRank.appendChild(newRankActivity)

                let newRankSpeed = document.createElement('td');
                newRankSpeed.innerHTML = speed;
                newRank.appendChild(newRankSpeed);

                let newRankHR = document.createElement('td');
                newRankHR.innerText = HR;
                let newRankHRAbbr = document.createElement('abbr');
                newRankHRAbbr.innerText = "bpm"
                newRankHRAbbr.className = "unit";
                newRankHR.appendChild(newRankHRAbbr);
                newRank.appendChild(newRankHR);

                let newRankPower = document.createElement('td');
                newRankPower.innerHTML = watt ? `${watt} ${wattAbbr}` : "-"
                newRank.appendChild(newRankPower);

                let newRankTime = document.createElement('td');
                newRankTime.className = "last-child";
                newRankTime.innerText = time;
                newRank.appendChild(newRankTime);
                if (!document.getElementById('RankElement')) {
                    tableBody.appendChild(newRank);
                }
            }
            if (!document.getElementById('effort_table')) {
                getRecentEfforts(history);
            }
        }
    }
    request2.send();
}

function processRunSegment(date, monthNames, activityID, bestEffortID, history) {
    let url = "https://www.strava.com/segment_efforts/" + bestEffortID;
    let request2 = new XMLHttpRequest();
    request2.open("GET", url);
    request2.setRequestHeader("x-requested-with", "XMLHttpRequest");
    request2.onreadystatechange = function () {
        if (request2.readyState === XMLHttpRequest.DONE) {
            let response = JSON.parse(request2.responseText)

            let rank = response["viewer_overall_rank"];
            addCountLeaderboard(response, rank)
            let time = response["viewer_overall_time"];
            let HR = response["avg_hr"];
            let speed = response["avg_speed"];
            if (rank != null || domRank != null) {
                let tableBody = document.querySelector('[class*="table-leaderboard"] > tbody')
                let newRank = document.createElement('tr');
                let newRankCell = document.createElement('td');
                newRankCell.className = "text-center"
                newRankCell.innerText = rank ? rank : domRank;
                newRank.id = "RankElement"
                newRank.className = "highlighted"
                newRank.appendChild(newRankCell);

                let newRankAthlete = document.createElement('td');
                let newRankAthleteLink = document.createElement('a');
                newRankAthleteLink.href = '/athletes/' + currentAthlete.id;
                newRankAthleteLink.innerText = currentAthlete.attributes.display_name;
                newRankAthlete.className = "athlete track-click"
                newRankAthlete.appendChild(newRankAthleteLink)
                newRank.appendChild(newRankAthlete)

                let newRankActivity = document.createElement('td');
                let newRankActivityLink = document.createElement('a');
                newRankActivityLink.href = '/activities/' + activityID;
                newRankActivityLink.innerText = `${monthNames[date.getMonth()]} ${date.getDate()},${date.getFullYear()}`;
                newRankActivity.className = "track-click"
                newRankActivity.appendChild(newRankActivityLink)
                newRank.appendChild(newRankActivity)

                let newRankSpeed = document.createElement('td');
                newRankSpeed.innerHTML = speed;
                newRank.appendChild(newRankSpeed);

                let newRankHR = document.createElement('td');
                newRankHR.innerText = HR;
                let newRankHRAbbr = document.createElement('abbr');
                newRankHRAbbr.innerText = "bpm"
                newRankHRAbbr.className = "unit";
                newRankHR.appendChild(newRankHRAbbr);
                newRank.appendChild(newRankHR);

                let newRankTime = document.createElement('td');
                newRankTime.className = "last-child";
                newRankTime.innerText = time;
                newRank.appendChild(newRankTime);

                if (!document.getElementById('RankElement')) {
                    tableBody.appendChild(newRank);
                }
            }
            if (!document.getElementById('effort_table')) {
                getRecentEfforts(history);
            }
        }
    }
    request2.send();
}

function getRecentEfforts(history) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let recentEfforts = document.getElementsByClassName("recent-efforts-upsell")[0];
    recentEfforts.innerHTML = "";
    recentEfforts.style = "overflow-y: scroll"
    recentEfforts.id = "customEfforts"
    let table = document.createElement("table");
    table.className = "table table-striped table-padded"
    table.innerHTML = "<thead>" +
        "<tr>" +
        "<th>Name</th>" +
        "<th>Date</th>" +
        "<th>Pace</th>" +
        "<th>HR</th>" +
        "<th>Time</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody id='effort_table'></tbody>"
    recentEfforts.appendChild(table)
    let effortTableBody = document.getElementById('effort_table');
    history.efforts = history.efforts.sort(function (a, b) {
        return parseInt(a.elapsed_time_raw) - parseInt(b.elapsed_time_raw);
    });
    for (let i = 0; i < history.efforts.length; i++) {
        let effort = history.efforts[i];
        if (!document.getElementById(effort.id)) {
            let url = "https://www.strava.com/segment_efforts/" + effort.id;
            let request3 = new XMLHttpRequest();
            request3.open("GET", url, true);
            request3.setRequestHeader("x-requested-with", "XMLHttpRequest");
            request3.onreadystatechange = function () {
                if (request3.readyState === XMLHttpRequest.DONE && request3.status !== 404) {
                    let responseText = JSON.parse(request3.responseText);
                    let time = responseText["elapsed_time"];
                    let HR = responseText["avg_hr"];
                    let speed = responseText["avg_speed"];
                    let ms = effort['created_at'];
                    let effortDate = new Date(Date.parse(ms));
                    let effortShow = document.createElement("tr");
                    effortShow.id = responseText.id;
                    effortShow.innerHTML = `<td>${effort.activity.name}</td>` +
                        `<td class="track-click"><a href="/segment_efforts/${responseText.id}">${monthNames[effortDate.getMonth()]} ${effortDate.getDate()},${effortDate.getFullYear()}</a></td>` +
                        `<td>${speed}</td>` +
                        `<td>${HR}</td>` +
                        `<td time=${responseText.elapsed_time_raw}>${time}</td>`;
                    effortTableBody.appendChild(effortShow);
                    preSortTable()
                }
            }
            request3.send();
        }
    }
}

function addCountLeaderboard(response, rank) {
    let count = response["viewer_overall_count"];
    let tableSummaryRow = document.querySelector('[class*="table layout summary mb-0"] > tbody > tr')
    let tableSummaryData = tableSummaryRow.children[2]
    tableSummaryData.innerHTML = `${count} ${document.documentElement.lang === "nl-NL" ? "segmentpogingen" : "segment attempts"} <br> ${Math.round((1 - (rank - 1) / count) * 100)}%`
}

function addCountOverview(PR, response, rank) {
    let count = response["viewer_overall_count"];
    let countElement = document.createElement('div');
    countElement.id = 'CountElement';
    countElement.innerHTML = `Total attempts <time>${count}</time> <br> Percentile <time>${Math.round((1 - (rank - 1) / count) * 100)}%</time>`
    PR.appendChild(countElement);
}

function compareValues(a, b) {
    return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function preSortTable() {
    let table = document.getElementById("effort_table");
    let rows = Array.from(table.querySelectorAll(`tr`));

    let qs = `td:nth-child(5`;

    rows.sort((r1, r2) => {
        let t1 = r1.querySelector(qs);
        let t2 = r2.querySelector(qs);

        return compareValues(t1.getAttribute('time'), t2.getAttribute('time'));
    });

    rows.forEach(row => table.appendChild(row));
}

function sortSegmentTable(col, table) {

    let rows = Array.from(table.querySelectorAll(`tr`));

    if(originalSort)
    {
        col = 1
        let qs = `td:nth-child(${col}`;
        rows.sort((r1, r2) => {
            let t1min = Number(r1.querySelector(qs).value);
            let t2min = Number(r2.querySelector(qs).value);
            return compareValues(t1min, t2min)
        });
        originalSort = false;
        sortAmount = -1;
    }
    else {
        let qs = `td:nth-child(${col}`;
        rows.sort((r1, r2) => {
            let t1min = Number(r1.querySelector(qs).innerText.replace(/[^0-9\-\.]+/g, ""));
            let t2min = Number(r2.querySelector(qs).innerText.replace(/[^0-9\-\.]+/g, ""));
            return compareValues(t1min, t2min) * asc
        });
    }

    rows.forEach(row => table.appendChild(row));
    if(sortAmount === 1)
    {
        originalSort = true;
    }
    else {
        asc *= -1;
        sortAmount++;
    }
}

function sortSegmentTableName(table) {
    let rows = Array.from(table.querySelectorAll(`tr`));

    if(originalSort)
    {
        let qs = `td:nth-child(1`;
        rows.sort((r1, r2) => {
            let t1min = Number(r1.querySelector(qs).value);
            let t2min = Number(r2.querySelector(qs).value);
            return compareValues(t1min, t2min)
        });
        originalSort = false;
        sortAmount = -1;
    }
    else {
        let qs = `td:nth-child(4`;

        rows.sort((r1, r2) => {
            let t1min = r1.querySelector(qs).innerText.toLowerCase();
            let t2min = r2.querySelector(qs).innerText.toLowerCase();
            return compareValues(t1min, t2min) * asc
        });
    }
    rows.forEach(row => table.appendChild(row));
    if(sortAmount === 1)
    {
        originalSort = true;
    }
    else {
        asc *= -1;
        sortAmount++;
    }
}

function sortSegmentTableDivider(col, table) {
    let rows = Array.from(table.querySelectorAll(`tr`));
    if(originalSort)
    {
        let qs = `td:nth-child(1`;
        rows.sort((r1, r2) => {
            let t1min = Number(r1.querySelector(qs).value);
            let t2min = Number(r2.querySelector(qs).value);
            return compareValues(t1min, t2min)
        });
        originalSort = false;
        sortAmount = -1;
    }
    else {
        let qs = `td:nth-child(${col}`;

        rows.sort((r1, r2) => {
            let divider = ":";
            if (r1.querySelector(qs).innerText.includes(".")) {
                divider = "."
            }
            let t1sec, t2sec;
            let t1min = Number(r1.querySelector(qs).innerText.split(divider)[0].replace(/[^0-9\.]+/g, ""));
            let t2min = Number(r2.querySelector(qs).innerText.split(divider)[0].replace(/[^0-9\.]+/g, ""));
            t1sec = r1.querySelector(qs).innerText.split(divider)[1];
            t2sec = r2.querySelector(qs).innerText.split(divider)[1];
            try {
                t1sec = Number(t1sec.replace(/[^0-9\.]+/g, ""));
            } catch (e) {
                t1sec = t1min;
                t1min = 0;
            }
            try {
                t2sec = Number(t2sec.replace(/[^0-9\.]+/g, ""));
            } catch (e) {
                t2sec = t2min;
                t2min = 0;
            }
            const compareMinutes = compareValues(t1min, t2min);
            const compareSeconds = compareValues(t1sec, t2sec);
            return (compareMinutes !== 0 ? compareMinutes : compareSeconds) * asc;
        });
    }
    rows.forEach(row => table.appendChild(row));
    if(sortAmount === 1)
    {
        originalSort = true;
    }
    else {
        asc *= -1;
        sortAmount++;
    }
}

function getRank() {
    let rank = 0;
    let segmentId = window.location.pathname.split("/")[4];
    let url = "https://www.strava.com/segment_efforts/" + segmentId;
    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.setRequestHeader("x-requested-with", "XMLHttpRequest");
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            let response = JSON.parse(request.responseText)
            rank = response["viewer_overall_rank"];
            if (rank != null) {
                let PR = document.querySelector('[class="personal-records rank"]')
                let bike = false;
                if (!PR) {
                    try {
                        PR = document.querySelector('[class="compare-records row"]').children[1]
                    } catch (e) {
                        bike = true;
                        PR = document.querySelector('[class="rank"]')
                    }
                }
                if (!bike) {
                    let rankElement = document.createElement('div');
                    rankElement.innerHTML = "Rank <time>" + rank + "</time>"
                    rankElement.id = "RankElement";

                    if (!document.getElementById('RankElement')) {
                        PR.appendChild(rankElement);
                        addCountOverview(PR, response, rank)
                    }
                } else {
                    PR.innerHTML = "Rank <time>" + rank + "</time>"
                    addCountOverview(PR, response, rank)
                    window.jQuery('body').on('click', '.options:eq(7)', () => {

                        let check = window.jQuery('.unstyled:eq(2) > tbody > tr')
                        waitLeaderboardChange();

                        function waitLeaderboardChange() {
                            if (!check || check[9] === window.jQuery('.unstyled:eq(2) > tbody > tr')[9] || document.getElementById('RankElement')) {
                                setTimeout(waitLeaderboardChange, 100)
                                check = window.jQuery('unstyled:eq(2) > tbody > tr')
                            } else {
                                processBikeSegmentLeaderboard(response, segmentId, rank)
                            }

                        }
                    })
                    processBikeSegmentLeaderboard(response, segmentId, rank)

                }
            }
        }
    }
    request.send()
}

function processBikeSegmentLeaderboard(response, segmentId, rank){
    let analyzeButton = document.querySelectorAll(`[data-segment-effort-id="${segmentId}"]`)[1]
    analyzeButton.className = analyzeButton.className.replace('analysis-link-js', '')
    analyzeButton.onclick = () => {
        pageView.router().changeMenuTo(`analysis/${response['start_index']}/${response['start_index'] + response['elapsed_time_raw']}`)
    }
    let time = response["overall_time"]
    let speed = response["avg_speed"]
    let tableBody = document.querySelector('[class*="segment-leaderboard"] > table > tbody')
    let newRank = document.createElement('tr');

    let newRankCell = document.createElement('td');
    newRankCell.innerText = rank;
    newRank.id = "RankElement"
    newRank.className = "highlighted"
    newRank.appendChild(newRankCell);

    let newRankAthlete = document.createElement('td');
    let newRankAthleteLink = document.createElement('a');
    newRankAthleteLink.href = '/athletes/' + currentAthlete.id;
    newRankAthleteLink.innerText = currentAthlete.attributes.display_name;
    newRankAthleteLink.className = 'minimal'
    newRankAthlete.className = "results-col-js"
    newRankAthlete.appendChild(newRankAthleteLink)
    newRank.appendChild(newRankAthlete)

    let newRankTime = document.createElement('td');
    newRankTime.innerHTML = `<a class="minimal" href="/segment_efforts/${segmentId}">${time}</a>`;
    newRank.appendChild(newRankTime);

    let newRankSpeed = document.createElement('td')
    newRankSpeed.innerHTML = speed
    newRank.appendChild(newRankSpeed)
    if (!document.getElementById('RankElement')) {
        tableBody.appendChild(newRank);
    }
}
