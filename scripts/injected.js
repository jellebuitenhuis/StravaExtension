{
    init()
}

function init() {
    let regex = /strava\.com\/activities\/\d+.*/;
    if (regex.test(window.location.href)) {
        let check = () => document.getElementById('pagenav');
        waitFor(check, addAnalysisButton);
        addSegmentsToPage();
        addFlybyLink();
    }
    if (/\/activities\/\d+\/segments\/\d+\/?$/.test(window.location.pathname)) {
        let check = () => document.querySelector('[data-tracking-element="view_full_leaderboard"]');
        waitFor(check, getRank);
    } else if (window.location.pathname.split("/")[1] === "segments" && window.location.pathname.split("/")[3] !== "compare") {
        let check = () => typeof currentAthlete !== "undefined";
        waitFor(check, getLeaderBoard);
    }
}

function processRunSegmentData() {
    let efforts = document.querySelectorAll('[data-segment-effort-id]');
    for (let effort of efforts) {
        let id = effort.getAttribute('data-segment-effort-id');
        let url = "https://www.strava.com/segment_efforts/" + id;
        let request = new XMLHttpRequest();
        request.open("GET", url);
        request.setRequestHeader("x-requested-with", "XMLHttpRequest");
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                let response = JSON.parse(request.responseText);
                let rank = response['overall_rank'];
                let count = response['viewer_overall_count'];

                document.querySelector(`[data-segment-effort-id="${id}"]`).children[0].value = response.start_index;
                let lastIndex = 8;
                let fastestTime = hmsToSecondsOnly(response.viewer_overall_time);
                let currentTime = response.elapsed_time_raw;
                let percent = Math.round((currentTime / fastestTime - 1) * 100);
                addSegmentCell(id, `${isNaN(percent) ? 'N/A' : percent + '%'}`, lastIndex);

                let activityAthlete = document.evaluate('/html/body/script[contains(., "gender")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
                let gender = activityAthlete.match(/"gender":"."/)[0];
                let komTime = gender.includes("M") ? hmsToSecondsOnly(response.kom_time) : hmsToSecondsOnly(response.qom_time);
                if (currentTime < komTime) {
                    komTime = currentTime;
                }
                percent = Math.round((currentTime / komTime - 1) * 100);
                addSegmentCell(id, `${isNaN(percent) ? 'N/A' : percent + '%'}`, lastIndex);

                addSegmentCell(id, Math.round((1 - (rank - 1) / count) * 100), lastIndex);

                addSegmentCell(id, count, lastIndex);

                addSegmentCell(id, rank, lastIndex);
            }
        }
        request.send();
    }
}

function processBikeSegmentData() {
    let efforts = document.querySelectorAll('[data-segment-effort-id]');
    for (let effort of efforts) {
        let id = effort.getAttribute('data-segment-effort-id');
        let url = "https://www.strava.com/segment_efforts/" + id;
        let request = new XMLHttpRequest();
        request.open("GET", url);
        request.setRequestHeader("x-requested-with", "XMLHttpRequest");
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                let response = JSON.parse(request.responseText);
                let rank = response['overall_rank'];
                let count = response['viewer_overall_count'];

                document.querySelector(`[data-segment-effort-id="${id}"]`).children[0].value = response.start_index;

                let fastestTime = hmsToSecondsOnly(response.viewer_overall_time);
                let currentTime = response.elapsed_time_raw;

                let komTime = currentAthlete.attributes.gender === "M" ? hmsToSecondsOnly(response.kom_time) : hmsToSecondsOnly(response.qom_time);
                if (currentTime < komTime) {
                    komTime = currentTime;
                }
                let percent = Math.round((currentTime / fastestTime - 1) * 100);
                addSegmentCell(id, `${isNaN(percent) ? 'N/A' : percent+'%'}`, 9);

                addSegmentCell(id,`${Math.round((currentTime / komTime - 1) * 100)}%`,9);

                addSegmentCell(id,Math.round((1 - (rank - 1) / count) * 100),9);

                addSegmentCell(id, count, 9);

                addSegmentCell(id, rank, 9);
            }
        }
        request.send()
    }
}

