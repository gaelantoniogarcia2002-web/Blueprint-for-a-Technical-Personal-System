import { useCaptureInbox } from '@/hooks/useCaptureInbox';
import { classify } from '@/domain/paraRules';
import { createParaNode } from '@/repositories/paraNode.repo';
import { createLoop } from '@/repositories/loop.repo';
import { markProcessed } from '@/repositories/captureItem.repo';
import { useWizardStore } from '@/stores/wizard.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEPOSIT_TYPE_LABELS } from '@/domain/paraRules';
import type { DepositType } from '@/domain/types';

const DEPOSIT_TYPES: DepositType[] = ['PROJECT', 'AREA', 'RESOURCE', 'ARCHIVE'];

interface StepProcessProps {
  mountTime: number;
}

export function StepProcess({ mountTime }: StepProcessProps) {
  const inbox = useCaptureInbox();
  const next = useWizardStore((s) => s.next);
  const prev = useWizardStore((s) => s.prev);
  const draft = useWizardStore((s) => s.draft);
  const setDraft = useWizardStore((s) => s.setDraft);
  const step = useWizardStore((s) => s.step);

  const pending = inbox.filter((i) => !i.processed);
  const currentItem = pending[0];

  const suggestedType = draft.type ?? (currentItem ? classify({ title: currentItem.rawText }) : 'RESOURCE');

  async function handleProcess() {
    if (!currentItem) return;

    const type = draft.type ?? suggestedType;
    const title = draft.title ?? currentItem.rawText;

    const nodeId = await createParaNode({ title, type, description: '' });

    if (type === 'PROJECT') {
      await createLoop({
        nodeId,
        title: `Loop: ${title}`,
        status: 'ACTIVE',
        feedbackNotes: [],
      });
    }

    await markProcessed(currentItem.id);
    setDraft({});
    console.debug('[CES]', { step, elapsed: Date.now() - mountTime, event: 'item-processed' });
  }

  function handleNext() {
    console.debug('[CES]', { step, elapsed: Date.now() - mountTime, event: 'next' });
    next();
  }

  function handlePrev() {
    console.debug('[CES]', { step, elapsed: Date.now() - mountTime, event: 'prev' });
    prev();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Paso 2 — Procesar ítems</h2>
      <p className="text-muted-foreground text-sm">
        Clasificá cada ítem de tu bandeja en el sistema PARA.
      </p>

      {currentItem ? (
        <div className="border rounded p-4 space-y-3">
          <p className="text-sm font-medium">{currentItem.rawText}</p>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Título</label>
            <Input
              value={draft.title ?? currentItem.rawText}
              onChange={(e) => setDraft({ title: e.target.value })}
              placeholder="Título del nodo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Tipo</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm bg-background"
              value={draft.type ?? suggestedType}
              onChange={(e) => setDraft({ type: e.target.value as DepositType })}
            >
              {DEPOSIT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {DEPOSIT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <Button size="sm" onClick={handleProcess}>
            Crear nodo y procesar
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Todos los ítems procesados.
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handlePrev}>
          ← Atrás
        </Button>
        <Button onClick={handleNext} disabled={pending.length > 0}>
          Siguiente →
        </Button>
      </div>
    </div>
  );
}
