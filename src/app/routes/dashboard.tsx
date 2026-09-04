import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ParaChart } from '@/components/dashboard/ParaChart';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { LoopsChart } from '@/components/dashboard/LoopsChart';
import { TimelineChart } from '@/components/dashboard/TimelineChart';
import { LoopsModule } from '@/components/dashboard/LoopsModule';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="p-4 space-y-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Módulo de Bucles
        </h2>
        <LoopsModule />
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Distribución de nodos PARA
        </h2>
        <ParaChart />
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Progreso de proyectos
        </h2>
        <ProgressChart />
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Línea de tiempo comparativa (Proyectos vs. Áreas/Recursos)
        </h2>
        <TimelineChart />
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Bucles activos vs. completados
        </h2>
        <LoopsChart />
      </section>
    </div>
  );
}
