{
    var equalize = false;
    var originalSort = false;
    var sortAmount = 0;
    var asc = 1;
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    if (!window.localStorage.getItem("flybyIds")) {
        window.localStorage.setItem("flybyIds", "[]")
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


    function checkIfBikePage() {
        let bikePage;
        try {
            let activityData = JSON.parse(document.querySelector('[data-react-class="ActivityTagging"]').getAttribute('data-react-props'))
            bikePage = activityData["activityType"] === "ride"
        } catch (e) {
            bikePage = document.querySelector('[class="title"]').innerText.includes('Ride')
        }
        return bikePage;
    }


    function waitFor(check, callback) {
        if (!check()) {
            setTimeout(() => waitFor(check, callback), 100)
        } else {
            callback();
        }

    }

    function getFlybys(id) {
        let url = `https://nene.strava.com/flyby/matches/${id}`
        return fetch(url, {
            method: "GET"
        }).then((response) => {
            return response.json().then((result) => {
                return result
            })
        })
    }

    function refreshFlybyTable(matchId) {
        let table = document.getElementById('idTable')
        let idTable = buildFlybyIdTable(matchId)
        table.replaceWith(idTable)
        addFlybyTable(matchId).then((table) => {
            document.getElementById('flybyTable').replaceWith(table)
        })
    }

}