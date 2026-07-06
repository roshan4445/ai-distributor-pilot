import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dealers")({
  component: () => <Outlet />,
});
