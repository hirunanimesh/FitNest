import StatCard from '../../components/statCard'
import { Users, DollarSign, TrendingUp } from 'lucide-react'

describe('StatCard Component', () => {
  const mockProps = {
    title: 'Total Users',
    value: 1250,
    icon: Users,
    iconColor: 'text-blue-500'
  }

  beforeEach(() => {
    cy.mount(<StatCard {...mockProps} />)
  })

  it('should render with correct content', () => {
    // Check if title is displayed
    cy.get('p').first().should('contain.text', 'Total Users')
    
    // Check if value is displayed and formatted correctly
    cy.get('p').eq(1).should('contain.text', '1,250')
    
    // Check if icon is rendered (svg element)
    cy.get('svg').should('exist')
  })

  it('should have proper card structure', () => {
    // Check if card wrapper exists
    cy.get('[class*="rounded-lg"]').should('exist')
    
    // Check card content area
    cy.get('[class*="p-6"]').should('exist')
    
    // Check flex layout for content
    cy.get('[class*="flex items-center justify-between"]').should('exist')
  })

  it('should apply correct styling classes', () => {
    // Check card hover effects
    cy.get('[class*="group"]').should('exist')
    cy.get('[class*="transition-all"]').should('exist')
    cy.get('[class*="hover:-translate-y-3"]').should('exist')
    
    // Check background and backdrop blur
    cy.get('[class*="bg-white/5"]').should('exist')
    cy.get('[class*="backdrop-blur-sm"]').should('exist')
    
    // Check border styling
    cy.get('[class*="border-white/10"]').should('exist')
  })

  it('should format large numbers correctly', () => {
    const largeNumberProps = {
      title: 'Revenue',
      value: 1234567,
      icon: DollarSign,
      iconColor: 'text-green-500'
    }
    
    cy.mount(<StatCard {...largeNumberProps} />)
    cy.get('p').eq(1).should('contain.text', '1,234,567')
  })

  it('should handle zero values', () => {
    const zeroProps = {
      title: 'New Signups',
      value: 0,
      icon: TrendingUp,
      iconColor: 'text-red-500'
    }
    
    cy.mount(<StatCard {...zeroProps} />)
    cy.get('p').eq(1).should('contain.text', '0')
  })

  it('should render with different icons and colors', () => {
    const differentProps = {
      title: 'Monthly Revenue',
      value: 50000,
      icon: DollarSign,
      iconColor: 'text-green-600'
    }
    
    cy.mount(<StatCard {...differentProps} />)
    
    // Check if different icon is rendered (svg element)
    cy.get('svg').should('exist')
    
    // Check if icon has correct color class
    cy.get('svg').should('have.class', 'text-green-600')
  })

  it('should have proper text hierarchy', () => {
    // Title should be smaller and less prominent
    cy.get('p').first().should('have.class', 'text-sm')
    cy.get('p').first().should('have.class', 'text-gray-300')
    
    // Value should be larger and more prominent
    cy.get('p').eq(1).should('have.class', 'text-2xl')
    cy.get('p').eq(1).should('have.class', 'text-white')
    cy.get('p').eq(1).should('have.class', 'font-bold')
  })

  it('should have hover effects', () => {
    // Check gradient overlay on hover
    cy.get('[class*="bg-gradient-to-br from-red-600 to-rose-500"]').should('exist')
    cy.get('[class*="opacity-0 group-hover:opacity-20"]').should('exist')
    
    // Check text color changes on hover
    cy.get('[class*="group-hover:text-red-100"]').should('exist')
  })

  it('should be responsive', () => {
    // Test on mobile
    cy.viewport(375, 667)
    cy.get('[class*="rounded-lg"]').should('be.visible')
    cy.get('p').first().should('be.visible')
    cy.get('p').eq(1).should('be.visible')
    
    // Test on tablet
    cy.viewport(768, 1024)
    cy.get('[class*="rounded-lg"]').should('be.visible')
    
    // Test on desktop
    cy.viewport(1920, 1080)
    cy.get('[class*="rounded-lg"]').should('be.visible')
  })

  it('should handle missing iconColor prop gracefully', () => {
    const propsWithoutColor = {
      title: 'Test Stat',
      value: 100,
      icon: Users
      // iconColor is undefined
    }
    
    cy.mount(<StatCard {...propsWithoutColor} />)
    
    // Should still render without errors
    cy.get('p').first().should('contain.text', 'Test Stat')
    cy.get('svg').should('exist')
  })
})