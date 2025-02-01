"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/AuthContext";
import { useToast } from "@/components/ui/use-toast";

function SignInContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, user, error, setError } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const sessionData = await login(formData.email, formData.password);
      if (sessionData) {
        toast({
          title: "Success",
          description: "Login successful! Redirecting...",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      setError(error.message);
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50/50 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <Image
                src="/bird.png"
                alt="Bird Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black">Welcome back</h1>
            <p className="text-sm text-black/70 mt-2">
              Sign in to your account to continue
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-purple-200">
            <div className="animate-pulse space-y-6">
              <div className="space-y-4">
                <div className="h-10 bg-purple-100/50 rounded-md" />
                <div className="h-10 bg-purple-100/50 rounded-md" />
              </div>
              <div className="h-10 bg-purple-100/50 rounded-md" />
              <div className="h-10 bg-purple-100/50 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50/50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-900 mb-4">
            <Image
              src="/bird.png"
              alt="Bird Logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Welcome back
          </h1>
          <p className="text-sm text-black/70 mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-purple-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-purple-500" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 border-purple-200 focus-visible:ring-purple-500"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-purple-500" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 border-purple-200 focus-visible:ring-purple-500"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-purple-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-black/70">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-purple-200 hover:bg-purple-50 gap-2"
              onClick={() => router.push("/dashboard")}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-black/70">
          Don&apos;t have an account?{" "}
          <a
            href="#"
            className="font-medium text-purple-600 hover:text-purple-700"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
