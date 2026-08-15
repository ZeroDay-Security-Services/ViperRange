// ViperRange — Component Test: LabCard
// ZeroDay Security Services

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LabCard } from '@/components/labs/lab-card';

const mockLab = {
  id: 'lab-cuid-001',
  name: 'OWASP Juice Shop',
  description: 'The most modern and sophisticated insecure web application.',
  category: 'WEB_APP',
  difficulty: 'BEGINNER',
  tags: ['SQLi', 'XSS', 'CSRF'],
  estimatedDeployTime: 90,
  isFeatured: true,
};

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('LabCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders lab name and description', () => {
    render(<LabCard lab={mockLab} activeDeployment={null} />);
    expect(screen.getByText('OWASP Juice Shop')).toBeInTheDocument();
    expect(screen.getByText(/most modern and sophisticated/i)).toBeInTheDocument();
  });

  it('shows difficulty badge', () => {
    render(<LabCard lab={mockLab} activeDeployment={null} />);
    expect(screen.getByText('BEGINNER')).toBeInTheDocument();
  });

  it('shows Start Lab button when no active deployment', () => {
    render(<LabCard lab={mockLab} activeDeployment={null} />);
    expect(screen.getByRole('button', { name: /start lab/i })).toBeInTheDocument();
  });

  it('shows Stop button when lab is running', () => {
    const activeDeployment = {
      id: 'dep-001',
      labId: 'lab-cuid-001',
      status: 'READY',
      publicUrl: 'https://juice-shop-demo.onrender.com',
      startedAt: new Date(),
      readyAt: new Date(),
    };
    render(<LabCard lab={mockLab} activeDeployment={activeDeployment} />);
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('shows public URL when lab is READY', () => {
    const activeDeployment = {
      id: 'dep-001',
      labId: 'lab-cuid-001',
      status: 'READY',
      publicUrl: 'https://juice-shop-demo.onrender.com',
      startedAt: new Date(),
      readyAt: new Date(),
    };
    render(<LabCard lab={mockLab} activeDeployment={activeDeployment} />);
    expect(screen.getByText(/juice-shop-demo\.onrender\.com/i)).toBeInTheDocument();
  });

  it('calls start API on button click', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { deploymentId: 'new-dep-001', status: 'QUEUED', publicUrl: null },
      }),
    });
    render(<LabCard lab={mockLab} activeDeployment={null} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /start lab/i }));
    expect(mockFetch).toHaveBeenCalledWith('/api/start-lab', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ labId: 'lab-cuid-001' }),
    }));
  });

  it('shows error message on start failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Too many deployment requests.' }),
    });
    render(<LabCard lab={mockLab} activeDeployment={null} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /start lab/i }));
    await waitFor(() => {
      expect(screen.getByText(/too many deployment requests/i)).toBeInTheDocument();
    });
  });
});
