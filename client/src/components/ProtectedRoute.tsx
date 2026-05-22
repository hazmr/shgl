"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname]);

  if (isLoading) {
    return (
      <div>
        <div></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
