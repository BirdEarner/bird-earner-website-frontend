'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NotFoundContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50/50 p-4">
      <motion.div 
        className="w-full max-w-md space-y-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-purple-900 mb-4">
            <Image
              src="/bird.png"
              alt="Bird Logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-purple-600">404</h1>
          <h2 className="text-2xl font-semibold text-black">Page Not Found</h2>
          <p className="text-black/70">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          {/* Back to Home Button */}
          <div>
            <Link href="/dashboard" passHref>
              <Button
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Additional Links */}
          <div className="flex justify-center gap-4 text-sm text-black/70">
            <Link href="/sign-in" className="hover:text-purple-600">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 