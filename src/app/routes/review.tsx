import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ReviewWizard } from '@/components/wizard/ReviewWizard';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: ReviewPage,
});

function ReviewPage() {
  return <ReviewWizard />;
}
