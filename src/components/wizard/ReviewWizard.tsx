import { useRef, useState } from 'react';
import { useWizardStore } from '@/stores/wizard.store';
import { StepInbox } from './StepInbox';
import { StepProcess } from './StepProcess';
import { StepProjects } from './StepProjects';

export function ReviewWizard() {
  const step = useWizardStore((s) => s.step);
  const reset = useWizardStore((s) => s.reset);
  const mountTime = useRef(Date.now()).current;
  const [done, setDone] = useState(false);

  function handleComplete() {
    setDone(true);
  }

  function handleRestart() {
    reset();
    setDone(false);
  }

  if (done) {
    return (
      <div className="p-4 space-y-4 text-center">
        <h2 className="text-lg font-semibold">Revisión completa</h2>
        <p className="text-muted-foreground text-sm">
          Tu revisión semanal fue guardada.
        </p>
        <button
          className="text-sm underline text-primary"
          onClick={handleRestart}
        >
          Iniciar otra revisión
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">
      <nav className="flex gap-2 text-xs text-muted-foreground">
        {(['Bandeja', 'Procesar', 'Proyectos'] as const).map((label, idx) => (
          <span
            key={label}
            className={idx === step ? 'font-semibold text-foreground' : ''}
          >
            {idx + 1}. {label}
          </span>
        ))}
      </nav>

      {step === 0 && <StepInbox mountTime={mountTime} />}
      {step === 1 && <StepProcess mountTime={mountTime} />}
      {step === 2 && (
        <StepProjects mountTime={mountTime} onComplete={handleComplete} />
      )}
    </div>
  );
}
