import { useState } from 'react';
import { useParaNodes } from '@/hooks/useParaNodes';
import { updateParaNode } from '@/repositories/paraNode.repo';
import { appendFeedback, closeLoop } from '@/repositories/loop.repo';
import { createReviewSession } from '@/repositories/reviewSession.repo';
import { useLoops } from '@/hooks/useLoops';
import { useWizardStore } from '@/stores/wizard.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface StepProjectsProps {
  mountTime: number;
  onComplete(): void;
}

export function StepProjects({ mountTime, onComplete }: StepProjectsProps) {
  const projects = useParaNodes('PROJECT');
  const loops = useLoops();
  const prev = useWizardStore((s) => s.prev);
  const reset = useWizardStore((s) => s.reset);
  const step = useWizardStore((s) => s.step);

  const [updates, setUpdates] = useState<Record<string, { title: string; description: string }>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  function getUpdate(projectId: string, currentTitle: string, currentDesc: string) {
    return updates[projectId] ?? { title: currentTitle, description: currentDesc ?? '' };
  }

  async function handleCloseLoop(loopId: string) {
    const note = feedback[loopId]?.trim() || undefined;
    await closeLoop(loopId, note);
    // Note was already persisted by closeLoop — drop it so handleComplete
    // doesn't append it a second time.
    setFeedback((prev) => {
      const rest = { ...prev };
      delete rest[loopId];
      return rest;
    });
  }

  async function handleComplete() {
    // Persist all project updates
    for (const project of projects) {
      const upd = updates[project.id];
      if (upd) {
        await updateParaNode(project.id, { title: upd.title, description: upd.description });
      }
    }

    // Persist feedback notes to active loops
    for (const [loopId, note] of Object.entries(feedback)) {
      if (note.trim()) {
        await appendFeedback(loopId, note.trim());
      }
    }

    // Persist review session completion
    await createReviewSession({ completedAt: Date.now(), completed: true });

    console.debug('[CES]', { step, elapsed: Date.now() - mountTime, event: 'complete' });
    reset();
    onComplete();
  }

  function handlePrev() {
    console.debug('[CES]', { step, elapsed: Date.now() - mountTime, event: 'prev' });
    prev();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Paso 3 — Actualizar proyectos</h2>
      <p className="text-muted-foreground text-sm">
        Revisá el estado de tus proyectos y agregá feedback a los bucles activos.
      </p>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Sin proyectos aún.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => {
            const upd = getUpdate(project.id, project.title, project.description ?? '');
            const projectLoops = loops.filter(
              (l) => l.nodeId === project.id && l.status === 'ACTIVE',
            );
            return (
              <li key={project.id} className="border rounded p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Título</label>
                  <Input
                    value={upd.title}
                    onChange={(e) =>
                      setUpdates((prev) => ({
                        ...prev,
                        [project.id]: { ...upd, title: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Descripción</label>
                  <Textarea
                    value={upd.description}
                    onChange={(e) =>
                      setUpdates((prev) => ({
                        ...prev,
                        [project.id]: { ...upd, description: e.target.value },
                      }))
                    }
                    rows={2}
                  />
                </div>

                {projectLoops.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Bucles activos
                    </p>
                    {projectLoops.map((loop) => (
                      <div key={loop.id} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs">{loop.title}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCloseLoop(loop.id)}
                          >
                            Marcar como completado
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Agregar nota de feedback..."
                          value={feedback[loop.id] ?? ''}
                          onChange={(e) =>
                            setFeedback((prev) => ({
                              ...prev,
                              [loop.id]: e.target.value,
                            }))
                          }
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={handlePrev}>
          ← Atrás
        </Button>
        <Button onClick={handleComplete}>Completar revisión</Button>
      </div>
    </div>
  );
}
