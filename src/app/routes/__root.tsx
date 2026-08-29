import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="flex gap-4 p-4 border-b bg-background">
        <Link
          to="/capture"
          className="font-medium hover:underline [&.active]:underline"
        >
          Captura
        </Link>
        <Link
          to="/dashboard"
          className="font-medium hover:underline [&.active]:underline"
        >
          Dashboard
        </Link>
        <Link
          to="/para"
          className="font-medium hover:underline [&.active]:underline"
        >
          PARA
        </Link>
        <Link
          to="/review"
          className="font-medium hover:underline [&.active]:underline"
        >
          Revisión
        </Link>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-2">404 — Página no encontrada</h1>
      <Link to="/capture" className="underline text-primary">
        Ir a Captura
      </Link>
    </div>
  );
}
