describe('Form Validation and Error Handling', () => {
  beforeEach(() => {
    cy.clearAllStorage()
    cy.fixture('testData').as('testData')
  })

  describe('Login Form Validation', () => {
    beforeEach(() => {
      cy.visit('/auth/login')
    })

    it('should validate required email field', () => {
      // Try to submit form without email
      cy.get('input[name="password"]').type('somepassword')
      cy.get('button').contains('Sign In').click()
      
      // Should show HTML5 validation or custom error
      cy.get('input[name="email"]:invalid').should('exist')
    })

    it('should validate email format', () => {
      // Enter invalid email format
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('input[name="password"]').type('password123')
      cy.get('button').contains('Sign In').click()
      
      // Should show email format validation error
      cy.get('input[name="email"]:invalid').should('exist')
    })

    it('should validate required password field', () => {
      // Try to submit form without password
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('button').contains('Sign In').click()
      
      // Should show password validation error
      cy.get('input[name="password"]:invalid').should('exist')
    })

    it('should display backend error messages correctly', () => {
      // Fill form with valid format but wrong credentials
      cy.get('input[name="email"]').type('wrong@example.com')
      cy.get('input[name="password"]').type('wrongpassword')
      
      // Mock backend error response
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 401,
        body: {
          success: false,
          message: 'Invalid email or password'
        }
      }).as('loginError')
      
      cy.get('button').contains('Sign In').click()
      cy.wait('@loginError')
      
      // Should display backend error message
      cy.get('[data-testid="error-message"], .error, .alert').should('contain', 'Invalid email or password')
    })

    it('should handle network errors gracefully', () => {
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      
      // Mock network error
      cy.intercept('POST', '**/api/auth/login', {
        forceNetworkError: true
      }).as('networkError')
      
      cy.get('button').contains('Sign In').click()
      cy.wait('@networkError')
      
      // Should display network error message
      cy.get('body').should('contain', 'network')
        .or('contain', 'connection')
        .or('contain', 'error')
    })

    it('should clear error messages when user starts typing', () => {
      // First trigger an error
      cy.get('input[name="email"]').type('wrong@example.com')
      cy.get('input[name="password"]').type('wrongpassword')
      
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' }
      }).as('loginError')
      
      cy.get('button').contains('Sign In').click()
      cy.wait('@loginError')
      
      // Error should be visible
      cy.get('body').should('contain', 'Invalid credentials')
      
      // Start typing in email field
      cy.get('input[name="email"]').clear().type('new@example.com')
      
      // Error should disappear or be less prominent
      cy.get('body').should('not.contain', 'Invalid credentials')
    })
  })

  describe('Registration Form Validation', () => {
    beforeEach(() => {
      cy.visit('/auth/signup')
    })

    it('should validate all required fields', () => {
      // Try to submit empty form
      cy.get('button[type="submit"]').click()
      
      // Check that required fields show validation errors
      const requiredFields = ['firstName', 'lastName', 'email', 'password']
      requiredFields.forEach(field => {
        cy.get(`input[name="${field}"]:invalid`).should('exist')
      })
    })

    it('should validate password strength', () => {
      const testCases = [
        { password: '123', error: 'too short' },
        { password: 'password', error: 'uppercase' },
        { password: 'PASSWORD', error: 'lowercase' },
        { password: 'Password', error: 'number' },
        { password: 'Password123', success: true }
      ]
      
      testCases.forEach(({ password, error, success }) => {
        cy.get('input[name="password"]').clear().type(password)
        cy.get('input[name="confirmPassword"]').clear().type(password)
        
        if (success) {
          // Should not show password strength error
          cy.get('body').should('not.contain', 'weak').and('not.contain', 'strength')
        } else {
          // Should show password strength feedback
          cy.get('body').should('contain', error).or('contain', 'strength').or('contain', 'requirements')
        }
      })
    })

    it('should validate password confirmation match', () => {
      cy.get('input[name="password"]').type('Password123!')
      cy.get('input[name="confirmPassword"]').type('Password456!')
      
      // Try to submit or blur field
      cy.get('input[name="confirmPassword"]').blur()
      
      // Should show password mismatch error
      cy.get('body').should('contain', 'match').or('contain', 'same')
    })

    it('should handle registration errors from backend', () => {
      // Fill form with valid data
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      }
      
      Object.entries(userData).forEach(([field, value]) => {
        cy.get(`input[name="${field}"]`).type(value)
      })
      
      // Mock backend error (e.g., email already exists)
      cy.intercept('POST', '**/api/auth/customer/register', {
        statusCode: 400,
        body: {
          success: false,
          message: 'Email already exists',
          code: 'EMAIL_EXISTS'
        }
      }).as('registrationError')
      
      cy.get('button[type="submit"]').click()
      cy.wait('@registrationError')
      
      // Should display backend error
      cy.get('body').should('contain', 'Email already exists')
    })
  })

  describe('Profile Update Form Validation', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
      cy.visit('/profile')
    })

    it('should validate phone number format', () => {
      const invalidPhoneNumbers = ['123', 'abc', '123-abc-7890']
      
      invalidPhoneNumbers.forEach(phone => {
        cy.get('input[name="phone"], input[name="phoneNumber"]').clear().type(phone)
        cy.get('button[type="submit"]').click()
        
        // Should show phone validation error
        cy.get('body').should('contain', 'phone').or('contain', 'invalid').or('contain', 'format')
      })
    })

    it('should validate date of birth', () => {
      // Try future date
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const futureDateString = futureDate.toISOString().split('T')[0]
      
      cy.get('input[name="dateOfBirth"], input[type="date"]').clear().type(futureDateString)
      cy.get('button[type="submit"]').click()
      
      // Should show date validation error
      cy.get('body').should('contain', 'birth').or('contain', 'future').or('contain', 'invalid')
    })

    it('should handle file upload validation', () => {
      // Try to upload non-image file
      cy.fixture('testData.json').then(fileContent => {
        const blob = new Blob([JSON.stringify(fileContent)], { type: 'application/json' })
        const file = new File([blob], 'test.json', { type: 'application/json' })
        
        cy.get('input[type="file"]').then(input => {
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          input[0].files = dataTransfer.files
          
          // Trigger change event
          cy.wrap(input).trigger('change', { force: true })
        })
        
        cy.get('button[type="submit"]').click()
        
        // Should show file type validation error
        cy.get('body').should('contain', 'image').or('contain', 'file type').or('contain', 'invalid')
      })
    })
  })

  describe('Session Booking Form Validation', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
      cy.visit('/dashboard/user')
    })

    it('should validate session date selection', () => {
      // Mock available sessions
      cy.intercept('GET', '**/api/trainer/sessions/available', {
        statusCode: 200,
        body: { success: true, sessions: [] }
      }).as('getSessions')
      
      // Navigate to booking form
      cy.get('[data-testid="book-session"], button').contains('Book').click()
      
      // Try to select past date
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const pastDateString = pastDate.toISOString().split('T')[0]
      
      cy.get('input[type="date"]').type(pastDateString)
      cy.get('button[type="submit"]').click()
      
      // Should show date validation error
      cy.get('body').should('contain', 'past').or('contain', 'invalid').or('contain', 'date')
    })

    it('should validate required session fields', () => {
      // Navigate to booking form
      cy.get('[data-testid="book-session"], button').contains('Book').click()
      
      // Try to submit without required fields
      cy.get('button[type="submit"]').click()
      
      // Should show validation errors for required fields
      cy.get('body').should('contain', 'required').or('contain', 'select').or('contain', 'choose')
    })
  })

  describe('API Error Handling', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should handle 500 server errors gracefully', () => {
      cy.visit('/dashboard/user')
      
      // Mock server error
      cy.intercept('GET', '**/api/user/dashboard/stats', {
        statusCode: 500,
        body: { message: 'Internal server error' }
      }).as('serverError')
      
      cy.wait('@serverError')
      
      // Should show user-friendly error message
      cy.get('body').should('contain', 'something went wrong')
        .or('contain', 'server error')
        .or('contain', 'try again')
    })

    it('should handle 404 not found errors', () => {
      cy.visit('/dashboard/user')
      
      // Mock 404 error
      cy.intercept('GET', '**/api/user/profile', {
        statusCode: 404,
        body: { message: 'User not found' }
      }).as('notFoundError')
      
      // Navigate to profile
      cy.get('a').contains('Profile').click()
      cy.wait('@notFoundError')
      
      // Should show appropriate not found message
      cy.get('body').should('contain', 'not found').or('contain', '404')
    })

    it('should handle timeout errors', () => {
      cy.visit('/dashboard/user')
      
      // Mock timeout
      cy.intercept('GET', '**/api/user/dashboard/stats', {
        delay: 20000, // Long delay to simulate timeout
        statusCode: 200,
        body: { success: true }
      }).as('timeoutRequest')
      
      // Should show loading state initially
      cy.get('[data-testid="loading"], .loading, .spinner').should('be.visible')
      
      // After timeout, should show error message
      cy.get('body', { timeout: 25000 }).should('contain', 'timeout')
        .or('contain', 'slow')
        .or('contain', 'taking longer')
    })

    it('should retry failed requests', () => {
      cy.visit('/dashboard/user')
      
      let requestCount = 0
      cy.intercept('GET', '**/api/user/dashboard/stats', (req) => {
        requestCount++
        if (requestCount < 3) {
          req.reply({ statusCode: 500, body: { error: 'Server error' } })
        } else {
          req.reply({ statusCode: 200, body: { success: true, stats: {} } })
        }
      }).as('retryRequest')
      
      // Should eventually succeed after retries
      cy.get('body').should('not.contain', 'error')
    })
  })

  describe('Loading States and User Feedback', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should show loading states during API calls', () => {
      cy.visit('/dashboard/user')
      
      // Mock slow API response
      cy.intercept('GET', '**/api/user/dashboard/stats', {
        delay: 2000,
        statusCode: 200,
        body: { success: true, stats: {} }
      }).as('slowRequest')
      
      // Should show loading indicator
      cy.get('[data-testid="loading"], .loading, .spinner, [class*="loading"]').should('be.visible')
      
      cy.wait('@slowRequest')
      
      // Loading should disappear after request completes
      cy.get('[data-testid="loading"], .loading, .spinner').should('not.exist')
    })

    it('should disable buttons during form submission', () => {
      cy.visit('/auth/login')
      
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password123')
      
      // Mock slow login response
      cy.intercept('POST', '**/api/auth/login', {
        delay: 2000,
        statusCode: 200,
        body: { success: true }
      }).as('slowLogin')
      
      cy.get('button').contains('Sign In').click()
      
      // Button should be disabled during request
      cy.get('button').contains('Sign In').should('be.disabled')
        .or('have.attr', 'disabled')
        .or('have.class', 'disabled')
    })

    it('should show success messages for successful operations', () => {
      cy.visit('/profile')
      
      // Fill and submit profile form
      cy.get('input[name="firstName"]').clear().type('Updated Name')
      
      // Mock successful update
      cy.intercept('PATCH', '**/api/user/updateuserdetails/**', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Profile updated successfully'
        }
      }).as('updateProfile')
      
      cy.get('button[type="submit"]').click()
      cy.wait('@updateProfile')
      
      // Should show success message
      cy.get('body').should('contain', 'updated successfully')
        .or('contain', 'saved')
        .or('contain', 'success')
    })
  })
})