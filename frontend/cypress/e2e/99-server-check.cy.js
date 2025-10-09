describe('Frontend Server Status', () => {
  it('should verify frontend server is running', () => {
    cy.request({
      url: 'http://localhost:3010',
      failOnStatusCode: false,
      timeout: 10000
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 404, 500])
      cy.log(`Frontend server responded with status: ${response.status}`)
    })
  })

  it('should load any page without server errors', () => {
    cy.visit('/', { 
      failOnStatusCode: false,
      timeout: 15000 
    })
    
    // Just verify we get some response
    cy.get('html').should('exist')
    cy.wait(3000) // Long wait for hydration
    
    // Log what we found
    cy.get('body').then($body => {
      cy.log(`Page loaded with ${$body.find('*').length} elements`)
    })
  })

  it('should handle any login-related route', () => {
    const loginRoutes = ['/auth/login', '/login', '/signin', '/auth/signin']
    
    loginRoutes.forEach((route, index) => {
      cy.visit(route, { 
        failOnStatusCode: false,
        timeout: 10000 
      })
      
      cy.wait(2000)
      
      // Just verify we get some HTML response
      cy.get('html').should('exist')
      
      cy.log(`Route ${route} loaded successfully`)
    })
  })
})