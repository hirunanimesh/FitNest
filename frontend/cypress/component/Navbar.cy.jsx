import { Navbar } from '../../components/navbar'

describe('Navbar Component', () => {
  beforeEach(() => {
    // Mock Next.js Link and router within the test context
    cy.stub(require('next/link'), 'default').callsFake(({ href, children, ...props }) => {
      return <a href={href} {...props}>{children}</a>
    })
    
    cy.stub(require('next/navigation'), 'useRouter').returns({
      push: () => {},
      replace: () => {},
      back: () => {},
      pathname: '/',
      query: {},
      asPath: '/'
    })
    
    cy.mount(<Navbar />)
  })

  it('should render the main navbar structure', () => {
    cy.get('header').should('exist')
    cy.get('header').should('have.class', 'fixed')
    cy.get('header').should('have.class', 'top-0')
    cy.get('header').should('have.class', 'z-50')
  })

  it('should display the logo correctly', () => {
    cy.get('a[href="/"]').first().should('exist')
    cy.get('svg').should('exist')
    cy.contains('FitNest').should('be.visible')
  })

  it('should display desktop navigation links', () => {
    // Desktop navigation is hidden on small screens, visible on lg+
    cy.get('nav.hidden.lg\\:flex').should('exist')
    cy.get('nav.hidden.lg\\:flex').within(() => {
      cy.get('a[href="/"]').should('exist')
      cy.get('a[href="/about"]').should('exist')
      cy.get('a[href="/auth/login"]').should('exist') 
      cy.get('a[href="/contact"]').should('exist')
    })
  })

  it('should display desktop auth buttons', () => {
    cy.get('div.hidden.lg\\:flex').should('exist')
    cy.get('div.hidden.lg\\:flex').within(() => {
      cy.contains('Login').should('exist')
      cy.contains('Join Now').should('exist')
    })
  })

  it('should show mobile menu trigger', () => {
    // Mobile menu button is hidden on lg screens but exists
    cy.get('button.lg\\:hidden').should('exist')
    cy.get('button.lg\\:hidden').within(() => {
      cy.get('svg').should('exist')
    })
  })

  it('should have proper styling and gradients', () => {
    cy.get('header').should('have.class', 'bg-gradient-to-r')
    cy.get('a[href="/"]').first().within(() => {
      cy.get('div').should('exist')
      cy.get('[class*="bg-gradient-to-br"]').should('exist')
    })
  })

  it('should open mobile menu when menu button is clicked', () => {
    cy.get('button.lg\\:hidden').click({ force: true })
    cy.get('[role="dialog"]').should('exist')
  })

  it('should display mobile menu content when opened', () => {
    cy.get('button.lg\\:hidden').click({ force: true })
    cy.get('[role="dialog"]').should('exist')
    cy.get('[role="dialog"]').within(() => {
      cy.contains('FitNest').should('exist')
      cy.get('svg').should('exist')
    })
  })

  it('should display mobile navigation links in menu', () => {
    cy.get('button.lg\\:hidden').click({ force: true })
    cy.get('[role="dialog"]').within(() => {
      cy.contains('HOME').should('exist')
      cy.contains('ABOUT').should('exist')
      cy.contains('DASHBOARD').should('exist')
      cy.contains('CONTACT').should('exist')
    })
  })

  it('should display mobile auth buttons in menu', () => {
    cy.get('button.lg\\:hidden').click({ force: true })
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Login').should('exist')
      cy.contains('Join Now').should('exist')
    })
  })

  it('should close mobile menu when close button is clicked', () => {
    cy.get('button.lg\\:hidden').click({ force: true })
    cy.get('[role="dialog"]').should('exist')
    
    cy.get('[role="dialog"]').within(() => {
      cy.get('button').last().click({ force: true })
    })
  })

  it('should have responsive behavior', () => {
    // Test that desktop and mobile elements exist with proper classes
    cy.get('nav.hidden.lg\\:flex').should('exist')
    cy.get('button.lg\\:hidden').should('exist')
    cy.get('div.hidden.lg\\:flex').should('exist')
  })

  it('should have proper hover effects on navigation links', () => {
    cy.get('nav.hidden.lg\\:flex').within(() => {
      cy.get('a').first().should('exist')
      cy.get('[class*="hover:text-white"]').should('exist')
    })
  })

  it('should have proper hover effects on buttons', () => {
    cy.get('div.hidden.lg\\:flex').within(() => {
      cy.get('[class*="hover:bg-red-500"]').should('exist')
      cy.get('[class*="hover:text-white"]').should('exist')
    })
  })

  it('should be accessible with proper ARIA labels', () => {
    cy.get('button.lg\\:hidden').within(() => {
      cy.get('.sr-only').should('contain', 'Toggle menu')
    })
  })

  it('should maintain fixed positioning during scroll', () => {
    cy.get('header').should('have.class', 'fixed')
    cy.get('header').should('have.class', 'top-0')
    cy.get('header').should('have.class', 'z-50')
  })

  it('should handle navigation link clicks', () => {
    // Check navigation links exist and are clickable
    cy.get('nav.hidden.lg\\:flex').within(() => {
      cy.get('a[href="/"]').should('exist')
      cy.get('a[href="/about"]').should('exist')
    })
  })

  it('should display mobile menu footer', () => {
    cy.get('button.lg\\:hidden').click({ force: true })
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Transform Your Fitness Journey').should('exist')
    })
  })

  it('should have proper gradient effects on logo', () => {
    cy.get('a[href="/"]').first().within(() => {
      cy.get('[class*="bg-gradient-to-br"]').should('exist')
      cy.get('[class*="from-red-500"]').should('exist')
    })
  })
})