/** @jest-environment jsdom */
// ViperRange — Component Test: LiveTerminal
// ZeroDay Security Services

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LiveTerminal } from '@/components/logs/live-terminal';

class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onopen: (() => void) | null = null;
  constructor(url: string) { this.url = url; }
  close() {}
}
global.EventSource = MockEventSource as unknown as typeof EventSource;

const mockLogs = [
  { id: 'log-001', level: 'INFO',  message: '[SIMULATED] GET / HTTP/1.1 200',              source: 'nginx', timestamp: new Date().toISOString() },
  { id: 'log-002', level: 'ERROR', message: '[SIMULATED] SQL Injection detected',            source: 'waf',   timestamp: new Date().toISOString() },
  { id: 'log-003', level: 'WARN',  message: '[SIMULATED] Brute force attempt 192.168.1.100', source: 'app',   timestamp: new Date().toISOString() },
];
const mockDeployments = [{ id: 'dep-001', labName: 'OWASP Juice Shop', status: 'READY' }];

describe('LiveTerminal', () => {
  it('renders terminal header', () => {
    render(<LiveTerminal initialLogs={[]} deployments={[]} />);
    expect(screen.getByText(/ViperRange Security Terminal/i)).toBeInTheDocument();
  });

  it('shows empty state when no logs', () => {
    render(<LiveTerminal initialLogs={[]} deployments={[]} />);
    expect(screen.getByText(/No logs yet/i)).toBeInTheDocument();
  });

  it('renders initial log messages', () => {
    render(<LiveTerminal initialLogs={mockLogs} deployments={mockDeployments} />);
    expect(screen.getByText(/SQL Injection detected/i)).toBeInTheDocument();
    expect(screen.getByText(/Brute force attempt/i)).toBeInTheDocument();
  });

  it('shows log level badges', () => {
    render(<LiveTerminal initialLogs={mockLogs} deployments={mockDeployments} />);
    expect(screen.getByText('[ERROR]')).toBeInTheDocument();
    expect(screen.getByText('[WARN]')).toBeInTheDocument();
  });

  it('shows entry count', () => {
    render(<LiveTerminal initialLogs={mockLogs} deployments={mockDeployments} />);
    expect(screen.getByText(/3 entries/i)).toBeInTheDocument();
  });

  it('clears logs when clear button clicked', async () => {
    render(<LiveTerminal initialLogs={mockLogs} deployments={mockDeployments} />);
    const user = userEvent.setup();
    await user.click(screen.getByTitle(/clear terminal/i));
    expect(screen.queryByText(/SQL Injection detected/i)).not.toBeInTheDocument();
    expect(screen.getByText(/No logs yet/i)).toBeInTheDocument();
  });

  it('shows simulated disclaimer', () => {
    render(<LiveTerminal initialLogs={mockLogs} deployments={mockDeployments} />);
    expect(screen.getByText(/SIMULATED/)).toBeInTheDocument();
  });

  it('shows terminal cursor prompt', () => {
    render(<LiveTerminal initialLogs={[]} deployments={[]} />);
    expect(screen.getByText(/viperrange@zeroday/i)).toBeInTheDocument();
  });

  it('shows pause button', () => {
    render(<LiveTerminal initialLogs={mockLogs} deployments={mockDeployments} />);
    expect(screen.getByTitle(/pause/i)).toBeInTheDocument();
  });

  it('shows download button', () => {
    render(<LiveTerminal initialLogs={mockLogs} deployments={mockDeployments} />);
    expect(screen.getByTitle(/download logs/i)).toBeInTheDocument();
  });

  it('filters logs by search text', async () => {
    render(<LiveTerminal initialLogs={mockLogs} deployments={mockDeployments} />);
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/filter logs/i), 'SQL');
    expect(screen.getByText(/SQL Injection detected/i)).toBeInTheDocument();
    expect(screen.queryByText(/Brute force attempt/i)).not.toBeInTheDocument();
  });
});
