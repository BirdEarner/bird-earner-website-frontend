import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/client-layout";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from 'react';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Bird Earner",
  description: "Be BirdEARNER, Become Bread Earner!",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<LoadingSpinner />}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
