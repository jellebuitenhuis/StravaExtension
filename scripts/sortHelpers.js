{

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

        if (originalSort) {
            col = 1
            let qs = `td:nth-child(${col}`;
            rows.sort((r1, r2) => {
                let t1min = Number(r1.querySelector(qs).value);
                let t2min = Number(r2.querySelector(qs).value);
                return compareValues(t1min, t2min)
            });
            originalSort = false;
            sortAmount = -1;
        } else {
            let qs = `td:nth-child(${col}`;
            rows.sort((r1, r2) => {
                let t1min = Number(r1.querySelector(qs).innerText.replace(/[^0-9\-.]+/g, ""));
                let t2min = Number(r2.querySelector(qs).innerText.replace(/[^0-9\-.]+/g, ""));
                return compareValues(t1min, t2min) * asc
            });
        }

        rows.forEach(row => table.appendChild(row));
        if (sortAmount === 1) {
            originalSort = true;
        } else {
            asc *= -1;
            sortAmount++;
        }
    }

    function sortSegmentTableName(table) {
        let rows = Array.from(table.querySelectorAll(`tr`));

        if (originalSort) {
            let qs = `td:nth-child(1`;
            rows.sort((r1, r2) => {
                let t1min = Number(r1.querySelector(qs).value);
                let t2min = Number(r2.querySelector(qs).value);
                return compareValues(t1min, t2min)
            });
            originalSort = false;
            sortAmount = -1;
        } else {
            let qs = `td:nth-child(4`;

            rows.sort((r1, r2) => {
                let t1min = r1.querySelector(qs).innerText.toLowerCase();
                let t2min = r2.querySelector(qs).innerText.toLowerCase();
                return compareValues(t1min, t2min) * asc
            });
        }
        rows.forEach(row => table.appendChild(row));
        if (sortAmount === 1) {
            originalSort = true;
        } else {
            asc *= -1;
            sortAmount++;
        }
    }

    function sortSegmentTableDivider(col, table) {
        let rows = Array.from(table.querySelectorAll(`tr`));
        if (originalSort) {
            let qs = `td:nth-child(1`;
            rows.sort((r1, r2) => {
                let t1min = Number(r1.querySelector(qs).value);
                let t2min = Number(r2.querySelector(qs).value);
                return compareValues(t1min, t2min)
            });
            originalSort = false;
            sortAmount = -1;
        } else {
            let qs = `td:nth-child(${col}`;

            rows.sort((r1, r2) => {
                let divider = ":";
                if (r1.querySelector(qs).innerText.includes(".")) {
                    divider = "."
                }
                let t1sec, t2sec;
                let t1min = Number(r1.querySelector(qs).innerText.split(divider)[0].replace(/[^0-9]+/g, ""));
                let t2min = Number(r2.querySelector(qs).innerText.split(divider)[0].replace(/[^0-9]+/g, ""));
                t1sec = r1.querySelector(qs).innerText.split(divider)[1];
                t2sec = r2.querySelector(qs).innerText.split(divider)[1];
                try {
                    t1sec = Number(t1sec.replace(/[^0-9]+/g, ""));
                } catch (e) {
                    t1sec = t1min;
                    t1min = 0;
                }
                try {
                    t2sec = Number(t2sec.replace(/[^0-9]+/g, ""));
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
        if (sortAmount === 1) {
            originalSort = true;
        } else {
            asc *= -1;
            sortAmount++;
        }
    }
}