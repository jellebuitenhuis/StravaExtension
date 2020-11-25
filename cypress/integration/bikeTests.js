describe('Test the bike part', () => {

    before(() => {
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        })
    })

    beforeEach(() => {
        cy.setCookie('_strava4_session', Cypress.env('STRAVA_LOGIN_COOKIE'),{secure: true, httpOnly: true})
    })

    describe('Button tests', () => {

        before(() => {
            cy.task('getBikeSegment').then((html) => {
                cy.intercept({
                    method: 'GET',
                    url: 'https://www.strava.com/activities/4302379489/segments/2760173451130440088'
                }, html)
            })
            cy.task('getBikeOverview').then((html) => {
                cy.intercept({
                    method: 'GET',
                    url: 'https://www.strava.com/activities/4302379489/overview'
                }, html)
                cy.window().then((window) => {
                    window.document.cookie = `_strava4_session=${Cypress.env('STRAVA_LOGIN_COOKIE')};domain=.strava.com;path=/;secure=true`;
                })
                cy.visit('https://www.strava.com/activities/4302379489/overview')
            })
        })

        it.only('tests the analysis button', () => {
            cy.get('tr[data-segment-effort-id="2760173451130440088"]').click()
            cy.get('.pr-comparison > div').find('strong')
            cy.get('.pr-comparison > div').find('strong').then((element) => {
                expect(element.text()).to.match(/\n Your PR\n \n \d+:\d{2}/)
            })
            cy.get('.pr-comparison > div > .rank').then((element) => {
                expect(element.text()).to.match(/Rank \d+Total attempts \d+  Percentile \d{1,3}%/)
            })
            cy.get('#RankElement').should('be.visible')
            cy.get('#RankElement').find('td').each((element, index)  => {
                switch (index) {
                    case 0:
                        expect(element.text()).to.match(/\d+/)
                        break;
                    case 1:
                        expect(element.text()).to.match(/[a-zA-Z ]+/)
                        break;
                    case 2:
                        expect(element.text()).to.match(/\d+:\d{2}/)
                        break;
                    case 3:
                        expect(element.text()).to.match(/\d+\.\dkm\/h/)
                        break;
                }
            })
        })

        it('tests the flyby button', () => {
            let flybyLink = cy.get('#flybyLink')
            flybyLink.click()
            cy.get('#flybyTable').should('be.visible')
            cy.get('#idTable').should('be.visible')
            cy.get('#flybyEqualizeCheckbox').should('be.visible')
            cy.get('label[for="flybyEqualizeCheckbox"]').should('be.visible')
            cy.get('input[value="4302379489"').click().should('be.checked')
            cy.get('#idTable > tbody').find('tr').should('have.length',1)
            cy.get('input[value="4302379489"').eq(1).click()
            cy.get('input[value="4302379489"').should('not.be.checked')
            cy.get('#idTable > tbody').find('tr').should('have.length',0)
        })
    })

    describe('Segment testing', () => {
        before(() => {
            cy.task('getBikeOverview').then((html) => {
                cy.intercept({
                    method: 'GET',
                    url: 'https://www.strava.com/activities/4302379489/overview'
                }, html)
                cy.window().then((window) => {
                    window.document.cookie = `_strava4_session=${Cypress.env('STRAVA_LOGIN_COOKIE')};domain=.strava.com;path=/;secure=true`;
                })
                cy.visit('https://www.strava.com/activities/4302379489/overview')
            })
        })

        it('checks if all columns are present', () => {
            let tableHeaderRow = cy.get('#NewRow')
            tableHeaderRow.find('th').each((element, index) => {
                switch (index) {
                    case 9:
                        expect(element).to.have.text('Rank')
                        break;
                    case 10:
                        expect(element).to.have.text('Count')
                        break;
                    case 11:
                        expect(element).to.have.text('Percentile')
                        break;
                    case 12:
                        expect(element).to.have.text('% slower than KOM/QOM')
                        break;
                    case 13:
                        expect(element).to.have.text('% slower than personal best')
                        break;
                }
            })
        })

        it('checks if all values are correct', () => {
            let firstTableRow = cy.get('#segments > section > table > tbody > tr').eq(0)
            firstTableRow.find('td').each((element, index) => {
                switch (index) {
                    case 10:
                        expect(element.text()).to.match(/\d+/)
                        break;
                    case 11:
                        expect(element.text()).to.match(/\d+/)
                        break;
                    case 12:
                        expect(element.text()).to.match(/\d{1,3}/)
                        break;
                    case 13:
                        expect(element.text()).to.match(/(\d{1,4}%|N\/A)/)
                        break;
                    case 14:
                        expect(element.text()).to.match(/(\d{1,4}%|N\/A)/)
                        break;
                }
            })

        })

        it('checks if sorting works', () => {
            // cy.get(`#NewRow th:nth-child(4`).click()
            // expect(cy.get(`.segments tbody tr td:nth-child(4)`)).to.be.sorted()
            // cy.get(`#NewRow th:nth-child(4`).click()
            // expect(cy.get(`.segments tbody tr td:nth-child(4)`)).to.be.reverseSorted()
            // cy.get(`#NewRow th:nth-child(4`).click()
            for(let i = 5; i < 15; i++)
            {
                cy.get(`#NewRow th:nth-child(${i}`).click()
                expect(cy.get(`.segments tbody tr td:nth-child(${i+1})`)).to.be.sorted()
                cy.get(`#NewRow th:nth-child(${i}`).click()
                expect(cy.get(`.segments tbody tr td:nth-child(${i+1})`)).to.be.reverseSorted()
                cy.get(`#NewRow th:nth-child(${i}`).click()
            }
        })
    })
})