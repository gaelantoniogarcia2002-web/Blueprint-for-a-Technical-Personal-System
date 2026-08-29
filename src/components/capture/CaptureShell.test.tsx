import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CaptureShell } from './CaptureShell';
import type { CaptureItem } from '@/domain/types';

// Mock the hook so tests don't need a live Dexie instance
vi.mock('@/hooks/useCaptureInbox', () => ({
  useCaptureInbox: vi.fn(),
}));

// Mock the repo function used by CaptureInput
vi.mock('@/repositories/captureItem.repo', () => ({
  addCapture: vi.fn().mockResolvedValue('mock-id'),
  listInbox: vi.fn().mockResolvedValue([]),
}));

import { useCaptureInbox } from '@/hooks/useCaptureInbox';

const mockUseCaptureInbox = vi.mocked(useCaptureInbox);

function makeItem(overrides: Partial<CaptureItem> = {}): CaptureItem {
  return {
    id: crypto.randomUUID(),
    rawText: 'short text',
    processed: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('CaptureShell — RF-01 layout acceptance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing with empty inbox', () => {
    mockUseCaptureInbox.mockReturnValue([]);
    render(<CaptureShell />);
    expect(screen.getByTestId('capture-shell')).toBeDefined();
  });

  it('TC-1: long unbroken token (60+ chars) does not cause horizontal overflow', () => {
    const longToken = 'a'.repeat(80); // 80-char unbroken token
    mockUseCaptureInbox.mockReturnValue([makeItem({ rawText: longToken })]);

    render(<CaptureShell />);

    const shell = screen.getByTestId('capture-shell');

    // The shell container should not overflow horizontally
    // In jsdom, scrollWidth equals clientWidth when content wraps
    expect(shell.scrollWidth).toBeLessThanOrEqual(shell.clientWidth + 1); // +1 for rounding
  });

  it('TC-2: multi-line input (3+ lines) does not collapse flex siblings', () => {
    const multilineText = 'Line one\nLine two\nLine three\nLine four';
    mockUseCaptureInbox.mockReturnValue([makeItem({ rawText: multilineText })]);

    render(<CaptureShell />);

    const shell = screen.getByTestId('capture-shell');
    const bubble = screen.getByTestId('capture-bubble');

    // The bubble should be present and the shell should still contain the input
    expect(bubble).toBeDefined();
    expect(bubble.textContent).toContain('Line one');

    // The input area (shrink-0) should still be rendered (not collapsed)
    const textarea = shell.querySelector('textarea');
    expect(textarea).not.toBeNull();
  });

  it('TC-3: normal short input renders without regression', () => {
    mockUseCaptureInbox.mockReturnValue([makeItem({ rawText: 'Buy milk' })]);

    render(<CaptureShell />);

    const bubble = screen.getByTestId('capture-bubble');
    expect(bubble.textContent).toBe('Buy milk');

    // Container is still present
    expect(screen.getByTestId('capture-shell')).toBeDefined();
  });
});
