import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password · CareerPilot AI" }] }),
  component: () => <AuthPage mode="forgot" />,
});
