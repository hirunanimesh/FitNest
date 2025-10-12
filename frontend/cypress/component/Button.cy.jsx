import { Button } from '../../components/ui/button'

describe('Button Component', () => {
  it('should render with default variant and size', () => {
    cy.mount(<Button>Default Button</Button>)
    
    // Check if button exists and has content
    cy.get('button').should('exist')
    cy.get('button').should('contain.text', 'Default Button')
    
    // Check default classes
    cy.get('button').should('have.class', 'inline-flex')
    cy.get('button').should('have.class', 'items-center')
    cy.get('button').should('have.class', 'justify-center')
    cy.get('button').should('have.class', 'rounded-md')
    cy.get('button').should('have.class', 'text-sm')
    cy.get('button').should('have.class', 'font-medium')
  })

  it('should apply different variants correctly', () => {
    // Test default variant
    cy.mount(<Button variant="default">Default</Button>)
    cy.get('button').should('have.class', 'bg-primary')
    cy.get('button').should('have.class', 'text-primary-foreground')
    
    // Test destructive variant
    cy.mount(<Button variant="destructive">Destructive</Button>)
    cy.get('button').should('have.class', 'bg-destructive')
    cy.get('button').should('have.class', 'text-destructive-foreground')
    
    // Test outline variant
    cy.mount(<Button variant="outline">Outline</Button>)
    cy.get('button').should('have.class', 'border')
    cy.get('button').should('have.class', 'border-input')
    cy.get('button').should('have.class', 'bg-background')
    
    // Test secondary variant
    cy.mount(<Button variant="secondary">Secondary</Button>)
    cy.get('button').should('have.class', 'bg-secondary')
    cy.get('button').should('have.class', 'text-secondary-foreground')
    
    // Test ghost variant
    cy.mount(<Button variant="ghost">Ghost</Button>)
    cy.get('button').should('have.class', 'hover:bg-accent')
    
    // Test link variant
    cy.mount(<Button variant="link">Link</Button>)
    cy.get('button').should('have.class', 'text-primary')
    cy.get('button').should('have.class', 'underline-offset-4')
  })

  it('should apply different sizes correctly', () => {
    // Test default size
    cy.mount(<Button size="default">Default Size</Button>)
    cy.get('button').should('have.class', 'h-10')
    cy.get('button').should('have.class', 'px-4')
    cy.get('button').should('have.class', 'py-2')
    
    // Test small size
    cy.mount(<Button size="sm">Small</Button>)
    cy.get('button').should('have.class', 'h-9')
    cy.get('button').should('have.class', 'px-3')
    
    // Test large size
    cy.mount(<Button size="lg">Large</Button>)
    cy.get('button').should('have.class', 'h-11')
    cy.get('button').should('have.class', 'px-8')
    
    // Test icon size
    cy.mount(<Button size="icon">🔥</Button>)
    cy.get('button').should('have.class', 'h-10')
    cy.get('button').should('have.class', 'w-10')
  })

  it('should handle click events', () => {
    const onClick = cy.stub()
    cy.mount(<Button onClick={onClick}>Clickable</Button>)
    
    cy.get('button').click()
    cy.then(() => {
      expect(onClick).to.have.been.called
    })
  })

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<Button disabled>Disabled Button</Button>)
    
    cy.get('button').should('be.disabled')
    cy.get('button').should('have.class', 'disabled:pointer-events-none')
    cy.get('button').should('have.class', 'disabled:opacity-50')
  })

  it('should apply custom className', () => {
    cy.mount(<Button className="custom-class">Custom Button</Button>)
    
    cy.get('button').should('have.class', 'custom-class')
    // Should still have base classes
    cy.get('button').should('have.class', 'inline-flex')
  })

  it('should render as child component when asChild is true', () => {
    cy.mount(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    // Should render as anchor tag, not button
    cy.get('a').should('exist')
    cy.get('a').should('contain.text', 'Link Button')
    cy.get('a').should('have.attr', 'href', '/test')
    
    // Should have button styling
    cy.get('a').should('have.class', 'inline-flex')
    cy.get('a').should('have.class', 'items-center')
  })

  it('should handle focus states correctly', () => {
    cy.mount(<Button>Focusable</Button>)
    
    cy.get('button').focus()
    cy.get('button').should('have.focus')
    
    // Should have focus-visible styles
    cy.get('button').should('have.class', 'focus-visible:outline-none')
    cy.get('button').should('have.class', 'focus-visible:ring-2')
  })

  it('should support different HTML button types', () => {
    cy.mount(<Button type="submit">Submit</Button>)
    cy.get('button').should('have.attr', 'type', 'submit')
    
    cy.mount(<Button type="reset">Reset</Button>)
    cy.get('button').should('have.attr', 'type', 'reset')
    
    cy.mount(<Button type="button">Button</Button>)
    cy.get('button').should('have.attr', 'type', 'button')
  })

  it('should render with icons and handle icon spacing', () => {
    cy.mount(
      <Button>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Item
      </Button>
    )
    
    cy.get('button').should('contain.text', 'Add Item')
    cy.get('svg').should('exist')
    
    // Check gap spacing
    cy.get('button').should('have.class', 'gap-2')
  })

  it('should have proper transition effects', () => {
    cy.mount(<Button>Transition Button</Button>)
    
    cy.get('button').should('have.class', 'transition-colors')
  })

  it('should be accessible', () => {
    cy.mount(<Button aria-label="Accessible button">♿</Button>)
    
    cy.get('button').should('have.attr', 'aria-label', 'Accessible button')
    cy.get('button').should('be.visible')
    
    // Should be keyboard accessible
    cy.get('button').should('not.have.attr', 'tabindex', '-1')
  })

  it('should render multiple buttons with different props', () => {
    cy.mount(
      <div>
        <Button variant="default" size="sm">Small Default</Button>
        <Button variant="outline" size="lg">Large Outline</Button>
        <Button variant="destructive" disabled>Disabled Destructive</Button>
      </div>
    )
    
    cy.get('button').should('have.length', 3)
    cy.contains('Small Default').should('exist')
    cy.contains('Large Outline').should('exist')
    cy.contains('Disabled Destructive').should('be.disabled')
  })

  it('should handle hover states', () => {
    cy.mount(<Button variant="default">Hover Me</Button>)
    
    cy.get('button').should('have.class', 'hover:bg-primary/90')
    
    // Test hover on different variants
    cy.mount(<Button variant="outline">Outline Hover</Button>)
    cy.get('button').should('have.class', 'hover:bg-accent')
  })
})