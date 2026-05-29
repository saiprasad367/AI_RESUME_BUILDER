import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "./login";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password · CareerPilot AI" }] }),
  component: () => <AuthPage mode="reset" />,
});
