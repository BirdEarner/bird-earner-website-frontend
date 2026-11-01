"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, Shield, User } from "lucide-react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.birdearner";
const APP_STORE_URL =
  "https://apps.apple.com/us/app/birdearner/id6741027618";

export default function SettingsPage() {
  const { user, role, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <p className="text-muted-foreground">
          Please{" "}
          <Link href="/sign-in" className="text-purple-600 underline">
            sign in
          </Link>{" "}
          to manage your profile.
        </p>
      </div>
    );
  }

  const displayName =
    userData?.fullName ||
    userData?.full_name ||
    user.fullName ||
    user.name ||
    "—";
  const email = user.email || "—";
  const mobile = user.mobile || userData?.mobile_number || "—";
  const activeRole = role?.active || "—";
  const heading =
    userData?.profileHeading ||
    userData?.profile_heading ||
    userData?.companyName ||
    userData?.company_name ||
    "";

  return (
    <div className="flex-1 space-y-6 p-6 sm:p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Profile &amp; Settings</h1>
        <p className="text-muted-foreground">
          View your account details. Full profile editing is available in the
          BirdEarner mobile app.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <User className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">
                Signed in as{" "}
                <span className="font-medium capitalize text-purple-700">
                  {activeRole}
                </span>
                {role?.freelancer && role?.client ? " (dual role)" : ""}.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={displayName} readOnly className="bg-muted/40" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} readOnly type="email" className="bg-muted/40" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile</label>
              <Input value={mobile} readOnly className="bg-muted/40" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {role?.active === "client" ? "Company / title" : "Profile heading"}
              </label>
              <Input
                value={heading || "—"}
                readOnly
                className="bg-muted/40"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Shield className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Security</h2>
              <p className="text-sm text-muted-foreground">
                Two-factor authentication and trusted devices are managed in the
                mobile app.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-purple-200 bg-purple-50/60 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-600 p-2">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-xl font-semibold text-purple-900">
                  Edit profile in the app
                </h2>
                <p className="text-sm text-purple-700/80">
                  Update photos, services, bank details, and availability from
                  BirdEarner on your phone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="bg-gray-900 hover:bg-black">
                  <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                    Get it on Google Play
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-purple-300">
                  <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
                    Download on the App Store
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
