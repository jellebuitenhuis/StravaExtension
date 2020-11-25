/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    on('before:browser:launch', (browser, launchOptions) => {
        launchOptions.extensions.push('C:\\Users\\Jelle\\Projects\\StravaRanksGood')

        return launchOptions
    })
    on('task', {
        getRunOverview()  {
            return require('fs').readFileSync(require('path').resolve(__dirname, '../fixtures/RunTestOverview.html'), 'utf8')
        },
        getRunSegment()  {
            return require('fs').readFileSync(require('path').resolve(__dirname, '../fixtures/RunTestSegment.html'), 'utf8')
        },
        getBikeOverview()  {
            return require('fs').readFileSync(require('path').resolve(__dirname, '../fixtures/BikeTestOverview.html'), 'utf8')
        },
        getBikeSegment()  {
            return require('fs').readFileSync(require('path').resolve(__dirname, '../fixtures/BikeTestSegment.html'), 'utf8')
        },
    })
}