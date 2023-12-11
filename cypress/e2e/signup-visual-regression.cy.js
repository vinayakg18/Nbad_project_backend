
import 'cypress-image-snapshot';

describe('Signup Page Visual Regression Test', () => {
  it('should visually match the signup page', () => {
    cy.visit('http://localhost:3000/signup'); 

  
    cy.get('input[name="username"]').should('exist'); 

    
    cy.screenshot('signup-page');

    
    cy.get('input[name="username"]').type('testUser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('testPassword');
    cy.get('button[type="submit"]').click();

    
    cy.wait(2000); 

    
    cy.screenshot('signup-page-after-submit');

    
    cy.compareSnapshot('signup-page');
  });
});
