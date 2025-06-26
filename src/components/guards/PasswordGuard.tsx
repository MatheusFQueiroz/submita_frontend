"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import { ROUTES } from "@/lib/utils";

interface PasswordGuardProps {
  children: React.ReactNode;
  bypassForPasswordReset?: boolean;
}

export function PasswordGuard({
  children,
  bypassForPasswordReset = false,
}: PasswordGuardProps) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.isFirstLogin && !bypassForPasswordReset) {
      router.push(ROUTES.RESET_PASSWORD);
    }
  }, [user, isLoading, bypassForPasswordReset, router]);

  // Se é primeira senha e não é bypass, não renderiza
  if (user?.isFirstLogin && !bypassForPasswordReset) {
    return null;
  }

  return <>{children}</>;
}
