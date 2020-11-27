{
    function addSegmentRow(innerText, className, onclick) {
        let tableHeadRow = document.querySelector('.dense.hoverable.marginless.segments > thead > tr');
        let segmentRow = document.createElement('th');
        segmentRow.innerText = innerText;
        segmentRow.className = className;
        segmentRow.onclick = onclick
        insertAfter(segmentRow, tableHeadRow.children[8]);
    }

    function addSegmentCell(id, innerText, lastIndex) {
        let effortRow = document.createElement('td')
        effortRow.innerText = innerText
        insertAfter(effortRow, document.querySelector(`[data-segment-effort-id="${id}"]`).children[lastIndex])
    }


    function addPersonalRankCell(innerText, className, innerHtml, parent) {
        let personalRankCell = document.createElement('td');
        personalRankCell.className = className
        personalRankCell.innerText = innerText
        if (innerHtml) personalRankCell.innerHTML = innerHtml
        parent.appendChild(personalRankCell);
        return personalRankCell
    }

    function addPersonalRankLink(innerText, href, parent) {
        let personalRankLink = document.createElement('a');
        personalRankLink.href = href
        personalRankLink.innerText = innerText
        parent.appendChild(personalRankLink)
    }

    function addPersonalRank(response, rank, domRank, date, activityID) {
        let time = response["viewer_overall_time"];
        let HR = response["avg_hr"];
        let watt = response["avg_watts_raw"];
        let wattAbbr = response["avg_watts"];
        let speed = response["avg_speed"];
        let tableBody = document.querySelector('[class*="table-leaderboard"] > tbody')
        let newRank = document.createElement('tr');
        newRank.id = "RankElement"
        newRank.className = "highlighted"

        addPersonalRankCell(rank ? rank : domRank,"text-center highlighted","",newRank)

        let newRankAthlete = addPersonalRankCell("","athlete track-click","",newRank)
        addPersonalRankLink(currentAthlete.attributes.display_name,'/athletes/' + currentAthlete.id,newRankAthlete)

        let newRankActivity = addPersonalRankCell("","track-click","",newRank)
        addPersonalRankLink(`${monthNames[date.getMonth()]} ${date.getDate()},${date.getFullYear()}`,'/activities/' + activityID,newRankActivity)

        addPersonalRankCell("","", speed,newRank)

        addPersonalRankCell("","", `${HR} <abbr class="unit">bpm</abbr>`,newRank)

        if(!speed.match(/\/km|\/m/)) addPersonalRankCell(watt ? `${watt} ${wattAbbr}` : "-","","",newRank)

        addPersonalRankCell(time,"last-child","",newRank)

        if (!document.getElementById('RankElement')) {
            tableBody.appendChild(newRank);
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

    function addFlybyTable(id) {
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
            for (let match of matches) {
                let tableRow = document.createElement('tr')
                let date = new Date(match.otherActivity.startTime * 1000)
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

    function addFlybyLink(){
        let menu = document.getElementById('pagenav')
        let flybyLink = document.createElement('li')
        flybyLink.innerHTML = `<a data-menu="flybys">Flybys</a>`
        flybyLink.id = 'flybyLink'
        flybyLink.onclick = () => {
            let matchId = window.location.href.match(/\d+/g)[0]
            addFlybyTable(matchId).then((table) => {
                document.getElementById('view').innerHTML = ""
                document.getElementById('view').appendChild(table)
                let flybyButton = document.createElement('button')
                flybyButton.innerText = 'Open Flybys'
                flybyButton.className = 'btn btn-primary'
                flybyButton.onclick = () => {
                    let activityIds = JSON.parse(window.localStorage.getItem("flybyIds"))
                    let baseUrl = `https://labs.strava.com/flyby/viewer/#${matchId}`
                    for (let id of activityIds) {
                        if (id !== matchId) {
                            baseUrl = baseUrl.concat(`/${id}`)
                        }
                    }
                    if (equalize) {
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
                insertAfter(checkboxLabel, flybyButton)
                insertAfter(equalizeCheckbox, flybyButton)
                let idTable = buildFlybyIdTable(matchId)
                insertAfter(idTable, table)
            })
        }
        if (!document.getElementById('flybyLink')) {
            menu.appendChild(flybyLink)
        }
    }
}