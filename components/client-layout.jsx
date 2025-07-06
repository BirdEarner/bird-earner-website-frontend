"use client";

import { AuthProvider } from "@/hooks/AuthContext";
import { AdminAuthProvider } from "@/hooks/AdminAuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Loader } from "@/components/ui/loader";
import { useLoader } from "@/hooks/useLoader";
import { useEffect, useState, Suspense } from "react";

function ClientLayoutContent({ children }) {
  const { isLoading } = useLoader();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Loader isLoading={!mounted || isLoading} />
        {mounted && children}
        <Toaster />
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export function ClientLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </Suspense>
  );
} 