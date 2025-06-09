// src/components/admin/donations/__tests__/AdminDonationList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDonationList from '../AdminDonationList';

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ 
      donations: [
        {
          id: '123',
          donor_name: 'John Doe',
          donor_email: 'john@example.com',
          amount: 5000, // $50.00
          currency: 'USD',
          fund_designation: 'Building Fund',
          is_recurring: false,
          created_at: '2025-06-01T12:00:00Z'
        },
        {
          id: '456',
          donor_name: 'Jane Smith',
          donor_email: 'jane@example.com',
          amount: 10000, // $100.00
          currency: 'USD',
          fund_designation: 'General',
          is_recurring: true,
          frequency: 'monthly',
          created_at: '2025-05-15T10:30:00Z'
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        totalItems: 2,
        totalPages: 1
      }
    }),
  })
);

// Mock next/navigation to avoid errors with Link components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/admin/donations',
}));

describe('AdminDonationList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<AdminDonationList />);
    
    // Check if loading spinner is displayed
    expect(screen.getByRole('row', { name: '' }).querySelector('.animate-spin')).toBeInTheDocument();
  });
  
  test('displays donation data after loading', async () => {
    render(<AdminDonationList />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('row', { name: '' }).querySelector('.animate-spin')).not.toBeInTheDocument();
    });
    
    // Check if donation data is displayed correctly
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Building Fund')).toBeInTheDocument();
    
    // Check if correct formatting is applied
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    
    // Check if recurring label is displayed
    const recurringLabel = screen.getByText(/Recurring \(monthly\)/);
    expect(recurringLabel).toBeInTheDocument();
    
    // Check if one-time label is displayed
    const oneTimeLabel = screen.getByText('One-time');
    expect(oneTimeLabel).toBeInTheDocument();
  });
  
  test('displays filter UI and can toggle it', async () => {
    render(<AdminDonationList />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('row', { name: '' }).querySelector('.animate-spin')).not.toBeInTheDocument();
    });
    
    // Find and click the show filters button
    const filterButton = screen.getByRole('button', { name: /Show Filters/i });
    userEvent.click(filterButton);
    
    // Check if filter inputs are visible
    await waitFor(() => {
      expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Donor Email/i)).toBeInTheDocument();
    });
    
    // Check that we can hide filters
    userEvent.click(screen.getByRole('button', { name: /Hide Filters/i }));
    
    await waitFor(() => {
      expect(screen.queryByLabelText(/Start Date/i)).not.toBeInTheDocument();
    });
  });
});
