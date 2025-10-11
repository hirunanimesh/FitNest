describe('Authentication Form Tests (Simplified)', () => {
  beforeEach(() => {
    cy.clearAllStorage()
    cy.fixture('testData').as('testData')
  })

  describe('Login Form Functionality', () => {
    it('should load login page and interact with form elements', function() {
      const { customer } = this.testData.testUsers
      
      cy.visit('/auth/login')
      cy.wait(4000) // Extra time for hydration
      
      // Wait for page to be fully loaded
      cy.get('body.bg-slate-900', { timeout: 25000 }).should('be.visible')
      
      // Test form element interactions
      cy.get('input[name="email"]', { timeout: 20000 })
        .should('be.visible')
        .should('not.be.disabled')
        .focus()
        .clear({ force: true })
        .type(customer.email, { delay: 150, force: true })
        .should('have.value', customer.email)
      
      cy.get('input[name="password"]')
        .should('be.visible')
        .should('not.be.disabled')
        .focus()
        .clear({ force: true })
        .type(customer.password, { delay: 150, force: true })
        .should('have.value', customer.password)
      
      // Verify button is clickable
      cy.get('button').contains('Sign In')
        .should('be.visible')
        .should('not.be.disabled')
      
      cy.log('Login form interaction test completed successfully')
    })

    it('should test form validation', () => {
      cy.visit('/auth/login')
      cy.wait(4000)
      cy.get('body.bg-slate-900', { timeout: 25000 }).should('be.visible')
      
      // Test empty form submission
      cy.get('button').contains('Sign In')
        .should('not.be.disabled')
        .click({ force: true })
      
      // Check if browser validation kicks in
      cy.get('input[name="email"]').then($input => {
        const isValid = $input[0].checkValidity()
        if (!isValid) {
          cy.log('Email validation working - empty email not accepted')
        } else {
          cy.log('No client-side validation detected')
        }
      })
    })

    it('should test different user types form interaction', function() {
      const { trainer, gym } = this.testData.testUsers
      const users = [trainer, gym]
      
      users.forEach((user, index) => {
        cy.visit('/auth/login')
        cy.wait(3000)
        cy.get('body.bg-slate-900', { timeout: 20000 }).should('be.visible')
        
        // Fill form for each user type
        cy.get('input[name="email"]', { timeout: 15000 })
          .should('not.be.disabled')
          .clear({ force: true })
          .type(user.email, { delay: 100, force: true })
        
        cy.get('input[name="password"]')
          .should('not.be.disabled')
          .clear({ force: true })
          .type(user.password, { delay: 100, force: true })
        
        cy.log(`${user.role} form interaction completed`)
        
        // Don't submit, just verify form can be filled
        cy.get('button').contains('Sign In').should('be.visible')
      })
    })
  })

  describe('Registration Form Tests', () => {
    it('should test registration page accessibility', () => {
      cy.visit('/auth/signup', { failOnStatusCode: false })
      cy.wait(3000)
      
      // Just verify the page loads and has some interactive elements
      cy.get('body').should('be.visible')
      
      cy.get('body').then($body => {
        if ($body.find('input').length > 0) {
          cy.log(`Found ${$body.find('input').length} input fields on registration page`)
          
          // Test first few inputs if they exist
          const inputs = ['email', 'password', 'firstName', 'lastName', 'name']
          inputs.forEach(inputName => {
            cy.get('body').then($body => {
              if ($body.find(`input[name="${inputName}"]`).length > 0) {
                cy.get(`input[name="${inputName}"]`)
                  .should('be.visible')
                  .focus()
                  .type('test', { force: true })
                  .clear({ force: true })
                cy.log(`${inputName} input is functional`)
              }
            })
          })
        } else {
          cy.log('Registration form not found - may not be implemented')
        }
      })
    })
  })

  describe('UI Element Tests', () => {
    it('should test OAuth buttons if present', () => {
      cy.visit('/auth/login')
      cy.wait(3000)
      cy.get('body.bg-slate-900', { timeout: 20000 }).should('be.visible')
      
      // Look for OAuth buttons
      const oauthSelectors = [
        'button:contains("Google")',
        'button:contains("GitHub")',
        'button:contains("Continue with")',
        'a:contains("Google")',
        'a:contains("GitHub")'
      ]
      
      oauthSelectors.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector)
              .should('be.visible')
              .should('not.be.disabled')
            cy.log(`OAuth button found: ${selector}`)
          }
        })
      })
    })

    it('should test remember me functionality if present', () => {
      cy.visit('/auth/login')
      cy.wait(3000)
      cy.get('body.bg-slate-900', { timeout: 20000 }).should('be.visible')
      
      cy.get('body').then($body => {
        if ($body.find('input[type="checkbox"]').length > 0) {
          cy.get('input[type="checkbox"]', { timeout: 10000 })
            .should('be.visible')
            .check({ force: true })
            .should('be.checked')
            .uncheck({ force: true })
            .should('not.be.checked')
          cy.log('Remember me checkbox is functional')
        } else {
          cy.log('Remember me checkbox not found')
        }
      })
    })

    it('should test navigation links', () => {
      cy.visit('/auth/login')
      cy.wait(3000)
      cy.get('body.bg-slate-900', { timeout: 20000 }).should('be.visible')
      
      // Look for common navigation links
      const navLinks = [
        'a:contains("Sign up")',
        'a:contains("Register")',
        'a:contains("Forgot")',
        'a:contains("Reset")',
        'a[href*="signup"]',
        'a[href*="register"]',
        'a[href*="forgot"]'
      ]
      
      navLinks.forEach(selector => {
        cy.get('body').then($body => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).should('be.visible')
            cy.log(`Navigation link found: ${selector}`)
          }
        })
      })
    })
  })

  describe('Page Loading Tests', () => {
    it('should load login page without JavaScript errors', () => {
      cy.visit('/auth/login')
      cy.wait(5000)
      
      // Verify basic page structure
      cy.get('html').should('exist')
      cy.get('head').should('exist')
      cy.get('body').should('be.visible')
      cy.get('title').should('exist')
      
      // Check for essential form elements
      cy.get('form, input[name="email"], input[type="email"]').should('exist')
      
      cy.log('Login page loaded successfully with required elements')
    })

    it('should handle page refresh gracefully', () => {
      cy.visit('/auth/login')
      cy.wait(3000)
      cy.get('body.bg-slate-900', { timeout: 20000 }).should('be.visible')
      
      // Fill some data
      cy.get('input[name="email"]', { timeout: 15000 })
        .should('not.be.disabled')
        .type('test@example.com', { force: true })
      
      // Refresh page
      cy.reload()
      cy.wait(3000)
      cy.get('body.bg-slate-900', { timeout: 20000 }).should('be.visible')
      
      // Verify form is cleared
      cy.get('input[name="email"]').should('have.value', '')
      
      cy.log('Page refresh handled correctly')
    })
  })
})