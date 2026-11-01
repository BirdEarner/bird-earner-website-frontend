"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy / misspelled nav target — keep the URL working. */
export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
    </div>
  );
}
