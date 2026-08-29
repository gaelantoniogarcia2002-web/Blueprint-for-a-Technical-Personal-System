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
    <div className="flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
      <CaptureShell />
    </div>
  );
}
