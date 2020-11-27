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
                    url: '/activities/2879471822/overview'
                }, html)
                cy.window().then((window) => {
                    window.document.cookie = `_strava4_session=${Cypress.env('STRAVA_LOGIN_COOKIE')};domain=.strava.com;path=/;secure=true`;
                })
                cy.visit('/activities/2879471822/overview')
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
            cy.get('#flybyTable').should('be.visible')
            cy.get('#idTable').should('be.visible')
            cy.get('#flybyEqualizeCheckbox').should('be.visible')
            cy.get('label[for="flybyEqualizeCheckbox"]').should('be.visible')
            cy.get('input[value="2881863183"]').click().should('be.checked')
            cy.get('#idTable > tbody').find('tr').should('have.length', 1)
            cy.get('input[value="2881863183"]').eq(1).click()
            cy.get('input[value="2881863183"]').should('not.be.checked')
            cy.get('#idTable > tbody').find('tr').should('have.length', 0)
        })
    })

    describe('Activity segment leaderboard testing', () => {
        before(() => {
            cy.task('getRunSegmentLeaderboard').then((html) => {
                cy.intercept({
                    method: 'GET',
                    url: '/activities/2879471822/segments/71535577620'
                }, html)
                cy.window().then((window) => {
                    window.document.cookie = `_strava4_session=${Cypress.env('STRAVA_LOGIN_COOKIE')};domain=.strava.com;path=/;secure=true`;
                })
                cy.visit('/activities/2879471822/segments/71535577620')
            })
        })

        it('tests the PR display', () => {
            cy.get('.rank.spans8').eq(1).find('time').then((element) => {
                expect(element.text()).to.match(/\d+s|\d+:\d{2}/)
            })
            cy.get('#RankElement').should('be.visible').then((element) => {
                expect(element.text()).to.match(/Rank \d+/)
            })
            cy.get('#CountElement').should('be.visible').then((element) => {
                expect(element.text()).to.match(/Total attempts \d+  Percentile \d{1,3}%/)
            })

        })
    })
    describe('Segment testing', () => {
        before(() => {
            cy.task('getRunSegment').then((html) => {
                cy.intercept({
                    method: 'GET',
                    url: '/activities/2879471822/segments'
                }, html)
                cy.window().then((window) => {
                    window.document.cookie = `_strava4_session=${Cypress.env('STRAVA_LOGIN_COOKIE')};domain=.strava.com;path=/;secure=true`;
                })
                cy.visit('/activities/2879471822/segments')
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
            for (let i = 4; i < 15; i++) {
                cy.get(`#NewRow th:nth-child(${i}`).click()
                expect(cy.get(`.segments tbody tr td:nth-child(${i})`)).to.be.sorted()
                cy.get(`#NewRow th:nth-child(${i}`).click()
                expect(cy.get(`.segments tbody tr td:nth-child(${i})`)).to.be.reverseSorted()
                cy.get(`#NewRow th:nth-child(${i}`).click()
            }
        })
    })

    describe('Leaderboard testing', () => {

        before(() => {
            cy.task('getRunLeaderboard').then((html) => {
                cy.intercept({
                    method: 'GET',
                    url: '/segments/8251514'
                }, html)
                cy.window().then((window) => {
                    window.document.cookie = `_strava4_session=${Cypress.env('STRAVA_LOGIN_COOKIE')};domain=.strava.com;path=/;secure=true`;
                })
                cy.visit('/segments/8251514')
            })
        })

        it('checks if the recent efforts table exists', () => {
            cy.getCookie('_strava4_session').then((cookie) => {
                console.log(cookie);
            })
            cy.get('#customEfforts').should('be.visible')
            cy.get('#effort_table').should('be.visible').find('tr').find('td').each((element, index) => {
                switch (index) {
                    case 0:
                        expect(element.text()).to.match(/.+/)
                        break;
                    case 1:
                        expect(element.text()).to.match(/[a-zA-Z ]+ \d{2},\d{4}/)
                        break;
                    case 2:
                        expect(element.text()).to.match(/\d+:\d{2}\/km/)
                        break;
                    case 3:
                        expect(element.text()).to.match(/\d{2,3}/)
                        break;
                    case 4:
                        expect(element.text()).to.match(/\d+:\d{2}/)
                        break;
                }
            })
        })
        it('checks if the amount of attempts exists', () => {
            cy.get('#segment-leaderboard').find('table').eq(0).find('td').eq(2).then((element) => {
                expect(element.text()).to.match(/\d+ segment attempts  \d{1,3}%/)
            })
        })

            it('checks if my rank has been added', () => {
            cy.get('#RankElement').should('be.visible')
            cy.get('#RankElement').find('td').each((element, index) => {
                switch (index) {
                    case 0:
                        expect(element.text()).to.match(/\d+/)
                        break;
                    case 1:
                        expect(element.text()).to.match(/[a-zA-Z ]+/)
                        break;
                    case 2:
                        expect(element.text()).to.match(/[a-zA-Z ]+ \d{2},\d{4}/)
                        break;
                    case 3:
                        expect(element.text()).to.match(/\d+:\d{2}\/km/)
                        break;
                    case 4:
                        expect(element.text()).to.match(/\d{2,3}bpm/)
                        break;
                    case 5:
                        expect(element.text()).to.match(/\d+:\d{2}/)
                        break;
                }
            })
        })
    })
})