function addSegmentsToPage() {
    if (!document.getElementById('NewRow')) {
        let bikePage = checkIfBikePage();
        if (!bikePage) {
            if (/\/activities\/\d+\/segments(\/\d)?/.test(window.location.pathname)) {
                let tableHeadRow = document.querySelector('[class*="dense hoverable marginless run segments"] > thead > tr');
                tableHeadRow.id = 'NewRow';
                let table = tableHeadRow.parentElement.parentElement.querySelector('tbody');

                const headers = tableHeadRow.querySelectorAll('th');
                let nameRow = headers[3];
                nameRow.onclick = () => {
                    sortSegmentTableName(table);
                }
                let timeRow = headers[4];
                timeRow.onclick = () => {
                    sortSegmentTableDivider(5, table);
                }
                let distanceRow = headers[5];
                distanceRow.onclick = () => {
                    sortSegmentTable(6, table);
                }
                let speedRow = headers[6];
                speedRow.onclick = () => {
                    sortSegmentTableDivider(7, table);
                }
                let elevationRow = headers[7];
                elevationRow.onclick = () => {
                    sortSegmentTable(8, table);
                }
                let hrRow = headers[8];
                hrRow.onclick = () => {
                    sortSegmentTable(9, table);
                }
                addSegmentRow('% slower than personal best', 'expanded-only', () => {
                    sortSegmentTable(14, table);
                })

                addSegmentRow('% slower than KOM/QOM', 'expanded-only', () => {
                    sortSegmentTable(13, table);
                })

                addSegmentRow('Percentile', 'expanded-only', () => {
                    sortSegmentTable(12, table);
                })

                addSegmentRow('Count', 'expanded-only', () => {
                    sortSegmentTable(11, table)
                })

                addSegmentRow('Rank', 'expanded-only', () => {
                    sortSegmentTable(10, table)
                })

                processRunSegmentData()
            }
        } else {
            let tableHeadRow = document.querySelector('[class*="dense hoverable marginless segments"] > thead > tr');
            tableHeadRow.id = 'NewRow'
            let table = document.getElementById("segments").firstElementChild.children[1].children[1]

            const headers = tableHeadRow.querySelectorAll('th')
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

            addSegmentRow('% slower than personal best', 'expanded-only', () => {
                sortSegmentTable(15, table)
            })

            addSegmentRow('% slower than KOM/QOM', 'expanded-only', () => {
                sortSegmentTable(14, table)
            })

            addSegmentRow('Percentile', 'expanded-only', () => {
                sortSegmentTable(13, table)
            })

            addSegmentRow('Count', 'expanded-only', () => {
                sortSegmentTable(12, table)
            })

            addSegmentRow('Rank', 'expanded-only', () => {
                sortSegmentTable(11, table)
            })

            processBikeSegmentData()
        }
    }
}

function buildFlybyIdTable(matchId) {
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
    for (let id of activityIds) {
        fetch(`https://nene.strava.com/flyby/matches/${id}`, {
            method: "GET"
        }).then((response) => {
            response.json().then((response) => {
                let tableRow = document.createElement('tr')
                let dateElement = document.createElement('td')
                let date = new Date(response.activity.startTime * 1000)
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
                idTable.querySelector('tbody').appendChild(tableRow)
            })
        })
    }
    return idTable
}

