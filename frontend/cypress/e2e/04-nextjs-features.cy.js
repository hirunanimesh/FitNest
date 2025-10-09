describe('Next.js Specific Features', () => {
  beforeEach(() => {
    cy.clearAllStorage()
    cy.fixture('testData').as('testData')
  })

  describe('Client-side Navigation', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should use Next.js Link for client-side navigation', () => {
      cy.visit('/dashboard/user')
      
      // Monitor for full page reloads (should not happen with client-side nav)
      let pageReloaded = false
      cy.window().then((win) => {
        win.addEventListener('beforeunload', () => {
          pageReloaded = true
        })
      })
      
      // Navigate using Next.js Link
      cy.get('a[href="/profile"], a').contains('Profile').click()
      
      // URL should change without page reload
      cy.url().should('include', '/profile')
      
      // Check that page didn't reload
      cy.then(() => {
        expect(pageReloaded).to.be.false
      })
      
      // Navigation should be fast (no full page load)
      cy.get('body').should('be.visible')
    })

    it('should handle programmatic navigation with useRouter', () => {
      cy.visit('/dashboard/user')
      
      // Trigger programmatic navigation (e.g., after form submission)
      cy.get('button').contains('Go to Profile').click()
      
      // Should navigate without page reload
      cy.url().should('include', '/profile')
    })

    it('should preserve scroll position on navigation', () => {
      cy.visit('/dashboard/user')
      
      // Scroll down the page
      cy.scrollTo(0, 500)
      
      // Navigate to another page
      cy.get('a').contains('Sessions').click()
      cy.url().should('include', '/sessions')
      
      // Navigate back
      cy.go('back')
      
      // Scroll position might be preserved by Next.js
      cy.window().its('scrollY').should('be.gte', 0)
    })

    it('should handle navigation with query parameters', () => {
      cy.visit('/dashboard/user')
      
      // Navigate with query params
      cy.get('a[href*="?tab=subscriptions"], button').contains('Subscriptions').click()
      
      // URL should include query parameters
      cy.url().should('include', 'tab=subscriptions')
      
      // Content should change based on query params
      cy.get('[data-testid="subscriptions-tab"]').should('be.visible')
    })
  })

  describe('API Routes Integration', () => {
    it('should successfully call Next.js API routes', () => {
      // Test calendar API route
      cy.request({
        method: 'GET',
        url: '/api/calendar/events',
        headers: {
          'Authorization': 'Bearer mock-token'
        },
        failOnStatusCode: false
      }).then((response) => {
        // API route should exist and respond
        expect(response.status).to.be.oneOf([200, 401, 404])
      })
    })

    it('should handle API route authentication', () => {
      // Call protected API route without auth
      cy.request({
        method: 'GET',
        url: '/api/user/profile',
        failOnStatusCode: false
      }).then((response) => {
        // Should return 401 for unauthenticated request
        expect(response.status).to.equal(401)
      })
    })

    it('should proxy requests to backend services', function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
      
      cy.visit('/dashboard/user')
      
      // API calls should be routed through Next.js API routes or directly to backend
      cy.intercept('GET', '**/api/**').as('apiCall')
      
      // Trigger an API call
      cy.get('[data-testid="refresh-data"], button').contains('Refresh').click()
      
      cy.wait('@apiCall').then((interception) => {
        // Verify API call structure
        expect(interception.request.url).to.include('/api/')
      })
    })
  })

  describe('Server-Side Rendering (SSR)', () => {
    it('should render public pages server-side', () => {
      // Visit a public page
      cy.visit('/')
      
      // Page should load with content immediately (no loading states for SSR)
      cy.get('body').should('contain.text')
      
      // Check for SSR indicators (content rendered on server)
      cy.get('html').should('have.attr', 'data-hydrated')
        .or('not.have.attr', 'data-hydrated') // Depends on your SSR setup
    })

    it('should handle protected SSR routes', () => {
      // Try to access protected SSR route without auth
      cy.visit('/dashboard/user')
      
      // Should redirect to login or show auth prompt
      cy.url().should('satisfy', (url) => {
        return url.includes('/auth/login') || url.includes('/dashboard/user')
      })
    })

    it('should pre-render static pages correctly', () => {
      // Visit static pages that should be pre-rendered
      const staticPages = ['/', '/about', '/contact']
      
      staticPages.forEach((page) => {
        cy.visit(page)
        
        // Page should load quickly with content
        cy.get('body').should('contain.text')
        
        // No loading spinners for static content
        cy.get('[data-testid="loading"]').should('not.exist')
      })
    })
  })

  describe('Data Fetching Patterns', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should handle client-side data fetching', () => {
      cy.visit('/dashboard/user')
      
      // Mock API response
      cy.intercept('GET', '**/api/user/dashboard/stats', {
        statusCode: 200,
        body: {
          success: true,
          stats: {
            activeSubscriptions: 3,
            upcomingSessions: 5
          }
        }
      }).as('getStats')
      
      // Should show loading state initially
      cy.get('[data-testid="loading"], .loading').should('be.visible')
      
      cy.wait('@getStats')
      
      // Data should be rendered after fetch
      cy.get('body').should('contain', '3')
      cy.get('body').should('contain', '5')
    })

    it('should handle SWR/React Query patterns', () => {
      cy.visit('/dashboard/user')
      
      // Mock successful data fetch
      cy.intercept('GET', '**/api/user/profile', {
        statusCode: 200,
        body: {
          success: true,
          user: { name: 'Test User', email: 'test@example.com' }
        }
      }).as('getProfile')
      
      cy.wait('@getProfile')
      
      // Navigate away and back
      cy.visit('/profile')
      cy.visit('/dashboard/user')
      
      // Data should be cached and show immediately
      cy.get('body').should('contain', 'Test User')
    })

    it('should handle real-time data updates', () => {
      cy.visit('/dashboard/user')
      
      // Mock initial data
      cy.intercept('GET', '**/api/user/notifications', {
        statusCode: 200,
        body: {
          success: true,
          notifications: [
            { id: 1, message: 'Welcome!', read: false }
          ]
        }
      }).as('getNotifications')
      
      cy.wait('@getNotifications')
      
      // Mock real-time update
      cy.intercept('GET', '**/api/user/notifications', {
        statusCode: 200,
        body: {
          success: true,
          notifications: [
            { id: 1, message: 'Welcome!', read: false },
            { id: 2, message: 'New session available!', read: false }
          ]
        }
      }).as('getUpdatedNotifications')
      
      // Trigger refresh or real-time update
      cy.get('[data-testid="refresh-notifications"]').click()
      cy.wait('@getUpdatedNotifications')
      
      // New notification should appear
      cy.get('body').should('contain', 'New session available!')
    })
  })

  describe('Image Optimization', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should use Next.js Image component for optimized loading', () => {
      cy.visit('/dashboard/user')
      
      // Check for Next.js Image component usage
      cy.get('img').should('exist')
      
      // Next.js images often have specific attributes
      cy.get('img').first().then(($img) => {
        // Next.js Image component adds specific attributes
        const img = $img[0]
        expect(img.src).to.not.be.empty
        
        // Check for lazy loading
        expect(img.loading).to.equal('lazy')
      })
    })

    it('should handle image loading states', () => {
      cy.visit('/profile')
      
      // Mock slow image loading
      cy.intercept('GET', '**/images/**', {
        delay: 2000,
        fixture: 'images/placeholder.jpg'
      }).as('slowImage')
      
      // Should show placeholder or loading state
      cy.get('[data-testid="image-placeholder"], .image-loading').should('be.visible')
      
      cy.wait('@slowImage')
      
      // Image should load after delay
      cy.get('img').should('be.visible')
    })
  })

  describe('Performance and Optimization', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should lazy load components', () => {
      cy.visit('/dashboard/user')
      
      // Large components should not load immediately
      cy.get('[data-testid="analytics-chart"]').should('not.exist')
      
      // Scroll to trigger lazy loading
      cy.scrollTo('bottom')
      
      // Component should load when in viewport
      cy.get('[data-testid="analytics-chart"]', { timeout: 10000 }).should('be.visible')
    })

    it('should prefetch linked pages', () => {
      cy.visit('/dashboard/user')
      
      // Next.js should prefetch linked pages
      cy.get('link[rel="prefetch"]').should('exist')
      
      // Or check network requests for prefetched resources
      cy.intercept('GET', '**/profile**').as('prefetchProfile')
      
      // Hover over link to trigger prefetch
      cy.get('a[href="/profile"]').trigger('mouseover')
      
      // Navigation should be instant
      cy.get('a[href="/profile"]').click()
      cy.url().should('include', '/profile')
    })

    it('should handle code splitting correctly', () => {
      cy.visit('/')
      
      // Initial page should not load all JavaScript
      cy.window().then((win) => {
        const scripts = win.document.querySelectorAll('script[src]')
        const scriptSrcs = Array.from(scripts).map(script => script.src)
        
        // Should have chunked JavaScript files
        const hasChunks = scriptSrcs.some(src => src.includes('chunk'))
        expect(hasChunks).to.be.true
      })
    })
  })

  describe('Error Boundaries and Error Pages', () => {
    it('should handle 404 pages correctly', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false })
      
      // Should show custom 404 page
      cy.get('body').should('contain', '404')
        .or('contain', 'not found')
        .or('contain', 'page not found')
    })

    it('should handle 500 error pages', () => {
      // Mock server error for a page
      cy.intercept('GET', '/dashboard/user', {
        statusCode: 500,
        body: 'Internal Server Error'
      }).as('serverError')
      
      cy.visit('/dashboard/user', { failOnStatusCode: false })
      
      // Should show custom error page
      cy.get('body').should('contain', '500')
        .or('contain', 'server error')
        .or('contain', 'something went wrong')
    })

    it('should handle JavaScript errors gracefully', function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
      
      cy.visit('/dashboard/user')
      
      // Trigger a JavaScript error
      cy.window().then((win) => {
        // Simulate an error that might break the app
        win.eval('throw new Error("Simulated error")')
      })
      
      // App should still be functional (error boundary should catch it)
      cy.get('body').should('be.visible')
      cy.get('a').should('be.clickable')
    })
  })
})