import './commands'

const toStrings = (cells$) => _.map(cells$, 'textContent')
const toNumbers = (elements) => _.map(elements.map((element) => {
    if (element.includes(':') || element.includes('.')) {
        let divider = ":";
        if (element.includes(".")) {
            divider = "."
        }
        let t1min = Number(element.split(divider)[0].replace(/[^0-9\.]+/g, ""));
        let t1sec = element.split(divider)[1];
        try {
            t1sec = Number(t1sec.replace(/[^0-9\.]+/g, ""));
        } catch (e) {
            t1sec = t1min;
            t1min = 0;
        }
        if (element.includes('km')) {
            return t1min + t1sec * 0.1
        }
        return t1min * 60 + t1sec
    }
    if (element.replace(/[^0-9\.]+/g, "") === "") {
        return element
    }
    return Number(element.replace(/[^0-9\-\.]+/g, ""));
}))
const {_} = Cypress

const sorted = (_chai, utils) => {
    function assertIsSorted(options) {
        this._obj
            .then(toStrings)
            .then(toNumbers)
            .then((elements) => {
                try {
                    elements = elements.map((element) => {
                        return element.toLowerCase()
                    })
                } catch (e) {
                }
                const sorted = _.sortBy(elements)
                expect(elements, 'cells are sorted').to.deep.equal(sorted)
            })
    }

    function assertIsReverseSorted(options) {
        this._obj
            .then(toStrings)
            .then(toNumbers)
            .then((elements) => {
                try {
                    elements = elements.map((element) => {
                        return element.toLowerCase()
                    })
                } catch (e) {
                }
                const sorted = _.sortBy(elements).reverse()
                expect(elements, 'cells are sorted in reverse').to.deep.equal(sorted)
            })
    }

    _chai.Assertion.addMethod('sorted', assertIsSorted)
    _chai.Assertion.addMethod('reverseSorted', assertIsReverseSorted)
}

chai.use(sorted)

// Alternatively you can use CommonJS syntax:
// require('./commands')
