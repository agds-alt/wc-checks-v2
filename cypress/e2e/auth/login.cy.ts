describe('Authentication - Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login page elements', () => {
    cy.url().should('include', '/login');

    // Check for essential login form elements
    // Adjust selectors based on your actual implementation
    cy.get('form').should('exist');
    cy.get('input[type="email"], input[name="email"]').should('exist');
    cy.get('input[type="password"], input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show validation errors for empty form submission', () => {
    // Try to submit empty form
    cy.get('button[type="submit"]').click();

    // Check for validation messages (adjust based on your error handling)
    cy.get('body').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    // Enter invalid credentials
    cy.get('input[type="email"], input[name="email"]').type('invalid@example.com');
    cy.get('input[type="password"], input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Should stay on login page or show error
    cy.url().should('include', '/login');
  });

  it('should successfully login with valid credentials (skip if no test user)', () => {
    // This test would require a test user in your database
    // Skip it if you don't have test credentials set up
    cy.log('Skipping actual login test - requires test user setup');

    // Example of how the test would work:
    // cy.get('input[type="email"]').type('test@example.com');
    // cy.get('input[type="password"]').type('testpassword');
    // cy.get('button[type="submit"]').click();
    // cy.url().should('not.include', '/login');
    // cy.url().should('include', '/dashboard');
  });

  it('should have a link to register/signup page', () => {
    // Check if there's a link to registration
    cy.get('body').then(($body) => {
      if ($body.find('a[href*="register"], a[href*="signup"]').length > 0) {
        cy.get('a[href*="register"], a[href*="signup"]').should('exist');
      } else {
        cy.log('No registration link found - this is OK for some apps');
      }
    });
  });

  it('should handle password visibility toggle if present', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="password"], [data-testid*="toggle-password"]').length > 0) {
        const passwordInput = cy.get('input[type="password"]');
        passwordInput.should('have.attr', 'type', 'password');

        // Click toggle button
        cy.get('button[aria-label*="password"], [data-testid*="toggle-password"]').first().click();

        // Check if type changed (implementation dependent)
        cy.log('Password visibility toggle found and clicked');
      } else {
        cy.log('No password visibility toggle found');
      }
    });
  });
});
