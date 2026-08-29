import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: ReviewPage,
});

function ReviewPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Weekly Review</h1>
      <p className="text-muted-foreground">Review wizard — PR-2.</p>
    </div>
  );
}
