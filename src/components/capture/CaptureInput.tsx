import { useRef, useState, type KeyboardEvent } from 'react';
import { addCapture } from '@/repositories/captureItem.repo';

export function CaptureInput() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  async function handleSubmit() {
    if (submitting) return;
    const el = textareaRef.current;
    if (!el) return;
    const text = el.value.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      await addCapture(text);
      el.value = '';
      el.style.height = 'auto';
    } finally {
      setSubmitting(false);
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  return (
    <div className="shrink-0 border-t p-3 bg-background">
      <textarea
        ref={textareaRef}
        className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring max-w-full min-w-0 break-words overflow-wrap-anywhere whitespace-pre-wrap"
        placeholder="Capturá algo… (Enter para guardar, Shift+Enter para nueva línea)"
        rows={1}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
      />
    </div>
  );
}
