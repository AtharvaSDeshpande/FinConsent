import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '../theme/index.js';
import { I18nProvider } from '../i18n/I18nContext.jsx';
import { MagicLinkModal } from '../features/magic-link/MagicLinkModal.jsx';
import { WhatsAppShareButton } from '../features/magic-link/WhatsAppShareButton.jsx';
import { RiaDashboard } from '../features/dashboard/RiaDashboard.jsx';
import { ErrorBoundary } from '../components/common/ErrorBoundary.jsx';

// Helper component wrapping required providers
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <I18nProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const mockUrgentMandate = {
  id: 'man_urgent_1',
  title: 'Urgent Large Cap Rebalancing',
  status: 'sent',
  clientId: 'cli_1',
  clientName: 'Rohan Mehta',
  clientPan: 'ABCPM1234F',
  clientDob: '1978-08-14',
  magicToken: 'urgent_magic_token_123456',
  taxPayable: 25000,
  stcgAmount: 50000,
  ltcgAmount: 150000,
  cutoffTimestamp: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours remaining
  createdAt: new Date().toISOString(),
};

const mockViewedMandate = {
  id: 'man_viewed_2',
  title: 'Viewed Balanced Portfolio',
  status: 'viewed',
  clientId: 'cli_2',
  clientName: 'Priya Sharma',
  clientPan: 'ABCPS5678G',
  clientDob: '1985-05-20',
  magicToken: 'viewed_magic_token_789012',
  taxPayable: 12000,
  stcgAmount: 20000,
  ltcgAmount: 80000,
  cutoffTimestamp: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
};

