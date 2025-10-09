const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3010',
    setupNodeEvents(on, config) {
      // Node event listeners for build-time events
      // Note: uncaught:exception is handled in support/e2e.js
      
      // You can add other valid node events here like:
      // on('task', {
      //   // custom tasks
      // })
      
      // on('before:browser:launch', (browser, launchOptions) => {
      //   // browser launch configuration
      // })
    },
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshot: false,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 15000,
    requestTimeout: 20000,
    responseTimeout: 20000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 1
    },
    env: {
      API_GATEWAY_URL: 'http://localhost:3000',
      SUPABASE_URL: 'https://cvmxfwmcaxmqnhmsxicu.supabase.co'
    }
  },
})