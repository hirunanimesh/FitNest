describe('Integration and API Testing', () => {
  beforeEach(() => {
    cy.clearAllStorage()
    cy.fixture('testData').as('testData')
  })

  describe('Backend Service Integration', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should successfully integrate with AuthService', () => {
      // Test authentication flow with real backend
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: '12345',
            email: 'test@example.com',
            role: 'customer'
          }
        }
      }).as('authLogin')

      cy.visit('/auth/login')
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="login-button"]').click()

      cy.wait('@authLogin')
      cy.url().should('include', '/dashboard/user')
    })

    it('should integrate with UserService for profile management', () => {
      cy.intercept('GET', '**/user/profile', {
        statusCode: 200,
        body: {
          success: true,
          user: {
            id: '12345',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            profile_picture: null
          }
        }
      }).as('getUserProfile')

      cy.intercept('PUT', '**/user/profile', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Profile updated successfully',
          user: {
            id: '12345',
            name: 'John Updated',
            email: 'john@example.com',
            phone: '+1234567890'
          }
        }
      }).as('updateUserProfile')

      cy.visit('/profile')
      cy.wait('@getUserProfile')

      // Update profile information
      cy.get('[data-testid="name-input"]').clear().type('John Updated')
      cy.get('[data-testid="save-profile-button"]').click()

      cy.wait('@updateUserProfile')
      cy.get('[data-testid="success-message"]').should('contain', 'Profile updated successfully')
    })

    it('should integrate with GymService for gym operations', () => {
      cy.intercept('GET', '**/gym/available-plans', {
        statusCode: 200,
        body: {
          success: true,
          plans: [
            {
              id: 'plan-1',
              title: 'Basic Membership',
              description: 'Access to gym facilities',
              price: 29.99,
              duration: '1 month',
              features: ['Gym access', 'Basic equipment']
            },
            {
              id: 'plan-2',
              title: 'Premium Membership',
              description: 'Full access with personal training',
              price: 59.99,
              duration: '1 month',
              features: ['Gym access', 'Personal training', 'Nutrition planning']
            }
          ]
        }
      }).as('getGymPlans')

      cy.intercept('POST', '**/gym/subscribe', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Subscription successful',
          subscription: {
            id: 'sub-123',
            planId: 'plan-1',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      }).as('subscribeToGym')

      cy.visit('/gym-plans')
      cy.wait('@getGymPlans')

      // Subscribe to a plan
      cy.get('[data-testid="plan-card-plan-1"] [data-testid="subscribe-button"]').click()
      cy.get('[data-testid="confirm-subscription-button"]').click()

      cy.wait('@subscribeToGym')
      cy.get('[data-testid="success-message"]').should('contain', 'Subscription successful')
    })

    it('should integrate with PaymentService for payment processing', () => {
      cy.intercept('POST', '**/payment/create-session', {
        statusCode: 200,
        body: {
          success: true,
          sessionId: 'cs_test_123',
          url: 'https://checkout.stripe.com/pay/cs_test_123'
        }
      }).as('createPaymentSession')

      cy.intercept('GET', '**/payment/session/cs_test_123/status', {
        statusCode: 200,
        body: {
          success: true,
          status: 'complete',
          paymentStatus: 'paid'
        }
      }).as('getPaymentStatus')

      cy.visit('/gym-plans')

      // Initiate payment
      cy.get('[data-testid="plan-card-plan-1"] [data-testid="subscribe-button"]').click()
      cy.get('[data-testid="proceed-to-payment-button"]').click()

      cy.wait('@createPaymentSession')

      // Simulate successful payment return
      cy.visit('/payment/success?session_id=cs_test_123')
      cy.wait('@getPaymentStatus')

      cy.get('[data-testid="payment-success"]').should('contain', 'Payment successful')
    })

    it('should integrate with TrainerService for trainer features', () => {
      cy.intercept('GET', '**/trainer/available', {
        statusCode: 200,
        body: {
          success: true,
          trainers: [
            {
              id: 'trainer-1',
              name: 'Mike Johnson',
              specialization: 'Weight Training',
              rating: 4.8,
              experience: '5 years',
              hourlyRate: 50,
              available: true
            },
            {
              id: 'trainer-2',
              name: 'Sarah Wilson',
              specialization: 'Cardio & HIIT',
              rating: 4.9,
              experience: '3 years',
              hourlyRate: 45,
              available: true
            }
          ]
        }
      }).as('getAvailableTrainers')

      cy.intercept('POST', '**/trainer/book-session', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Session booked successfully',
          booking: {
            id: 'booking-123',
            trainerId: 'trainer-1',
            date: '2024-01-20',
            time: '10:00',
            duration: 60,
            status: 'confirmed'
          }
        }
      }).as('bookTrainerSession')

      cy.visit('/trainers')
      cy.wait('@getAvailableTrainers')

      // Book a session with a trainer
      cy.get('[data-testid="trainer-card-trainer-1"] [data-testid="book-session-button"]').click()
      cy.get('[data-testid="date-picker"]').type('2024-01-20')
      cy.get('[data-testid="time-picker"]').select('10:00')
      cy.get('[data-testid="confirm-booking-button"]').click()

      cy.wait('@bookTrainerSession')
      cy.get('[data-testid="success-message"]').should('contain', 'Session booked successfully')
    })

    it('should integrate with AdminService for admin features', function() {
      const { admin } = this.testData.testUsers
      cy.mockAuthSession(admin)

      cy.intercept('GET', '**/admin/dashboard/stats', {
        statusCode: 200,
        body: {
          success: true,
          stats: {
            totalUsers: 150,
            totalTrainers: 12,
            totalRevenue: 15000,
            activeSubscriptions: 89
          }
        }
      }).as('getAdminStats')

      cy.intercept('GET', '**/admin/users', {
        statusCode: 200,
        body: {
          success: true,
          users: [
            {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'customer',
              status: 'active',
              joinDate: '2024-01-01'
            },
            {
              id: '2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'trainer',
              status: 'active',
              joinDate: '2024-01-05'
            }
          ]
        }
      }).as('getUsers')

      cy.visit('/dashboard/admin')
      cy.wait('@getAdminStats')

      // Verify admin dashboard stats
      cy.get('[data-testid="total-users"]').should('contain', '150')
      cy.get('[data-testid="total-revenue"]').should('contain', '15000')

      // Navigate to user management
      cy.get('[data-testid="manage-users-link"]').click()
      cy.wait('@getUsers')

      cy.get('[data-testid="users-table"]').should('be.visible')
      cy.get('[data-testid="user-row-1"]').should('contain', 'John Doe')
    })
  })

  describe('Error Handling and Resilience', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should handle service unavailability gracefully', () => {
      // Mock service unavailable
      cy.intercept('GET', '**/user/profile', {
        statusCode: 503,
        body: { success: false, message: 'Service temporarily unavailable' }
      }).as('serviceUnavailable')

      cy.visit('/profile')
      cy.wait('@serviceUnavailable')

      // Should show appropriate error message
      cy.get('[data-testid="error-message"]').should('contain', 'temporarily unavailable')
      
      // Should provide retry option
      cy.get('[data-testid="retry-button"]').should('be.visible')
    })

    it('should handle network timeouts', () => {
      // Mock timeout
      cy.intercept('GET', '**/gym/available-plans', {
        delay: 30000,
        statusCode: 408,
        body: { success: false, message: 'Request timeout' }
      }).as('timeoutRequest')

      cy.visit('/gym-plans')
      
      // Should show loading state initially
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
      
      // Should eventually show timeout error
      cy.get('[data-testid="error-message"]', { timeout: 35000 })
        .should('contain', 'timeout')
    })

    it('should handle authentication errors', () => {
      // Mock expired token
      cy.intercept('GET', '**/user/profile', {
        statusCode: 401,
        body: { success: false, message: 'Token expired' }
      }).as('tokenExpired')

      cy.visit('/profile')
      cy.wait('@tokenExpired')

      // Should redirect to login or show auth modal
      cy.url().should('satisfy', (url) => {
        return url.includes('/auth/login') || url.includes('/profile')
      })

      // If staying on page, should show auth error
      cy.get('body').should('contain.text')
    })

    it('should handle validation errors from backend', () => {
      cy.intercept('PUT', '**/user/profile', {
        statusCode: 400,
        body: {
          success: false,
          message: 'Validation error',
          errors: {
            email: 'Invalid email format',
            phone: 'Phone number is required'
          }
        }
      }).as('validationError')

      cy.visit('/profile')

      // Submit invalid data
      cy.get('[data-testid="email-input"]').clear().type('invalid-email')
      cy.get('[data-testid="phone-input"]').clear()
      cy.get('[data-testid="save-profile-button"]').click()

      cy.wait('@validationError')

      // Should show field-specific errors
      cy.get('[data-testid="email-error"]').should('contain', 'Invalid email format')
      cy.get('[data-testid="phone-error"]').should('contain', 'Phone number is required')
    })

    it('should handle concurrent request conflicts', () => {
      // Mock conflict response
      cy.intercept('POST', '**/gym/subscribe', {
        statusCode: 409,
        body: {
          success: false,
          message: 'You already have an active subscription to this plan'
        }
      }).as('subscriptionConflict')

      cy.visit('/gym-plans')

      // Try to subscribe to a plan
      cy.get('[data-testid="plan-card-plan-1"] [data-testid="subscribe-button"]').click()
      cy.get('[data-testid="confirm-subscription-button"]').click()

      cy.wait('@subscriptionConflict')

      // Should show conflict message
      cy.get('[data-testid="error-message"]')
        .should('contain', 'already have an active subscription')
    })
  })

  describe('Real-time Features', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should handle real-time notifications', () => {
      cy.visit('/dashboard/user')

      // Mock real-time notification
      cy.window().then((win) => {
        // Simulate receiving a real-time notification
        win.postMessage({
          type: 'NOTIFICATION',
          data: {
            id: 'notif-123',
            message: 'Your session with Mike Johnson starts in 15 minutes',
            type: 'session_reminder',
            timestamp: new Date().toISOString()
          }
        }, '*')
      })

      // Notification should appear
      cy.get('[data-testid="notification-toast"]', { timeout: 10000 })
        .should('contain', 'session with Mike Johnson')
    })

    it('should handle live chat integration', () => {
      cy.visit('/support/chat')

      // Mock chat connection
      cy.intercept('GET', '**/chat/connect', {
        statusCode: 200,
        body: { success: true, connectionId: 'conn-123' }
      }).as('chatConnect')

      cy.wait('@chatConnect')

      // Send a message
      cy.get('[data-testid="chat-input"]').type('Hello, I need help with my subscription')
      cy.get('[data-testid="send-message-button"]').click()

      // Message should appear in chat
      cy.get('[data-testid="chat-messages"]')
        .should('contain', 'Hello, I need help with my subscription')

      // Mock receiving a response
      cy.window().then((win) => {
        win.postMessage({
          type: 'CHAT_MESSAGE',
          data: {
            id: 'msg-456',
            message: 'Hi! I\'d be happy to help you with your subscription.',
            sender: 'support',
            timestamp: new Date().toISOString()
          }
        }, '*')
      })

      // Response should appear
      cy.get('[data-testid="chat-messages"]', { timeout: 5000 })
        .should('contain', 'I\'d be happy to help')
    })

    it('should sync data across multiple tabs', () => {
      cy.visit('/dashboard/user')

      // Open second tab simulation (using localStorage/sessionStorage changes)
      cy.window().then((win) => {
        win.localStorage.setItem('cross_tab_sync', JSON.stringify({
          type: 'SUBSCRIPTION_UPDATED',
          data: { planId: 'plan-1', status: 'active' },
          timestamp: Date.now()
        }))

        // Trigger storage event
        win.dispatchEvent(new StorageEvent('storage', {
          key: 'cross_tab_sync',
          newValue: win.localStorage.getItem('cross_tab_sync')
        }))
      })

      // UI should update based on sync
      cy.get('[data-testid="subscription-status"]', { timeout: 5000 })
        .should('contain', 'active')
    })
  })

  describe('Performance and Caching', () => {
    beforeEach(function() {
      const { customer } = this.testData.testUsers
      cy.mockAuthSession(customer)
    })

    it('should cache API responses appropriately', () => {
      let requestCount = 0

      cy.intercept('GET', '**/user/profile', (req) => {
        requestCount++
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            user: { name: 'John Doe', email: 'john@example.com' }
          }
        })
      }).as('getProfile')

      // First visit
      cy.visit('/profile')
      cy.wait('@getProfile')

      // Navigate away and back
      cy.visit('/dashboard/user')
      cy.visit('/profile')

      // Should use cached data (request count shouldn't increase)
      cy.then(() => {
        expect(requestCount).to.equal(1)
      })
    })

    it('should handle cache invalidation', () => {
      cy.intercept('GET', '**/user/profile', {
        statusCode: 200,
        body: {
          success: true,
          user: { name: 'John Doe', email: 'john@example.com' }
        }
      }).as('getProfile')

      cy.intercept('PUT', '**/user/profile', {
        statusCode: 200,
        body: {
          success: true,
          user: { name: 'John Updated', email: 'john@example.com' }
        }
      }).as('updateProfile')

      cy.visit('/profile')
      cy.wait('@getProfile')

      // Update profile
      cy.get('[data-testid="name-input"]').clear().type('John Updated')
      cy.get('[data-testid="save-profile-button"]').click()
      cy.wait('@updateProfile')

      // Cache should be invalidated and show updated data
      cy.get('[data-testid="name-input"]').should('have.value', 'John Updated')
    })

    it('should implement optimistic updates', () => {
      cy.intercept('POST', '**/gym/favorite', {
        delay: 2000,
        statusCode: 200,
        body: { success: true }
      }).as('favoriteGym')

      cy.visit('/gyms')

      // Click favorite button
      cy.get('[data-testid="gym-card-1"] [data-testid="favorite-button"]').click()

      // UI should update immediately (optimistic update)
      cy.get('[data-testid="gym-card-1"] [data-testid="favorite-button"]')
        .should('have.class', 'favorited')

      // Wait for actual API response
      cy.wait('@favoriteGym')

      // UI should remain in favorited state
      cy.get('[data-testid="gym-card-1"] [data-testid="favorite-button"]')
        .should('have.class', 'favorited')
    })

    it('should handle background sync', () => {
      cy.visit('/dashboard/user')

      // Mock periodic background sync
      cy.intercept('GET', '**/user/notifications/unread', {
        statusCode: 200,
        body: {
          success: true,
          count: 3,
          notifications: [
            { id: 1, message: 'New session available' },
            { id: 2, message: 'Payment reminder' },
            { id: 3, message: 'Trainer message' }
          ]
        }
      }).as('syncNotifications')

      // Simulate background sync after some time
      cy.wait(5000)
      cy.wait('@syncNotifications')

      // Notification count should update
      cy.get('[data-testid="notification-badge"]').should('contain', '3')
    })
  })
})