describe('Core App Workflows - Customer Journey', () => {
  beforeEach(() => {
    cy.clearAllStorage()
    cy.fixture('testData').as('testData')
  })

  describe('Gym Plan Subscription Flow', () => {
    beforeEach(function() {
      // Mock customer authentication
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should allow customer to browse and subscribe to gym plans', function() {
      const { gymPlans } = this.testData
      
      // Mock API calls for gym plans
      cy.intercept('GET', '**/api/gym/getallgymplans', {
        statusCode: 200,
        body: {
          success: true,
          gymPlans: gymPlans
        }
      }).as('getGymPlans')
      
      // Visit dashboard
      cy.visit('/dashboard/user')
      cy.wait('@getGymPlans')
      
      // Navigate to gym plans section (adjust based on your UI)
      cy.get('[data-testid="gym-plans-section"], [data-testid="subscriptions"]').should('be.visible')
      
      // Verify gym plans are displayed
      gymPlans.forEach((plan) => {
        cy.get('body').should('contain', plan.title)
        cy.get('body').should('contain', plan.description)
        cy.get('body').should('contain', `$${plan.price}`)
      })
      
      // Click subscribe on first plan
      cy.get('[data-testid="subscribe-button"], button').contains('Subscribe').first().click()
      
      // Mock Stripe checkout session creation
      cy.intercept('POST', '**/subscribe', {
        statusCode: 200,
        body: {
          url: 'https://checkout.stripe.com/mock-session'
        }
      }).as('createCheckoutSession')
      
      // Wait for checkout session creation
      cy.wait('@createCheckoutSession')
      
      // In real test, we'd mock the Stripe redirect
      // For now, verify the API call was made correctly
      cy.get('@createCheckoutSession').then((interception) => {
        expect(interception.request.body).to.have.property('planId')
        expect(interception.request.body).to.have.property('customer_id')
        expect(interception.request.body).to.have.property('email')
      })
    })

    it('should display subscription confirmation after successful payment', function() {
      const { customer } = this.testData.testUsers
      const { gymPlans } = this.testData
      
      // Mock active subscriptions
      cy.intercept('GET', '**/api/user/subscriptions/**', {
        statusCode: 200,
        body: {
          success: true,
          subscriptions: [
            {
              id: 'sub_123',
              plan: gymPlans[0],
              status: 'active',
              created_at: new Date().toISOString()
            }
          ]
        }
      }).as('getSubscriptions')
      
      cy.visit('/dashboard/user')
      cy.wait('@getSubscriptions')
      
      // Verify subscription is displayed
      cy.get('[data-testid="active-subscriptions"]').should('be.visible')
      cy.get('body').should('contain', gymPlans[0].title)
      cy.get('body').should('contain', 'Active')
    })

    it('should handle subscription errors gracefully', function() {
      const { gymPlans } = this.testData
      
      cy.visit('/dashboard/user')
      
      // Mock failed subscription
      cy.intercept('POST', '**/subscribe', {
        statusCode: 400,
        body: {
          error: 'Payment method required'
        }
      }).as('failedSubscription')
      
      // Try to subscribe
      cy.get('button').contains('Subscribe').first().click()
      cy.wait('@failedSubscription')
      
      // Should show error message
      cy.get('body').should('contain', 'Payment method required')
    })
  })

  describe('Training Session Booking', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should allow customer to book training sessions', function() {
      const { trainingSessions } = this.testData
      
      // Mock available sessions
      cy.intercept('GET', '**/api/trainer/sessions/available', {
        statusCode: 200,
        body: {
          success: true,
          sessions: trainingSessions
        }
      }).as('getAvailableSessions')
      
      cy.visit('/dashboard/user')
      
      // Navigate to sessions section
      cy.get('[data-testid="sessions-section"], [data-testid="book-session"]').click()
      cy.wait('@getAvailableSessions')
      
      // Verify sessions are displayed
      trainingSessions.forEach((session) => {
        cy.get('body').should('contain', session.trainer_name)
        cy.get('body').should('contain', session.date)
        cy.get('body').should('contain', session.time)
      })
      
      // Book first available session
      cy.get('[data-testid="book-session-button"], button').contains('Book').first().click()
      
      // Mock booking confirmation
      cy.intercept('POST', '**/api/sessions/book', {
        statusCode: 200,
        body: {
          success: true,
          booking: {
            id: 'booking_123',
            session_id: trainingSessions[0].id,
            status: 'confirmed'
          }
        }
      }).as('bookSession')
      
      // Confirm booking
      cy.get('button').contains('Confirm Booking').click()
      cy.wait('@bookSession')
      
      // Should show success message
      cy.get('body').should('contain', 'Session booked successfully')
    })

    it('should display booked sessions in upcoming sessions', function() {
      const { trainingSessions } = this.testData
      
      // Mock upcoming sessions
      cy.intercept('GET', '**/api/user/sessions/upcoming', {
        statusCode: 200,
        body: {
          success: true,
          sessions: [
            {
              ...trainingSessions[0],
              booking_id: 'booking_123',
              status: 'confirmed'
            }
          ]
        }
      }).as('getUpcomingSessions')
      
      cy.visit('/dashboard/user')
      cy.wait('@getUpcomingSessions')
      
      // Verify upcoming session is displayed
      cy.get('[data-testid="upcoming-sessions"]').should('be.visible')
      cy.get('body').should('contain', trainingSessions[0].trainer_name)
      cy.get('body').should('contain', 'Confirmed')
    })

    it('should allow session cancellation', function() {
      const { trainingSessions } = this.testData
      
      // Mock booked session
      cy.intercept('GET', '**/api/user/sessions/upcoming', {
        statusCode: 200,
        body: {
          success: true,
          sessions: [
            {
              ...trainingSessions[0],
              booking_id: 'booking_123',
              status: 'confirmed'
            }
          ]
        }
      }).as('getUpcomingSessions')
      
      cy.visit('/dashboard/user')
      cy.wait('@getUpcomingSessions')
      
      // Click cancel button
      cy.get('[data-testid="cancel-session"], button').contains('Cancel').click()
      
      // Mock cancellation
      cy.intercept('POST', '**/api/sessions/cancel', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Session cancelled successfully'
        }
      }).as('cancelSession')
      
      // Confirm cancellation
      cy.get('button').contains('Confirm Cancellation').click()
      cy.wait('@cancelSession')
      
      // Should show success message
      cy.get('body').should('contain', 'Session cancelled successfully')
    })
  })

  describe('Dashboard Stats and Data Display', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should display customer dashboard stats correctly', function() {
      const { dashboardStats } = this.testData
      const customerStats = dashboardStats.customer
      
      // Mock dashboard stats API
      cy.intercept('GET', '**/api/user/dashboard/stats', {
        statusCode: 200,
        body: {
          success: true,
          stats: customerStats
        }
      }).as('getDashboardStats')
      
      cy.visit('/dashboard/user')
      cy.wait('@getDashboardStats')
      
      // Verify stats are displayed
      cy.get('[data-testid="dashboard-stats"]').should('be.visible')
      cy.get('body').should('contain', customerStats.activeSubscriptions.toString())
      cy.get('body').should('contain', customerStats.upcomingSessions.toString())
      cy.get('body').should('contain', customerStats.streakDays.toString())
    })

    it('should display account balance correctly', function() {
      const { dashboardStats } = this.testData
      
      // Mock balance API
      cy.intercept('GET', '**/api/user/balance', {
        statusCode: 200,
        body: {
          success: true,
          balance: dashboardStats.customer.accountBalance
        }
      }).as('getBalance')
      
      cy.visit('/dashboard/user')
      cy.wait('@getBalance')
      
      // Verify balance is displayed
      cy.get('[data-testid="account-balance"]').should('contain', '$150.50')
    })

    it('should display subscription history', function() {
      const { gymPlans } = this.testData
      
      // Mock subscription history
      cy.intercept('GET', '**/api/user/subscriptions/history', {
        statusCode: 200,
        body: {
          success: true,
          subscriptions: [
            {
              id: 'sub_123',
              plan: gymPlans[0],
              status: 'active',
              created_at: '2025-09-01T10:00:00Z',
              expires_at: '2025-10-01T10:00:00Z'
            },
            {
              id: 'sub_124',
              plan: gymPlans[1],
              status: 'expired',
              created_at: '2025-08-01T10:00:00Z',
              expires_at: '2025-09-01T10:00:00Z'
            }
          ]
        }
      }).as('getSubscriptionHistory')
      
      cy.visit('/dashboard/user')
      
      // Navigate to subscription history
      cy.get('[data-testid="subscription-history"], a').contains('History').click()
      cy.wait('@getSubscriptionHistory')
      
      // Verify subscription history is displayed
      gymPlans.forEach((plan) => {
        cy.get('body').should('contain', plan.title)
      })
      
      cy.get('body').should('contain', 'Active')
      cy.get('body').should('contain', 'Expired')
    })
  })

  describe('Navigation and Page Routing', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should navigate between dashboard sections using Next.js Link', () => {
      cy.visit('/dashboard/user')
      
      // Test navigation to different sections
      const navLinks = [
        { selector: '[data-testid="nav-profile"]', url: '/profile', text: 'Profile' },
        { selector: '[data-testid="nav-sessions"]', url: '/sessions', text: 'Sessions' },
        { selector: '[data-testid="nav-subscriptions"]', url: '/subscriptions', text: 'Subscriptions' }
      ]
      
      navLinks.forEach(({ selector, url, text }) => {
        // Try to find navigation link by multiple possible selectors
        cy.get(`${selector}, a[href*="${url}"], a`).contains(text).click()
        cy.url().should('include', url)
        
        // Navigate back to dashboard
        cy.get('[data-testid="nav-dashboard"], a').contains('Dashboard').click()
        cy.url().should('include', '/dashboard/user')
      })
    })

    it('should handle browser back/forward navigation', () => {
      cy.visit('/dashboard/user')
      
      // Navigate to profile
      cy.get('a').contains('Profile').click()
      cy.url().should('include', '/profile')
      
      // Use browser back
      cy.go('back')
      cy.url().should('include', '/dashboard/user')
      
      // Use browser forward
      cy.go('forward')
      cy.url().should('include', '/profile')
    })

    it('should maintain authentication state across page navigation', function() {
      const { customer } = this.testData.testUsers
      
      cy.visit('/dashboard/user')
      
      // Navigate to different pages
      const pages = ['/profile', '/dashboard/user']
      
      pages.forEach((page) => {
        cy.visit(page)
        
        // Should not redirect to login
        cy.url().should('not.include', '/auth/login')
        
        // Should maintain user session
        cy.window().then((win) => {
          const session = win.localStorage.getItem('fitnes_session')
          expect(session).to.not.be.null
        })
      })
    })
  })
})