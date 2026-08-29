import { useRef } from 'react';
import { useCaptureInbox } from '@/hooks/useCaptureInbox';
import { deleteCapture } from '@/repositories/captureItem.repo';
import { useWizardStore } from '@/stores/wizard.store';
import { Button } from '@/components/ui/button';

interface StepInboxProps {
  mountTime: number;
}

export function StepInbox({ mountTime }: StepInboxProps) {
  const inbox = useCaptureInbox();
  const next = useWizardStore((s) => s.next);
  const step = useWizardStore((s) => s.step);
  const handledRef = useRef(false);

  async function handleDismiss(id: string) {
    await deleteCapture(id);
  }

  function handleNext() {
    if (handledRef.current) return;
    handledRef.current = true;
    console.debug('[CES]', { step, elapsed: Date.now() - mountTime, event: 'next' });
    next();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Paso 1 — Vaciar bandeja</h2>
      <p className="text-muted-foreground text-sm">
        Revisá cada ítem capturado. Descartá o conservá para procesar.
      </p>

      {inbox.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">La bandeja está vacía.</p>
      ) : (
        <ul className="space-y-2">
          {inbox.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 border rounded p-3 text-sm"
            >
              <span className="flex-1 break-words">{item.rawText}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(item.id)}
              >
                Descartar
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end">
        <Button onClick={handleNext}>Siguiente →</Button>
      </div>
    </div>
  );
}
