import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { CaptureShell } from '@/components/capture/CaptureShell';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/capture',
  component: CapturePage,
});

function CapturePage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <CaptureShell />
    </div>
  );
}
