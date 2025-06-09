// src/components/donations/__tests__/DonationForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DonationForm from '../DonationForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Mock stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ clientSecret: 'test_secret', paymentIntentId: 'test_id' }),
  })
);

describe('DonationForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithStripe = () => {
    const stripePromise = loadStripe('fake-key');
    return render(
      <Elements stripe={stripePromise}>
        <DonationForm />
      </Elements>
    );
  };

  test('renders the donation form with initial state', () => {
    renderWithStripe();
    
    // Check if the form rendered with the initial step
    expect(screen.getByText(/Select an amount/i)).toBeInTheDocument();
    
    // Check if preset amount options are rendered
    expect(screen.getByText('$25')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$250')).toBeInTheDocument();
    
    // Check if custom amount field is present
    expect(screen.getByPlaceholderText(/Other amount/i)).toBeInTheDocument();
    
    // Check if continue button is present
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });

  test('can select a preset amount', async () => {
    renderWithStripe();
    
    // Click on a preset amount
    const fiftyDollarBtn = screen.getByText('$50');
    userEvent.click(fiftyDollarBtn);
    
    // Check if button is now selected
    expect(fiftyDollarBtn).toHaveClass('bg-blue-600');
  });

  test('can enter a custom amount', async () => {
    renderWithStripe();
    
    // Enter a custom amount
    const customAmountInput = screen.getByPlaceholderText(/Other amount/i);
    userEvent.type(customAmountInput, '75');
    
    // Check if the value is updated
    expect(customAmountInput).toHaveValue('75');
  });

  test('validates required amount before proceeding', async () => {
    renderWithStripe();
    
    // Try to continue without selecting an amount
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    userEvent.click(continueButton);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/Please select or enter an amount/i)).toBeInTheDocument();
    });
  });

  test('proceeds to the next step when amount is selected', async () => {
    renderWithStripe();
    
    // Select an amount
    const hundredDollarBtn = screen.getByText('$100');
    userEvent.click(hundredDollarBtn);
    
    // Click continue
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    userEvent.click(continueButton);
    
    // Check if we moved to the next step (designation selection)
    await waitFor(() => {
      expect(screen.getByText(/Select a designation/i)).toBeInTheDocument();
    });
  });
  
  // Add more tests for other steps and form validation
});
