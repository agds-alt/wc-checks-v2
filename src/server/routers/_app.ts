// Main App Router - combines all routers
import { router } from '../trpc';
import { authRouter } from './auth';
import { userRouter } from './user';
import { organizationRouter } from './organization';
import { buildingRouter } from './building';
import { locationRouter } from './location';
import { inspectionRouter } from './inspection';
import { templateRouter } from './template';
import { statsRouter } from './stats';
import { subscriptionRouter } from './subscription';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  organization: organizationRouter,
  building: buildingRouter,
  location: locationRouter,
  inspection: inspectionRouter,
  template: templateRouter,
  stats: statsRouter,
  subscription: subscriptionRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
