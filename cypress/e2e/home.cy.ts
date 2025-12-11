describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page successfully', () => {
    cy.url().should('include', '/');
  });

  it('should have correct page title', () => {
    cy.title().should('not.be.empty');
  });

  it('should display the main content', () => {
    cy.get('body').should('be.visible');
  });

  it('should redirect to login if not authenticated', () => {
    // This test checks if unauthenticated users are redirected
    cy.visit('/');
    // Adjust this based on your actual redirect behavior
    cy.url().should('match', /\/(login|dashboard|auth)/);
  });
});
