import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewWizard } from './ReviewWizard';
import { createReviewSession } from '@/repositories/reviewSession.repo';

// ── Mock hooks so tests don't need a live useLiveQuery context ──
vi.mock('@/hooks/useCaptureInbox', () => ({
  useCaptureInbox: vi.fn(),
}));

vi.mock('@/hooks/useParaNodes', () => ({
  useParaNodes: vi.fn(),
}));

vi.mock('@/hooks/useLoops', () => ({
  useLoops: vi.fn(),
}));

// ── Mock repos that write to Dexie (so unit tests stay fast) ──
vi.mock('@/repositories/captureItem.repo', () => ({
  deleteCapture: vi.fn().mockResolvedValue(undefined),
  markProcessed: vi.fn().mockResolvedValue(undefined),
  listInbox: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/repositories/paraNode.repo', () => ({
  createParaNode: vi.fn().mockResolvedValue('node-id-1'),
  updateParaNode: vi.fn().mockResolvedValue(undefined),
  listParaNodes: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/repositories/loop.repo', () => ({
  createLoop: vi.fn().mockResolvedValue('loop-id-1'),
  appendFeedback: vi.fn().mockResolvedValue(undefined),
  listLoops: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/repositories/reviewSession.repo', () => ({
  createReviewSession: vi.fn().mockResolvedValue('session-id-1'),
  listReviewSessions: vi.fn().mockResolvedValue([]),
}));

import { useCaptureInbox } from '@/hooks/useCaptureInbox';
import { useParaNodes } from '@/hooks/useParaNodes';
import { useLoops } from '@/hooks/useLoops';

const mockUseCaptureInbox = vi.mocked(useCaptureInbox);
const mockUseParaNodes = vi.mocked(useParaNodes);
const mockUseLoops = vi.mocked(useLoops);
const mockCreateReviewSession = vi.mocked(createReviewSession);

// Reset wizard store between tests to start fresh at step 0
import { useWizardStore } from '@/stores/wizard.store';

function setupEmptyState() {
  mockUseCaptureInbox.mockReturnValue([]);
  mockUseParaNodes.mockReturnValue([]);
  mockUseLoops.mockReturnValue([]);
}

describe('ReviewWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset wizard store to initial state
    useWizardStore.getState().reset();
    setupEmptyState();
  });

  // Test 1: step0 → step1 transition
  it('(1) clicking Next on step 0 transitions to step 2 (Process)', async () => {
    render(<ReviewWizard />);

    // Should start on Step 1 (Inbox)
    expect(screen.getByText(/Paso 1 — Vaciar bandeja/i)).toBeDefined();

    // Click Next
    fireEvent.click(screen.getByText(/Siguiente →/i));

    await waitFor(() => {
      expect(screen.getByText(/Paso 2 — Procesar ítems/i)).toBeDefined();
    });
  });

  // Test 2: step1 → step2 transition
  it('(2) clicking Next on step 1 transitions to step 3 (Projects)', async () => {
    // Start at step 1
    useWizardStore.getState().next();

    render(<ReviewWizard />);

    expect(screen.getByText(/Paso 2 — Procesar ítems/i)).toBeDefined();

    // Next button is enabled only when inbox is empty (no pending items)
    mockUseCaptureInbox.mockReturnValue([]);

    fireEvent.click(screen.getByText(/Siguiente →/i));

    await waitFor(() => {
      expect(screen.getByText(/Paso 3 — Actualizar proyectos/i)).toBeDefined();
    });
  });

  // Test 3: back navigation from step 1 to step 0
  it('(3) clicking Back on step 1 returns to step 0 (Inbox)', async () => {
    useWizardStore.getState().next();

    render(<ReviewWizard />);

    expect(screen.getByText(/Paso 2 — Procesar ítems/i)).toBeDefined();

    fireEvent.click(screen.getByText(/← Atrás/i));

    await waitFor(() => {
      expect(screen.getByText(/Paso 1 — Vaciar bandeja/i)).toBeDefined();
    });
  });

  // Test 4: completing step 2 persists reviewSession to Dexie
  it('(4) completing step 3 calls createReviewSession with completed: true', async () => {
    // Start at step 2
    useWizardStore.setState({ step: 2 });

    render(<ReviewWizard />);

    expect(screen.getByText(/Paso 3 — Actualizar proyectos/i)).toBeDefined();

    fireEvent.click(screen.getByText(/Completar revisión/i));

    await waitFor(() => {
      expect(mockCreateReviewSession).toHaveBeenCalledWith(
        expect.objectContaining({ completed: true }),
      );
    });
  });

  // Test 5: abandoning mid-flow leaves Dexie unchanged
  it('(5) abandoning mid-flow (unmount before completion) does not call createReviewSession', () => {
    useWizardStore.getState().next(); // at step 1

    const { unmount } = render(<ReviewWizard />);

    expect(screen.getByText(/Paso 2 — Procesar ítems/i)).toBeDefined();

    unmount();

    // createReviewSession should never have been called
    expect(mockCreateReviewSession).not.toHaveBeenCalled();
  });
});
