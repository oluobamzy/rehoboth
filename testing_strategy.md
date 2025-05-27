# Rehoboth Christian Church Website - Testing Strategy

## Testing Philosophy
This document outlines our comprehensive testing strategy for the Rehoboth Christian Church website. We follow the testing pyramid approach with a strong foundation of unit tests, complemented by integration tests, and capped with end-to-end tests. This ensures optimal test coverage while maintaining efficient test execution.

## Testing Levels

### 1. Unit Tests
- **Purpose**: Test individual components, functions, and modules in isolation
- **Coverage Target**: 80% code coverage
- **Tools**: Jest, React Testing Library
- **Run Frequency**: On every code change, pre-commit, CI pipeline

#### Unit Testing Scope
- **Components**: Visual rendering, prop handling, state changes
- **Hooks**: State management, side effects, cleanup
- **Utilities**: Pure function behavior, edge cases
- **Form Validation**: Input validation rules, error messaging
- **API Clients**: Request formatting, response parsing (with mocks)

#### Examples
```typescript
// Component test
test('DonationAmountSelector shows correct preset amounts', () => {
  render(<DonationAmountSelector presets={[10, 20, 50, 100]} />);
  expect(screen.getByText('$10')).toBeInTheDocument();
  expect(screen.getByText('$20')).toBeInTheDocument();
  expect(screen.getByText('$50')).toBeInTheDocument();
  expect(screen.getByText('$100')).toBeInTheDocument();
});

// Hook test
test('useCarousel advances to next slide after delay', async () => {
  const { result } = renderHook(() => 
    useCarousel(['slide1', 'slide2', 'slide3'], 100)
  );
  
  expect(result.current.currentSlide).toBe('slide1');
  await waitFor(() => expect(result.current.currentSlide).toBe('slide2'));
});

// Utility test
test('formatCurrency formats USD correctly', () => {
  expect(formatCurrency(1000, 'USD')).toBe('$10.00');
  expect(formatCurrency(1050, 'USD')).toBe('$10.50');
  expect(formatCurrency(0, 'USD')).toBe('$0.00');
});
```

### 2. Integration Tests
- **Purpose**: Test interactions between components and external systems
- **Coverage Target**: Critical user flows and data operations
- **Tools**: Jest, React Testing Library, MSW (Mock Service Worker), Supabase Testing
- **Run Frequency**: Daily, on feature completion, pre-deployment

#### Integration Testing Scope
- **Component Compositions**: Parent-child interactions, context providers
- **API Integration**: Real API calls (against test environment)
- **Form Submissions**: Complete form flows with validation and submission
- **Authentication Flows**: Login, logout, protected routes
- **Database Operations**: CRUD operations via Prisma client

#### Examples
```typescript
// API integration test
test('fetchSermons returns formatted sermon data', async () => {
  // Setup MSW to intercept API calls with mock data
  server.use(
    rest.get('/api/sermons', (req, res, ctx) => {
      return res(ctx.json({
        data: [{ id: '1', title: 'Test Sermon', /* ... */ }],
        meta: { total: 1 }
      }));
    }),
  );
  
  const result = await fetchSermons({ page: 1, limit: 10 });
  expect(result.data).toHaveLength(1);
  expect(result.data[0].title).toBe('Test Sermon');
  expect(result.meta.total).toBe(1);
});

// Form submission test
test('DonationForm submits correct data', async () => {
  const mockSubmit = jest.fn();
  render(<DonationForm onSubmit={mockSubmit} />);
  
  // Fill out the form
  userEvent.type(screen.getByLabelText(/amount/i), '50');
  userEvent.selectOptions(screen.getByLabelText(/fund/i), ['general']);
  userEvent.type(screen.getByLabelText(/email/i), 'donor@example.com');
  
  // Submit the form
  userEvent.click(screen.getByText(/donate now/i));
  
  // Verify submission
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      amount: 5000, // in cents
      designation: 'general',
      donorEmail: 'donor@example.com'
    });
  });
});
```

### 3. End-to-End Tests
- **Purpose**: Test complete user flows across the entire application
- **Coverage Target**: All critical user journeys
- **Tools**: Cypress, Playwright
- **Run Frequency**: Nightly, pre-release, post-deployment

#### E2E Testing Scope
- **User Journeys**: Complete flows from landing to goal completion
- **Cross-Browser Testing**: Chrome, Firefox, Safari, Edge
- **Responsive Testing**: Mobile, tablet, desktop viewport sizes
- **Payment Flows**: Complete donation processes (using Stripe test mode)
- **Admin Workflows**: Content creation, user management

#### Examples
```typescript
// Cypress test for donation flow
describe('Donation Flow', () => {
  it('completes a one-time donation successfully', () => {
    cy.visit('/donate');
    cy.get('[data-testid=amount-input]').type('25');
    cy.get('[data-testid=designation-select]').select('missions');
    
    cy.get('[data-testid=donor-form]').within(() => {
      cy.get('[name=firstName]').type('Test');
      cy.get('[name=lastName]').type('Donor');
      cy.get('[name=email]').type('test@example.com');
    });
    
    // Use Stripe test card
    cy.get('iframe[name*="__privateStripeFrame"]').then($iframe => {
      const $body = $iframe.contents().find('body');
      cy.wrap($body)
        .find('input[name="cardnumber"]')
        .type('4242424242424242');
      cy.wrap($body)
        .find('input[name="exp-date"]')
        .type('1230');
      cy.wrap($body)
        .find('input[name="cvc"]')
        .type('123');
    });
    
    cy.get('[data-testid=donate-button]').click();
    
    // Verify success state
    cy.get('[data-testid=donation-success]').should('be.visible');
    cy.get('[data-testid=receipt-number]').should('exist');
  });
});
```

