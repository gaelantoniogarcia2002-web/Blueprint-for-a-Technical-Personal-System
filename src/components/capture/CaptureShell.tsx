import { useCaptureInbox } from '@/hooks/useCaptureInbox';
import { CaptureInput } from './CaptureInput';

export function CaptureShell() {
  const items = useCaptureInbox();

  return (
    <div
      data-testid="capture-shell"
      className="flex flex-col min-h-0 min-w-0 h-full"
    >
      {/* Scrollable inbox list */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nothing captured yet. Start typing below.
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            data-testid="capture-bubble"
            className="max-w-full min-w-0 break-words overflow-wrap-anywhere whitespace-pre-wrap rounded-md border bg-card p-3 text-sm"
          >
            {item.rawText}
          </div>
        ))}
      </div>

      {/* Input row — stays at bottom, never pushed by content */}
      <CaptureInput />
    </div>
  );
}
