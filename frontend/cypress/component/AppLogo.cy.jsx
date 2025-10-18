import { AppLogo } from '../../components/AppLogo'

describe('AppLogo Component', () => {
  beforeEach(() => {
    // Mock Next.js Link component within the test context
    cy.stub(require('next/link'), 'default').callsFake(({ href, children, ...props }) => {
      return <a href={href} {...props}>{children}</a>
    })
    
    // Mock Lucide React icon
    cy.stub(require('lucide-react'), 'Dumbbell').returns(<div data-testid="dumbbell-icon" />)
    
    cy.mount(<AppLogo />)
  })

  it('should render the logo container', () => {
    cy.get('div').should('exist')
    cy.get('div').should('have.class', 'flex')
  })

  it('should render as a clickable link', () => {
    cy.get('a').should('exist')
    cy.get('a').should('have.attr', 'href', '/')
  })

  it('should display the FitNest text', () => {
    cy.contains('FitNest').should('be.visible')
  })

  it('should render the dumbbell icon (svg)', () => {
    // The Lucide icon renders as an SVG
    cy.get('svg').should('exist')
  })

  it('should have proper styling classes', () => {
    // Check that there is a div with flex classes
    cy.get('div.flex.items-center.space-x-2').should('exist')
  })
})