### 4. Performance Testing
- **Purpose**: Ensure optimal application performance and responsiveness
- **Coverage Target**: Key pages and critical user interactions
- **Tools**: Lighthouse, WebPageTest, Next.js Analytics
- **Run Frequency**: Weekly, pre-release

#### Performance Testing Scope
- **Page Load Performance**: Time to first byte, Largest Contentful Paint
- **Runtime Performance**: First Input Delay, Cumulative Layout Shift
- **Network Performance**: API response times, resource loading
- **Media Performance**: Image loading, video playback
- **Database Performance**: Query execution time

#### Examples
```typescript
// Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/sermons',
        'http://localhost:3000/events',
        'http://localhost:3000/donate'
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'first-contentful-paint': ['error', {maxNumericValue: 2000}],
        'interactive': ['error', {maxNumericValue: 3500}],
        'largest-contentful-paint': ['error', {maxNumericValue: 2500}]
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### 5. Security Testing
- **Purpose**: Identify and address security vulnerabilities
- **Coverage Target**: Authentication flows, data protection, API endpoints
- **Tools**: OWASP ZAP, npm audit, Snyk
- **Run Frequency**: Monthly, pre-release

#### Security Testing Scope
- **Authentication**: Password policies, session management, token handling
- **Authorization**: Role-based access control, resource permissions
- **Input Validation**: XSS prevention, SQL injection protection
- **Data Protection**: PII handling, encryption practices
- **Dependency Scanning**: Vulnerable package detection

#### Examples
```bash
# Run npm security audit
npm audit --production

# Scan for vulnerabilities with Snyk
snyk test

# Run OWASP ZAP scan
zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' https://staging.rehoboth-church.org
```

### 6. Accessibility Testing
- **Purpose**: Ensure the website is usable by people with disabilities
- **Coverage Target**: WCAG 2.1 AA compliance
- **Tools**: axe-core, Lighthouse, manual testing
- **Run Frequency**: On major UI changes, pre-release

#### Accessibility Testing Scope
- **Screen Reader Compatibility**: Semantic HTML, ARIA attributes
- **Keyboard Navigation**: Focus management, keyboard traps
- **Color Contrast**: Text readability, UI elements
- **Form Accessibility**: Labels, error messages, instructions
- **Media Accessibility**: Captions, transcripts, audio descriptions

#### Examples
```typescript
// Automated accessibility test with axe-core
describe('Homepage Accessibility', () => {
  it('should not have accessibility violations', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });
  
  it('can be navigated by keyboard', () => {
    cy.visit('/');
    cy.get('body').tab();
    cy.focused().should('have.attr', 'href').and('include', '/');
    cy.tab();
    cy.focused().should('have.attr', 'href').and('include', '/sermons');
    // Continue testing tab navigation
  });
});
```

## Testing Infrastructure

### Continuous Integration
- **GitHub Actions** for automated test runs on pull requests and merges
- **Test parallelization** for faster feedback
- **Status checks** required before merging

### Test Environments
- **Local**: Development environment with mocked services
- **Development**: Shared environment with test database
- **Staging**: Production-like environment for E2E testing
- **Production**: Monitoring and smoke tests

### Test Data Management
- **Factories** for generating test data (using Faker.js)
- **Fixtures** for common test scenarios
- **Database seeding** for E2E and integration tests
- **Test isolation** to prevent cross-test contamination

## Testing Workflows

### Local Development
1. Run unit tests on file save
2. Run affected integration tests before commit
3. Run linting and type checking before push

### Pull Request
1. Run all unit and integration tests
2. Run performance and accessibility checks
3. Generate code coverage report

### Release Preparation
1. Run full test suite including E2E tests
2. Run security scans
3. Run cross-browser tests
4. Perform manual exploratory testing

### Post-Deployment
1. Run smoke tests
2. Monitor error rates and performance metrics
3. Run A/B tests for new features (if applicable)

## Testing Artifacts

### Generated Reports
- **Coverage reports** showing code coverage percentages
- **Test results** with pass/fail status and execution times
- **Performance audits** with key metrics and comparisons
- **Accessibility reports** highlighting WCAG violations
- **Security scans** identifying potential vulnerabilities

### Monitoring Dashboards
- **Error tracking** via Sentry or similar
- **Performance monitoring** via Next.js Analytics
- **User behavior** via PostHog
- **API health** via Supabase monitoring

## Feature-Specific Testing Strategies

### Hero Carousel
- Unit test carousel navigation logic
- Test image loading and fallbacks
- Verify touch gestures work on mobile devices
- Test auto-play and pause functionality

### Sermon Management
- Test search functionality with various queries
- Verify media player controls work properly
- Test streaming with different connection speeds
- Verify series organization and navigation

### Event Management
- Test calendar integration with different clients
- Verify registration flow handles capacity limits
- Test waitlist functionality and notifications
- Verify location display and mapping

### Donation Processing
- Test payment flows with Stripe test cards
- Verify receipt generation and delivery
- Test recurring donation management
- Verify proper error handling for failed payments

### Newsletter System
- Test subscription and verification flow
- Verify email template rendering
- Test campaign scheduling and sending
- Verify analytics tracking accuracy
