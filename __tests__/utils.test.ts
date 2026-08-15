// ViperRange — Unit Tests: Utilities
// ZeroDay Security Services

import {
  cn,
  slugify,
  truncate,
  getInitials,
  getDifficultyColor,
  getStatusColor,
  getCategoryLabel,
  formatDuration,
  parseApiError,
} from '@/lib/utils';

describe('cn (class merger)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('deduplicates tailwind classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    expect(slugify('OWASP Juice Shop')).toBe('owasp-juice-shop');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('foo  bar')).toBe('foo-bar');
  });
});

describe('truncate', () => {
  it('returns string unchanged when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });
});

describe('getInitials', () => {
  it('returns initials from name', () => {
    expect(getInitials('Vijay Ishan')).toBe('VI');
  });

  it('handles null', () => {
    expect(getInitials(null)).toBe('??');
  });

  it('caps at 2 characters', () => {
    expect(getInitials('A B C')).toBe('AB');
  });
});

describe('getDifficultyColor', () => {
  it('returns green for beginner', () => {
    expect(getDifficultyColor('BEGINNER')).toContain('status-ready');
  });

  it('returns red for expert', () => {
    expect(getDifficultyColor('EXPERT')).toContain('primary');
  });
});

describe('getStatusColor', () => {
  it('returns green for READY', () => {
    expect(getStatusColor('READY')).toContain('status-ready');
  });

  it('returns red for FAILED', () => {
    expect(getStatusColor('FAILED')).toContain('status-failed');
  });
});

describe('getCategoryLabel', () => {
  it('maps WEB_APP to Web Exploitation', () => {
    expect(getCategoryLabel('WEB_APP')).toBe('Web Exploitation');
  });

  it('returns original for unknown', () => {
    expect(getCategoryLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('formatDuration', () => {
  it('formats seconds', () => {
    expect(formatDuration(45_000)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(90_000)).toBe('1m 30s');
  });

  it('formats hours', () => {
    expect(formatDuration(3_660_000)).toBe('1h 1m');
  });
});

describe('parseApiError', () => {
  it('extracts message from Error', () => {
    expect(parseApiError(new Error('something broke'))).toBe('something broke');
  });

  it('returns string as-is', () => {
    expect(parseApiError('oops')).toBe('oops');
  });

  it('returns fallback for unknown', () => {
    expect(parseApiError(null)).toBe('An unexpected error occurred');
  });
});
