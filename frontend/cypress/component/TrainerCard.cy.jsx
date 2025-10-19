import TrainerCard from '../../components/TrainerCard'

describe('TrainerCard Component', () => {
  const mockTrainer = {
    id: 1,
    trainer_name: 'John Doe',
    profile_img: 'https://example.com/profile.jpg',
    expertise: 'Weight Training',
    contact_no: '+1234567890',
    years_of_experience: 5,
    rating: 4.8,
    bio: 'Experienced trainer specializing in weight training and fitness coaching.',
    email: 'john@example.com',
    skills: ['Strength Training', 'Cardio', 'Nutrition']
  }

  beforeEach(() => {
    // Mock Next.js Link component within the test context
    cy.stub(require('next/link'), 'default').callsFake(({ href, children, ...props }) => {
      return <a href={href} {...props}>{children}</a>
    })
    
    cy.mount(<TrainerCard trainer={mockTrainer} />)
  })

  it('should render trainer information correctly', () => {
    // Check trainer name
    cy.get('h3').should('contain.text', 'John Doe')
    
    // Check expertise badge content
    cy.contains('Weight Training').should('exist')
    
    // Check years of experience
    cy.contains('Experience: 5 years').should('exist')
    
    // Check rating
    cy.contains('4.8').should('exist')
    
    // Check bio
    cy.contains('Experienced trainer specializing').should('exist')
  })

  it('should have proper card structure and styling', () => {
    // Check main card container with specific classes
    cy.get('[class*="bg-white/5"]').should('exist')
    cy.get('[class*="backdrop-blur-sm"]').should('exist')
    cy.get('[class*="border-white/10"]').should('exist')
    cy.get('[class*="hover:border-red-500/20"]').should('exist')
  })

  it('should display profile image with gradient overlay', () => {
    // Check background div with background image style
    cy.get('[class*="bg-cover"]').should('exist')
    cy.get('[class*="bg-center"]').should('exist')
    
    // Check gradient overlay
    cy.get('[class*="bg-gradient-to-t"]').should('exist')
    cy.get('[class*="from-slate-900/80"]').should('exist')
  })

  it('should use fallback image when profile_img is null', () => {
    const trainerWithoutImage = {
      ...mockTrainer,
      profile_img: null
    }
    
    cy.mount(<TrainerCard trainer={trainerWithoutImage} />)
    
    // Component should still render with fallback
    cy.get('h3').should('contain.text', 'John Doe')
    cy.get('[class*="bg-cover"]').should('exist')
  })

  it('should handle rating correctly', () => {
    // Test with valid rating - should show the actual rating
    cy.contains('4.8').should('exist')
    
    // Test with null rating - should default to 4.5
    const trainerWithNullRating = { ...mockTrainer, rating: null }
    cy.mount(<TrainerCard trainer={trainerWithNullRating} />)
    cy.contains('4.5').should('exist')
  })

  it('should display star icon with rating', () => {
    // Check for star icon
    cy.get('svg').should('exist')
    cy.get('[class*="text-yellow-400"]').should('exist')
    cy.get('[class*="fill-yellow-400"]').should('exist')
  })

  it('should handle missing contact information', () => {
    const trainerWithoutContact = {
      ...mockTrainer,
      contact_no: null
    }
    
    cy.mount(<TrainerCard trainer={trainerWithoutContact} />)
    
    // Component should still render properly
    cy.get('h3').should('contain.text', 'John Doe')
    cy.contains('Weight Training').should('exist')
    // Contact info should not be displayed
    cy.contains('Contact:').should('not.exist')
  })

  it('should handle missing bio', () => {
    const trainerWithoutBio = {
      ...mockTrainer,
      bio: null
    }
    
    cy.mount(<TrainerCard trainer={trainerWithoutBio} />)
    
    // Should show default bio text
    cy.contains('No bio available.').should('exist')
    cy.get('h3').should('contain.text', 'John Doe')
  })

  it('should have proper hover effects on text elements', () => {
    // Check hover effect classes exist
    cy.get('[class*="group-hover:text-red-100"]').should('exist')
    cy.get('[class*="transition-colors"]').should('exist')
  })

  it('should display expertise badge with proper styling', () => {
    // Check expertise badge with gradient styling
    cy.contains('Weight Training').should('exist')
    cy.get('[class*="bg-gradient-to-r"]').should('exist')
    cy.get('[class*="from-purple-500"]').should('exist')
    cy.get('[class*="to-indigo-600"]').should('exist')
  })

  it('should be clickable and navigate correctly', () => {
    // Check if card is wrapped in a link with correct href
    cy.get('a').should('exist')
    cy.get('a').should('have.attr', 'href', '/profile/trainer?id=1')
  })

  it('should truncate long trainer names', () => {
    const trainerWithLongName = {
      ...mockTrainer,
      trainer_name: 'This is a very long trainer name that should be truncated properly'
    }
    
    cy.mount(<TrainerCard trainer={trainerWithLongName} />)
    
    // Check that name is rendered and has truncation classes
    cy.get('h3').should('exist')
    cy.get('[class*="truncate"]').should('exist')
  })

  it('should limit bio text with line clamp', () => {
    const trainerWithLongBio = {
      ...mockTrainer,
      bio: 'This is a very long bio that should be clamped to a specific number of lines. '.repeat(10)
    }
    
    cy.mount(<TrainerCard trainer={trainerWithLongBio} />)
    
    // Check bio exists and has line clamp
    cy.get('p').should('exist')
    cy.get('[class*="line-clamp-2"]').should('exist')
  })

  it('should be responsive across different screen sizes', () => {
    // Test component structure exists
    cy.get('h3').should('exist')
    cy.get('[class*="bg-cover"]').should('exist')
    cy.contains('Weight Training').should('exist')
    
    // Check responsive classes exist
    cy.get('[class*="max-w-sm"]').should('exist')
  })

  it('should have proper accessibility features', () => {
    // Check main link has proper structure
    cy.get('a').should('exist')
    
    // Check heading hierarchy
    cy.get('h3').should('exist')
    
    // Check that interactive elements are properly structured
    cy.get('[class*="cursor-pointer"]').should('exist')
  })

  it('should display contact information when available', () => {
    // Check contact info is displayed
    cy.contains('Contact: +1234567890').should('exist')
    cy.get('[class*="text-center"]').should('exist')
  })
})