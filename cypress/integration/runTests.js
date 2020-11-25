import {readFileSync} from "fs";
import {resolve} from "path";

describe('Test the running part', () => {

    before(() => {
        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        })
    })

    beforeEach(() => {
        cy.setCookie('_strava4_session', Cypress.env('STRAVA_LOGIN_COOKIE'))
    })

    describe('Button tests', () => {

        before(() => {
            cy.task('getRunOverview').then((html) => {
                cy.intercept({
                    method: 'GET',
                    url: 'https://www.strava.com/activities/2879471822/overview'
                }, html)
                cy.window().then((window) => {
                    window.document.cookie = `_strava4_session=${Cypress.env('STRAVA_LOGIN_COOKIE')};domain=.strava.com;path=/;secure=true`;
                })
                cy.visit('https://www.strava.com/activities/2879471822/overview')
            })
        })


        it('tests the Analysis button', () => {
            let analysisButton = cy.get('#new-analysis')
            analysisButton.click()
            cy.location().should((loc) => {
                expect(loc.pathname).to.equal('/activities/2879471822/analysis/0/1000')
            })
        })

        it('tests the flyby button', () => {
            let flybyLink = cy.get('#flybyLink')
            flybyLink.click()
            cy.location().should((loc) => {
                expect(loc.pathname).to.equal('/activities/2879471822/flybys')
            })
        })
    })
    describe('Segment testing', () => {
        before(() => {
            cy.task('getRunSegment').then((html) => {
                cy.intercept({
                    method: 'GET',
                    url: 'https://www.strava.com/activities/2879471822/segments'
                }, html)
                cy.window().then((window) => {
                    window.document.cookie = `_strava4_session=${Cypress.env('STRAVA_LOGIN_COOKIE')};domain=.strava.com;path=/;secure=true`;
                })
                cy.visit('https://www.strava.com/activities/2879471822/segments')
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
                    case 9:
                        expect(element.text()).to.match(/\d+/)
                        break;
                    case 10:
                        expect(element.text()).to.match(/\d+/)
                        break;
                    case 11:
                        expect(element.text()).to.match(/\d{1,3}/)
                        break;
                    case 12:
                        expect(element.text()).to.match(/(\d{1,4}%|N\/A)/)
                        break;
                    case 13:
                        expect(element.text()).to.match(/(\d{1,4}%|N\/A)/)
                        break;
                }
            })

        })

        it('checks if sorting works', () => {
            for(let i = 4; i < 15; i++)
            {
                cy.get(`#NewRow th:nth-child(${i}`).click()
                expect(cy.get(`.segments tbody tr td:nth-child(${i})`)).to.be.sorted()
                cy.get(`#NewRow th:nth-child(${i}`).click()
                expect(cy.get(`.segments tbody tr td:nth-child(${i})`)).to.be.reverseSorted()
                cy.get(`#NewRow th:nth-child(${i}`).click()
            }
        })
    })
})