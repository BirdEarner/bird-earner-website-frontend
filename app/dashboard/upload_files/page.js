"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { Upload, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { appwriteConfig, databases, uploadFile } from "@/hooks/appwrite_config";
import { ID, Query } from "appwrite";
import { useAuth } from "@/hooks/AuthContext";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

// Dynamically import the component that uses useSearchParams
const UploadFilesContent = dynamic(() => import('./upload-files-content'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

export default function UploadFilesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UploadFilesContent />
    </Suspense>
  );
} 