describe('Reshare & Remind Button Actions, Modal Hook Safety & Error Boundary Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. MagicLinkModal Hook Stability & Hook Count Invariance', () => {
    it('1.1: Toggles from null mandate to active mandate without throwing React hook order mismatch', () => {
      const handleClose = vi.fn();
      const handleRevoke = vi.fn();

      // Render 1: initially null mandate (as in dashboard initial state)
      const { rerender } = render(
        <TestWrapper>
          <MagicLinkModal
            open={false}
            onClose={handleClose}
            mandate={null}
            onRevokeAndRegenerate={handleRevoke}
          />
        </TestWrapper>
      );

      // Render 2: opening with active mandate (user clicks Reshare / Remind)
      expect(() => {
        rerender(
          <TestWrapper>
            <MagicLinkModal
              open={true}
              onClose={handleClose}
              mandate={mockUrgentMandate}
              onRevokeAndRegenerate={handleRevoke}
            />
          </TestWrapper>
        );
      }).not.toThrow();

      // Modal content should be visible without throwing hook exceptions
      expect(screen.getByText(/Dispatch Mandate Magic Link/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/urgent_magic_token_123456/i)).toBeInTheDocument();
    });

    it('1.2: Renders safe PAN format helper without crashing on null or missing client object', () => {
      const mandateWithoutClientObj = {
        id: 'man_no_client',
        title: 'Minimal Mandate',
        status: 'sent',
        magicToken: 'token_simple',
        clientPan: 'ABCPM9999Z',
      };

      render(
        <TestWrapper>
          <MagicLinkModal
            open={true}
            onClose={vi.fn()}
            mandate={mandateWithoutClientObj}
            onRevokeAndRegenerate={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText(/Dispatch Mandate Magic Link/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/token_simple/i)).toBeInTheDocument();
    });
  });

  describe('2. RiaDashboard Action Buttons ("Reshare most urgent links" & "Remind Client")', () => {
    const mockUser = {
      id: 'usr_ria_1',
      name: 'Suresh Kumar',
      role: 'ria',
      firmName: 'Prudent Wealth Advisory',
      sebiRegNumber: 'INA000088921',
    };

    it('2.1: Clicking "Reshare Most Urgent Link" opens the modal cleanly without blank screen or crash', () => {
      render(
        <TestWrapper>
          <RiaDashboard
            user={mockUser}
            mandates={[mockUrgentMandate]}
            loading={false}
          />
        </TestWrapper>
      );

      // Locate the "Reshare Most Urgent Link" button in the urgent banner
      const reshareBtn = screen.getByRole('button', { name: /Reshare Most Urgent Link/i });
      expect(reshareBtn).toBeInTheDocument();

      // Click the button
      expect(() => {
        fireEvent.click(reshareBtn);
      }).not.toThrow();

      // Modal should be open and display the urgent mandate's magic link
      expect(screen.getByText(/Dispatch Mandate Magic Link/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/urgent_magic_token_123456/i)).toBeInTheDocument();
    });

    it('2.2: Clicking "Remind Client" on a viewed mandate opens the modal cleanly without blank screen or crash', () => {
      render(
        <TestWrapper>
          <RiaDashboard
            user={mockUser}
            mandates={[mockViewedMandate]}
            loading={false}
          />
        </TestWrapper>
      );

      // Locate the "Remind Client" button in the mandate row
      const remindBtn = screen.getByRole('button', { name: /Remind Client/i });
      expect(remindBtn).toBeInTheDocument();

      // Click the button
      expect(() => {
        fireEvent.click(remindBtn);
      }).not.toThrow();

      // Modal should be open and display the viewed mandate's magic link
      expect(screen.getByText(/Dispatch Mandate Magic Link/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/viewed_magic_token_789012/i)).toBeInTheDocument();
    });

    it('2.3: Clicking "Share Link" on a sent mandate opens the modal cleanly', () => {
      render(
        <TestWrapper>
          <RiaDashboard
            user={mockUser}
            mandates={[mockUrgentMandate]}
            loading={false}
          />
        </TestWrapper>
      );

      const shareLinkBtn = screen.getByRole('button', { name: /Share Link/i });
      expect(shareLinkBtn).toBeInTheDocument();

      expect(() => {
        fireEvent.click(shareLinkBtn);
      }).not.toThrow();

      expect(screen.getByText(/Dispatch Mandate Magic Link/i)).toBeInTheDocument();
    });
  });

  describe('3. WhatsAppShareButton Null Safety & Window Resilience', () => {
    it('3.1: Does not throw when rendered with null or undefined mandate', () => {
      expect(() => {
        render(
          <TestWrapper>
            <WhatsAppShareButton mandate={null} magicUrl="" />
          </TestWrapper>
        );
      }).not.toThrow();

      const btn = screen.getByRole('button', { name: /WhatsApp/i });
      expect(btn).toBeDisabled();
    });

    it('3.2: Safely handles click with valid mandate without unhandled exceptions', () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(
        <TestWrapper>
          <WhatsAppShareButton
            mandate={mockUrgentMandate}
            magicUrl="http://localhost:5000/m/urgent_magic_token_123456"
          />
        </TestWrapper>
      );

      const btn = screen.getByRole('button', { name: /WhatsApp/i });
      expect(btn).not.toBeDisabled();

      fireEvent.click(btn);
      expect(windowOpenSpy).toHaveBeenCalled();
      windowOpenSpy.mockRestore();
    });
  });

  describe('4. ErrorBoundary Protection Against Blank Screen Crashes', () => {
    it('4.1: Catches unexpected component errors and renders recovery UI rather than blank screen', () => {
      const ProblemComponent = () => {
        throw new Error('Simulated runtime render crash');
      };

      // Suppress React's error log in test console
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ProblemComponent />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Verify that error boundary fallback is rendered
      expect(screen.getByText(/Something unexpected happened in the application/i)).toBeInTheDocument();
      expect(screen.getByText(/Simulated runtime render crash/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reload Page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it('4.2: Passes through children cleanly when no errors occur', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <div>Healthy Component Content</div>
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Healthy Component Content')).toBeInTheDocument();
    });
  });
});
