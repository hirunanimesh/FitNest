import { AuthCheck } from '../../components/AuthCheck'
import React from 'react'

describe('AuthCheck Component', () => {
  beforeEach(() => {
    // Mock Next.js router
    cy.stub(require('next/navigation'), 'useRouter').returns({
      push: cy.stub(),
      replace: cy.stub(),
      back: cy.stub(),
      pathname: '/',
      query: {},
      asPath: '/'
    })
  })

  it('should render when properly mocked', () => {
    // Mock the useAuth hook at the module level
    cy.stub(require('@/contexts/AuthContext'), 'useAuth').callsFake(() => ({
      user: null,
      userRole: null,
      loading: false,
      signOut: () => {},
      refreshUserRole: () => {},
      getUserProfileId: () => {}
    }))

    cy.mount(
      <AuthCheck>
        <div data-testid="content">Test Content</div>
      </AuthCheck>
    )

    cy.get('[data-testid="content"]').should('exist')
    cy.get('[data-testid="content"]').should('contain', 'Test Content')
  })

  it('should show loading state', () => {
    // Mock loading state
    cy.stub(require('@/contexts/AuthContext'), 'useAuth').callsFake(() => ({
      user: null,
      userRole: null,
      loading: true,
      signOut: () => {},
      refreshUserRole: () => {},
      getUserProfileId: () => {}
    }))

    cy.mount(
      <AuthCheck>
        <div data-testid="content">Test Content</div>
      </AuthCheck>
    )

    // Should show loading elements
    cy.get('.animate-spin').should('exist')
    cy.contains('Loading...').should('exist')
    cy.get('[data-testid="content"]').should('not.exist')
  })
})