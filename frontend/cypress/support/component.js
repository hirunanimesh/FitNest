// ***********************************************************
// This example support/component.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax for component testing:
import './commands'

// Import Cypress React Testing Library commands
import '@testing-library/cypress/add-commands'

// Mount React components
import { mount } from '@cypress/react18'

// Add mount command to Cypress
Cypress.Commands.add('mount', mount)

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  // for uncaught exceptions during component testing
  console.log('Uncaught exception:', err.message)
  return false
})