import { useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { HelpCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

interface SectionHelp {
  title: string;
  body: string[];
}

const SECTION_HELP: Record<string, SectionHelp> = {
  '/capture': {
    title: 'Captura Rápida',
    body: [
      'Escribí cualquier idea, tarea o pendiente tal como te aparece en la cabeza, sin clasificarla todavía.',
      'Enter guarda el ítem en tu bandeja de entrada. Shift+Enter agrega una nueva línea sin enviar.',
      'No decidas acá qué es cada cosa — eso pasa en la Revisión Semanal. El objetivo de esta pantalla es vaciar la mente rápido.',
    ],
  },
  '/dashboard': {
    title: 'Dashboard',
    body: [
      'Acá ves la síntesis de tu sistema: cuántos nodos tenés por tipo PARA, cuánto avanzan tus proyectos y cómo evolucionan tus bucles (loops) activos y cerrados.',
      'La línea de tiempo comparativa muestra cuánto tiempo llevan vivos tus Proyectos frente a tus Áreas y Recursos — útil para detectar proyectos que se estancaron.',
      '"Última actualización" te dice hace cuántos días tocaste el sistema por última vez.',
    ],
  },
  '/para': {
    title: 'Explorador PARA',
    body: [
      'Tus nodos están agrupados en cuatro depósitos: Proyectos (con fecha límite), Áreas (responsabilidades continuas), Recursos (referencia) y Archivo (inactivo).',
      'Cada grupo es un acordeón — se abre solo cuando lo necesitás, así no ves todo de golpe.',
      'Desde cada nodo podés Finalizar (marcarlo como completo), Archivar (moverlo al depósito de Archivo) o Eliminarlo definitivamente.',
    ],
  },
  '/review': {
    title: 'Revisión Semanal',
    body: [
      'Un asistente de 3 pasos: vaciar la bandeja, procesar cada ítem con las reglas PARA, y actualizar tus proyectos y bucles activos.',
      'En el paso de Proyectos podés cerrar bucles activos como completados — así el Dashboard refleja tus hábitos e iteraciones reales, no solo lo pendiente.',
      'Completar la revisión queda registrado, para que el Dashboard sepa hace cuánto fue tu última revisión.',
    ],
  },
};

const DEFAULT_HELP: SectionHelp = {
  title: 'Blueprint',
  body: ['Navegá entre Captura, Dashboard, PARA y Revisión usando el menú superior.'],
};

const METHODOLOGY_TEXT = [
  'Blueprint combina dos metodologías de productividad personal: GTD (Getting Things Done) y PARA (Proyectos, Áreas, Recursos, Archivo).',
  'GTD te dice cómo capturar y procesar: todo lo que entra a tu cabeza se captura sin filtrar, después se procesa una sola vez por ítem, decidiendo qué es y dónde vive.',
  'PARA te dice dónde vive cada cosa: un Proyecto tiene un resultado concreto y una fecha límite; un Área es una responsabilidad continua sin fecha de fin; un Recurso es material de referencia; el Archivo guarda lo que ya no está activo pero podría servir después.',
  'Los Bucles (loops) representan compromisos abiertos dentro de un Proyecto. Cerrarlos durante la Revisión Semanal es lo que convierte intención en progreso medible.',
  'La Revisión Semanal es el mecanismo que mantiene todo el sistema honesto: sin ella, PARA se vuelve una lista más que nadie mira.',
];

export function HelpButton() {
  const [open, setOpen] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const help = SECTION_HELP[pathname] ?? DEFAULT_HELP;

  function handleClose() {
    setOpen(false);
    setShowMethodology(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Ayuda"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/80"
      >
        <HelpCircle className="size-5" />
      </button>

      <Modal open={open} onClose={handleClose} title={help.title}>
        <div className="space-y-2 text-sm text-muted-foreground">
          {help.body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="border-t pt-3">
          {showMethodology ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              {METHODOLOGY_TEXT.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowMethodology(true)}
              className="text-sm underline text-primary"
            >
              Saber más sobre la metodología de la app
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}
