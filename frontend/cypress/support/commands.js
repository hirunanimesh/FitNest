// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands for FitNest testing

/**
 * Login command - performs authentication and waits for redirect
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} expectedRole - Expected user role (customer, trainer, gym, admin)
 */
Cypress.Commands.add('login', (email, password, expectedRole = 'customer') => {
  cy.visit('/auth/login')
  
  // Wait for page to load
  cy.get('[data-testid="login-form"]', { timeout: 10000 }).should('be.visible')
  
  // Fill login form
  cy.get('input[name="email"]').clear().type(email)
  cy.get('input[name="password"]').clear().type(password)
  
  // Intercept login API call
  cy.intercept('POST', '**/api/auth/login').as('loginAPI')
  
  // Submit form
  cy.get('button[type="submit"]').click()
  
  // Wait for API response
  cy.wait('@loginAPI').then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201])
  })
  
  // Verify redirect to correct dashboard based on role
  const dashboardRoutes = {
    customer: '/dashboard/user',
    trainer: '/dashboard/trainer', 
    gym: '/dashboard/gym',
    admin: '/dashboard/admin'
  }
  
  cy.url().should('include', dashboardRoutes[expectedRole])
  cy.get('[data-testid="dashboard-header"]', { timeout: 10000 }).should('be.visible')
})

/**
 * Logout command - performs logout and verifies redirect
 */
Cypress.Commands.add('logout', () => {
  // Click logout button (assuming it exists in header/sidebar)
  cy.get('[data-testid="logout-button"]').click()
  
  // Verify redirect to home/login
  cy.url().should('satisfy', (url) => {
    return url.includes('/auth/login') || url === Cypress.config().baseUrl + '/'
  })
})

/**
 * Mock successful login session in localStorage
 * @param {object} userData - Mock user data
 */
Cypress.Commands.add('mockAuthSession', (userData = {}) => {
  const defaultUserData = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'customer',
    name: 'Test User',
    ...userData
  }
  
  // Mock Supabase session
  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: {
      id: defaultUserData.id,
      email: defaultUserData.email,
      user_metadata: {
        role: defaultUserData.role,
        name: defaultUserData.name
      }
    }
  }
  
  // Set session in localStorage
  cy.window().then((win) => {
    win.localStorage.setItem('fitnes_session', JSON.stringify(mockSession))
    win.localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession))
  })
})

/**
 * Wait for API loading states to complete
 */
Cypress.Commands.add('waitForApiLoading', () => {
  // Wait for loading spinners to disappear
  cy.get('[data-testid="loading-spinner"]').should('not.exist')
  cy.get('.animate-spin').should('not.exist')
})

/**
 * Check API error handling
 * @param {string} selector - Element selector that should show error
 * @param {string} expectedErrorText - Expected error message (optional)
 */
Cypress.Commands.add('checkApiError', (selector, expectedErrorText) => {
  cy.get(selector).should('be.visible')
  if (expectedErrorText) {
    cy.get(selector).should('contain.text', expectedErrorText)
  }
})

/**
 * Navigate using Next.js Link and verify URL change
 * @param {string} linkSelector - Selector for the link element
 * @param {string} expectedUrl - Expected URL after navigation
 */
Cypress.Commands.add('navigateWithLink', (linkSelector, expectedUrl) => {
  cy.get(linkSelector).click()
  cy.url().should('include', expectedUrl)
})

/**
 * Fill form fields from object
 * @param {object} formData - Object with field names as keys and values
 */
Cypress.Commands.add('fillForm', (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    if (value !== null && value !== undefined) {
      cy.get(`[name="${field}"], [data-testid="${field}"]`).clear().type(String(value))
    }
  })
})

/**
 * Verify table data
 * @param {string} tableSelector - Selector for table element
 * @param {array} expectedData - Array of objects representing expected table rows
 */
Cypress.Commands.add('verifyTableData', (tableSelector, expectedData) => {
  cy.get(tableSelector).should('be.visible')
  
  expectedData.forEach((rowData, index) => {
    const rowSelector = `${tableSelector} tbody tr:nth-child(${index + 1})`
    cy.get(rowSelector).should('be.visible')
    
    Object.values(rowData).forEach((cellValue) => {
      if (cellValue) {
        cy.get(rowSelector).should('contain.text', String(cellValue))
      }
    })
  })
})

/**
 * Intercept and mock API responses
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint pattern
 * @param {object} mockResponse - Mock response data
 * @param {string} alias - Alias for the intercept
 */
Cypress.Commands.add('mockApiResponse', (method, endpoint, mockResponse, alias) => {
  cy.intercept(method, `**${endpoint}`, mockResponse).as(alias)
})

/**
 * Test form validation
 * @param {object} invalidData - Object with invalid form data
 * @param {array} expectedErrors - Array of expected error messages
 */
Cypress.Commands.add('testFormValidation', (invalidData, expectedErrors) => {
  cy.fillForm(invalidData)
  cy.get('button[type="submit"]').click()
  
  expectedErrors.forEach((errorMsg) => {
    cy.contains(errorMsg).should('be.visible')
  })
})

/**
 * Clear all browser storage
 */
Cypress.Commands.add('clearAllStorage', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
  cy.window().then((win) => {
    win.sessionStorage.clear()
  })
})

/**
 * Custom command to visit a page and wait for Next.js hydration to complete
 * @param {string} url - The URL to visit
 * @param {object} options - Cypress visit options
 */
Cypress.Commands.add('visitAndWaitForHydration', (url, options = {}) => {
  cy.visit(url, options)
  
  // Wait for the page to be visible
  cy.get('body').should('be.visible')
  
  // Wait for hydration to complete - this helps with Next.js SSR
  cy.wait(1500)
  
  // Ensure React has finished hydrating
  cy.get('body').should('not.have.class', 'loading')
  
  // Additional wait for any async operations to complete
  cy.wait(500)
})

/**
 * Custom command to safely interact with form inputs after hydration
 * @param {string} selector - The input selector
 * @param {string} value - The value to type
 */
Cypress.Commands.add('safeType', (selector, value) => {
  // Wait for element to be ready and not disabled
  cy.get(selector, { timeout: 15000 })
    .should('be.visible')
    .should('not.be.disabled')
    .wait(500) // Extra wait for stability
    .clear({ force: true })
    .type(value, { delay: 100, force: true })
})

/**
 * Custom command to handle hydration-safe login
 * @param {string} email - User email
 * @param {string} password - User password
 */
Cypress.Commands.add('hydrationSafeLogin', (email, password) => {
  cy.visitAndWaitForHydration('/auth/login')
  
  // Wait for form elements to be ready
  cy.get('input[name="email"], input[type="email"], [data-testid="email-input"]')
    .should('be.visible')
    .should('not.be.disabled')
  
  // Fill form with safe typing
  cy.safeType('input[name="email"], input[type="email"], [data-testid="email-input"]', email)
  cy.safeType('input[name="password"], input[type="password"], [data-testid="password-input"]', password)
  
  // Wait a moment before submitting
  cy.wait(500)
})