function buildCheckbox(activity, matchId) {
    let addInput = document.createElement('input')
    addInput.type = 'checkbox'
    addInput.value = activity.id
    addInput.checked = window.localStorage.getItem("flybyIds").includes(activity.id)
    addInput.onchange = (event) => {
        if (event.target.checked) {
            let localStorage = JSON.parse(window.localStorage.getItem("flybyIds"))
            localStorage.push(event.target.value)
            window.localStorage.setItem("flybyIds", JSON.stringify(localStorage))
            refreshFlybyTable(matchId)
        } else {
            let localStorage = JSON.parse(window.localStorage.getItem("flybyIds"))
            localStorage.splice(localStorage.indexOf(event.target.value), 1)
            window.localStorage.setItem("flybyIds", JSON.stringify(localStorage))
            refreshFlybyTable(matchId)
        }
    }
    return addInput
}

function addAnalysisButton() {
    let splitUrl = window.location.pathname.split("/")
    let premiumView = document.getElementById('premium-views')
    let bikePage = checkIfBikePage()
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
        let navigationList = document.querySelector('.pagenav')
        let analysisButton = document.createElement('li')
        analysisButton.id = 'new-analysis'
        analysisButton.className = 'track-click'
        analysisButton.onclick = () => {
            pageView.router().changeMenuTo(`analysis/0/1000`)
        }
        analysisButton.innerHTML = `<a>Analysis</a>`
        if (!document.getElementById('new-analysis')) {
            navigationList.append(analysisButton)
        }
        if (splitUrl[3] === 'analysis') {
            let list = document.getElementById('new-analysis')
            list.className = 'track-click selected'
        }
    }
}

function getLeaderBoard() {
    let domRank = JSON.parse(document.querySelector('[class*="leaderboard row"]').getAttribute('data-tracking')).viewer_rank
    if (domRank > 10) {
        let url = "https://www.strava.com/athlete/segments/" + window.location.pathname.split("/")[2] + "/history"
        let request = new XMLHttpRequest()
        request.open("GET", url)
        request.setRequestHeader("x-requested-with", "XMLHttpRequest")
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                let history = JSON.parse(request.responseText.replace(/"id":(\d+)/g, '"id":"$1"'))
                let ms = history.athlete_best_efforts[0]['created_at']
                let date = new Date(Date.parse(ms))
                let activityID = history.athlete_best_efforts[0]['activity_id']
                let bestEffortID = history.athlete_best_efforts[0]['id']
                if (history.athlete_best_efforts[0].activity_type === 1) {
                    window.jQuery('body').on('click', '.options:eq(6)', () => {
                        let check = () => (window.jQuery('.table.table-striped.table-padded.table-leaderboard:eq(0) > tbody > tr') || window.jQuery('.table.table-striped.table-padded.table-leaderboard:eq(0) > tbody > tr')[9] === window.jQuery('.table.table-striped.table-padded.table-leaderboard:eq(0) > tbody > tr')[9])
                        waitFor(check, processSegment)
                    })
                    processSegment(date, monthNames, activityID, bestEffortID, history, domRank)
                } else {
                    window.jQuery('body').on('click', '.options:eq(6)', () => {
                        processSegment(date, monthNames, activityID, bestEffortID, history, domRank)
                    })
                    processSegment(date, monthNames, activityID, bestEffortID, history, domRank)
                }
            }
        }
        request.send()
    } else {
        let url = "https://www.strava.com/athlete/segments/" + window.location.pathname.split("/")[2] + "/history"
        let request = new XMLHttpRequest()
        request.open("GET", url)
        request.setRequestHeader("x-requested-with", "XMLHttpRequest")
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                let history = JSON.parse(request.responseText.replace(/"id":(\d+)/g, '"id":"$1"'))
                if (!document.getElementById('effort_table')) {
                    getRecentEfforts(history)
                }
                let url = "https://www.strava.com/segment_efforts/" + history['athlete_best_efforts'][1]['id']
                let request2 = new XMLHttpRequest()
                request2.open("GET", url)
                request2.setRequestHeader("x-requested-with", "XMLHttpRequest")
                request2.onreadystatechange = function () {
                    if (request2.readyState === XMLHttpRequest.DONE) {
                        let response = JSON.parse(request2.responseText)
                        addCountLeaderboard(response, domRank)
                    }
                }
                request2.send()

            }
        }
        request.send()
    }
}

