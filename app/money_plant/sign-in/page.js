"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function SuperAdminSignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // This is just for UI demonstration
    // In a real app, you would validate credentials against your backend
    if (formData.username === "admin" && formData.password === "password") {
      // Set authentication state in localStorage
      localStorage.setItem("superAdminAuth", "true");
      
      toast({
        title: "Success",
        description: "Welcome back, Super Admin!",
        variant: "success",
      });
      router.push("/money_plant/");
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50/50 p-4">
      <motion.div 
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-900 mb-4">
            <Image
              src="/bird.png"
              alt="Bird Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-black">Super Admin Access</h2>
          <p className="text-black/70">Enter your credentials to continue</p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Username</label>
              <Input
                required
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="border-purple-200 focus-visible:ring-purple-500"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Password</label>
              <Input
                required
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="border-purple-200 focus-visible:ring-purple-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Security Notice */}
        <div className="text-center text-sm text-black/70">
          <p>This is a secure area. Unauthorized access is prohibited.</p>
        </div>
      </motion.div>
    </div>
  );
} 