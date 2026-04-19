import { Navigate } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "../hooks/use-auth";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="accent.500" />
      </Center>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