function processSegment(date, monthNames, activityID, bestEffortID, history, domRank) {
    let url = "https://www.strava.com/segment_efforts/" + bestEffortID
    let request2 = new XMLHttpRequest()
    request2.open("GET", url)
    request2.setRequestHeader("x-requested-with", "XMLHttpRequest")
    request2.onreadystatechange = function () {
        if (request2.readyState === XMLHttpRequest.DONE) {
            let response = JSON.parse(request2.responseText)

            let rank = response["viewer_overall_rank"]
            addCountLeaderboard(response, rank)
            if (rank != null || domRank != null) {
                addPersonalRank(response, rank, domRank, date, activityID)
            }
            if (!document.getElementById('effort_table')) {
                getRecentEfforts(history)
            }
        }
    }
    request2.send()
}

function getRecentEfforts(history) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    let recentEfforts = document.getElementsByClassName("recent-efforts-upsell")[0]
    recentEfforts.innerHTML = ""
    recentEfforts.style = "overflow-y: scroll"
    recentEfforts.id = "customEfforts"
    let table = document.createElement("table")
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
    let effortTableBody = document.getElementById('effort_table')
    history.efforts = history.efforts.sort(function (a, b) {
        return parseInt(a.elapsed_time_raw) - parseInt(b.elapsed_time_raw)
    })
    for (let i = 0; i < history.efforts.length; i++) {
        let effort = history.efforts[i]
        if (!document.getElementById(effort.id)) {
            let url = "https://www.strava.com/segment_efforts/" + effort.id
            let request3 = new XMLHttpRequest()
            request3.open("GET", url, true)
            request3.setRequestHeader("x-requested-with", "XMLHttpRequest")
            request3.onreadystatechange = function () {
                if (request3.readyState === XMLHttpRequest.DONE && request3.status !== 404) {
                    let responseText = JSON.parse(request3.responseText)
                    let time = responseText["elapsed_time"]
                    let HR = responseText["avg_hr"]
                    let speed = responseText["avg_speed"]
                    let ms = effort['created_at']
                    let effortDate = new Date(Date.parse(ms))
                    let effortShow = document.createElement("tr")
                    effortShow.id = responseText.id
                    effortShow.innerHTML = `<td>${effort.activity.name}</td>` +
                        `<td class="track-click"><a href="/segment_efforts/${responseText.id}">${monthNames[effortDate.getMonth()]} ${effortDate.getDate()},${effortDate.getFullYear()}</a></td>` +
                        `<td>${speed}</td>` +
                        `<td>${HR}</td>` +
                        `<td time=${responseText.elapsed_time_raw}>${time}</td>`
                    effortTableBody.appendChild(effortShow)
                    preSortTable()
                }
            }
            request3.send()
        }
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

                        let segmentMenu = document.querySelector('[class*="link-menu no-margins row"]');
                        let analysisButton = document.createElement('div')
                        analysisButton.className = 'spans8'
                        analysisButton.innerHTML = `<a class="track-click" href="/activities/${window.location.pathname.split("/")[2]}/analysis/${response.start_index}/${response.end_index}" data-tracking-element="analysis">Analysis</a>`
                        segmentMenu.appendChild(analysisButton)
                    }
                } else {
                    PR.innerHTML = "Rank <time>" + rank + "</time>"
                    addCountOverview(PR, response, rank)
                    window.jQuery('body').on('click', '.options:eq(7)', () => {

                        let check = () => (window.jQuery('.unstyled:eq(2) > tbody > tr') || window.jQuery('.unstyled:eq(2) > tbody > tr')[9] === window.jQuery('.unstyled:eq(2) > tbody > tr')[9])
                        waitFor(check, processSegment)
                    })
                    processBikeSegmentLeaderboard(response, segmentId, rank)

                }
            }
        }
    }
    request.send()
}

function processBikeSegmentLeaderboard(response, segmentId, rank) {
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