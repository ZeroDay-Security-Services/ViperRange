/** @jest-environment jsdom */
// ViperRange — Component Test: LoginForm
// ZeroDay Security Services

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';
import { signIn } from 'next-auth/react';

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form elements', () => {
    render(<LoginForm />);
    expect(screen.getByText('ACCESS TERMINAL')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await user.type(screen.getByPlaceholderText(/••••/), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email address/i), 'test@test.com');
    await user.type(screen.getByPlaceholderText(/••••/), 'short');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('calls signIn with correct credentials', async () => {
    mockSignIn.mockResolvedValueOnce({ ok: true, error: null, status: 200, url: '/dashboard', code: undefined } as never);
    render(<LoginForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/email address/i), 'test@test.com');
    await user.type(screen.getByPlaceholderText(/••••/), 'ValidPass1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
        email: 'test@test.com',
        password: 'ValidPass1!',
        redirect: false,
      }));
    });
  });

  it('shows link to register page', () => {
    render(<LoginForm />);
    const registerLink = screen.getByRole('link', { name: /create an account/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('shows demo credentials notice', () => {
    render(<LoginForm />);
    expect(screen.getByText(/student@demo\.com/i)).toBeInTheDocument();
  });

  it('shows ZeroDay branding', () => {
    render(<LoginForm />);
    expect(screen.getByText(/ACCESS TERMINAL/i)).toBeInTheDocument();
  });
});
