describe('Authentication Flows', () => {
  beforeEach(() => {
    // Clear all storage before each test
    cy.clearAllStorage()
    // Load test data
    cy.fixture('testData').as('testData')
  })

  describe('User Login', () => {
    it('should successfully log in a customer and redirect to user dashboard', function() {
      const { customer } = this.testData.testUsers
      
      // Visit login page
      cy.visit('/auth/login')
      
      // Wait for page hydration to complete
      cy.get('body').should('be.visible')
      cy.wait(1500) // Allow hydration to complete
      
      // Verify login form is visible and interactive
      cy.get('input[name="email"], input[type="email"], [data-testid="email-input"]')
        .should('be.visible')
        .should('not.be.disabled')
      cy.get('input[name="password"], input[type="password"], [data-testid="password-input"]')
        .should('be.visible')
        .should('not.be.disabled')
      cy.get('button').contains('Sign In').should('be.visible').should('not.be.disabled')
      
      // Fill login form with error handling
      cy.get('input[name="email"], input[type="email"], [data-testid="email-input"]')
        .clear()
        .type(customer.email, { delay: 50 })
      cy.get('input[name="password"], input[type="password"], [data-testid="password-input"]')
        .clear()
        .type(customer.password, { delay: 50 })
      
      // Mock successful login API response
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          user: customer,
          token: 'mock-jwt-token'
        }
      }).as('loginRequest')
      
      // Submit login form
      cy.get('button').contains('Sign In').click()
      
      // Wait for login API call
      cy.wait('@loginRequest')
      
      // Verify redirect to customer dashboard
      cy.url().should('include', '/dashboard/user')
      
      // Verify dashboard content loads
      cy.get('body').should('contain', 'Dashboard') // Adjust based on actual dashboard content
    })

    it('should successfully log in a trainer and redirect to trainer dashboard', function() {
      const { trainer } = this.testData.testUsers
      
      cy.visit('/auth/login')
      
      // Wait for hydration
      cy.wait(1500)
      
      // Ensure elements are ready
      cy.get('input[name="email"], input[type="email"], [data-testid="email-input"]')
        .should('be.visible')
        .clear()
        .type(trainer.email, { delay: 50 })
      cy.get('input[name="password"], input[type="password"], [data-testid="password-input"]')
        .should('be.visible')
        .clear()
        .type(trainer.password, { delay: 50 })
      
      // Mock trainer login response
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          user: trainer,
          token: 'mock-jwt-token'
        }
      }).as('trainerLogin')
      
      cy.get('button').contains('Sign In').click()
      cy.wait('@trainerLogin')
      
      // Should redirect to trainer dashboard
      cy.url().should('include', '/dashboard/trainer')
    })

    it('should successfully log in a gym owner and redirect to gym dashboard', function() {
      const { gym } = this.testData.testUsers
      
      cy.visit('/auth/login')
      
      cy.get('input[name="email"]').type(gym.email)
      cy.get('input[name="password"]').type(gym.password)
      
      // Mock gym login response
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          user: gym,
          token: 'mock-jwt-token'
        }
      }).as('gymLogin')
      
      cy.get('button').contains('Sign In').click()
      cy.wait('@gymLogin')
      
      // Should redirect to gym dashboard
      cy.url().should('include', '/dashboard/gym')
    })

    it('should display error message for invalid credentials', () => {
      cy.visit('/auth/login')
      
      // Fill with invalid credentials
      cy.get('input[name="email"]').type('invalid@test.com')
      cy.get('input[name="password"]').type('wrongpassword')
      
      // Mock failed login response
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 401,
        body: {
          success: false,
          message: 'Invalid credentials'
        }
      }).as('failedLogin')
      
      cy.get('button').contains('Sign In').click()
      cy.wait('@failedLogin')
      
      // Should show error message
      cy.get('body').should('contain', 'Invalid credentials')
      
      // Should remain on login page
      cy.url().should('include', '/auth/login')
    })

    it('should handle Google OAuth login', () => {
      cy.visit('/auth/login')
      
      // Click Google login button
      cy.get('button').contains('Continue with Google').should('be.visible').click()
      
      // Note: In real tests, you might mock the OAuth flow
      // For now, we just verify the button is clickable and present
    })

    it('should validate required fields', () => {
      cy.visit('/auth/login')
      
      // Try to submit empty form
      cy.get('button').contains('Sign In').click()
      
      // Check HTML5 validation or custom validation messages
      cy.get('input[name="email"]:invalid').should('exist')
      cy.get('input[name="password"]:invalid').should('exist')
    })

    it('should remember me checkbox work', () => {
      cy.visit('/auth/login')
      
      // Check remember me option
      cy.get('input[type="checkbox"]').check()
      cy.get('input[type="checkbox"]').should('be.checked')
      
      // Uncheck
      cy.get('input[type="checkbox"]').uncheck()
      cy.get('input[type="checkbox"]').should('not.be.checked')
    })
  })

  describe('User Registration', () => {
    it('should allow customer registration', () => {
      cy.visit('/auth/signup')
      
      // Fill registration form
      const newCustomer = {
        firstName: 'New',
        lastName: 'Customer',
        email: 'newcustomer@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      }
      
      // Mock successful registration
      cy.intercept('POST', '**/api/auth/customer/register', {
        statusCode: 201,
        body: {
          success: true,
          message: 'Registration successful'
        }
      }).as('customerRegistration')
      
      // Fill form fields (adjust selectors based on actual form)
      Object.entries(newCustomer).forEach(([field, value]) => {
        cy.get(`input[name="${field}"]`).type(value)
      })
      
      cy.get('button[type="submit"]').click()
      cy.wait('@customerRegistration')
      
      // Should redirect or show success message
      cy.get('body').should('contain', 'Registration successful')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      // Try to access protected route without authentication
      cy.visit('/dashboard/user')
      
      // Should redirect to login
      cy.url().should('include', '/auth/login')
    })

    it('should prevent wrong role access', function() {
      const { customer } = this.testData.testUsers
      
      // Mock customer session
      cy.mockAuthSession(customer)
      
      // Try to access trainer dashboard as customer
      cy.visit('/dashboard/trainer')
      
      // Should redirect to appropriate dashboard or show error
      cy.url().should('not.include', '/dashboard/trainer')
    })
  })

  describe('Logout', () => {
    it('should successfully logout and redirect to login', function() {
      const { customer } = this.testData.testUsers
      
      // Login first
      cy.mockAuthSession(customer)
      cy.visit('/dashboard/user')
      
      // Find and click logout button (adjust selector based on actual implementation)
      cy.get('[data-testid="logout-button"], button').contains('Logout').click()
      
      // Should redirect to login or home
      cy.url().should('satisfy', (url) => {
        return url.includes('/auth/login') || url === Cypress.config().baseUrl + '/'
      })
      
      // Local storage should be cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('fitnes_session')).to.be.null
      })
    })
  })

  describe('Session Management', () => {
    it('should handle expired tokens', function() {
      const { customer } = this.testData.testUsers
      
      // Mock expired session
      cy.mockAuthSession({
        ...customer,
        expires_at: Date.now() - 1000 // Expired 1 second ago
      })
      
      // Visit protected page
      cy.visit('/dashboard/user')
      
      // Mock 401 response for expired token
      cy.intercept('GET', '**/api/**', {
        statusCode: 401,
        body: { message: 'Token expired' }
      })
      
      // Should redirect back to login
      cy.url().should('include', '/auth/login')
    })
  })
})