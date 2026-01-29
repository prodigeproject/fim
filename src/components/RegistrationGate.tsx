import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useRegistrationStatus } from "@/hooks/useRegistrationStatus";
import { Loader2 } from "lucide-react";

interface RegistrationGateProps {
  children: ReactNode;
}

export default function RegistrationGate({ children }: RegistrationGateProps) {
  const { isRegistrationOpen, isLoading } = useRegistrationStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If registration is closed, redirect to closed page
  if (!isRegistrationOpen) {
    return <Navigate to="/portal/closed" replace />;
  }

  return <>{children}</>;
}
