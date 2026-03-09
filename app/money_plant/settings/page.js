"use client";

import { useState } from "react";
import { Settings, Shield, Bell, User, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from "@/hooks/AdminAuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
    const { admin } = useAdminAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const formData = new FormData(e.target);
            const name = formData.get("name");
            const currentPassword = formData.get("current_password");
            const newPassword = formData.get("new_password");
            const confirmPassword = formData.get("confirm_password");

            const payload = {};
            if (name) payload.name = name;

            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword || !newPassword) {
                    throw new Error("Both current and new password are required for change");
                }
                if (newPassword !== confirmPassword) {
                    throw new Error("New passwords do not match");
                }
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            if (Object.keys(payload).length === 0) {
                setIsSaving(false);
                return;
            }

            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Failed to save settings");
            }

            toast({
                title: "Settings Saved",
                description: "Your preferences have been updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-6 bg-purple-50/50">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-black flex items-center gap-2">
                    <Settings className="h-8 w-8 text-purple-600" />
                    Settings
                </h1>
                <p className="text-black/70">
                    Manage your account preferences and system configuration.
                </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-purple-100/50 p-1">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:text-purple-600">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSave} className="mt-6 space-y-6">
                    <TabsContent value="profile" className="space-y-6">
                        <Card className="border-purple-100 shadow-sm">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details and public information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" name="name" defaultValue={admin?.name} className="border-purple-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" defaultValue={admin?.email} className="border-purple-200" disabled />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input id="role" defaultValue={admin?.role} className="border-purple-200 capitalize" disabled />
                                </div>
                            </CardContent>
                            <CardFooter className="bg-purple-50/30 border-t border-purple-100 px-6 py-4">
                                <Button type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                                    {isSaving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <Card className="border-purple-100 shadow-sm">
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <Input id="current_password" name="current_password" type="password" className="border-purple-200" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new_password">New Password</Label>
                                        <Input id="new_password" name="new_password" type="password" className="border-purple-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                                        <Input id="confirm_password" name="confirm_password" type="password" className="border-purple-200" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-purple-50/30 border-t border-purple-100 px-6 py-4">
                                <Button type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                                    <Lock className="h-4 w-4 mr-2" /> Update Password
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <Card className="border-purple-100 shadow-sm">
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Configure how you receive alerts and updates.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg border border-purple-100">
                                    <div className="space-y-0.5">
                                        <Label>New Payout Requests</Label>
                                        <p className="text-xs text-gray-500">Receive an email when a freelancer requests a withdrawal.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-purple-100">
                                    <div className="space-y-0.5">
                                        <Label>New Inquiries</Label>
                                        <p className="text-xs text-gray-500">Receive alerts for new contact form submissions.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg border border-purple-100">
                                    <div className="space-y-0.5">
                                        <Label>Security Alerts</Label>
                                        <p className="text-xs text-gray-500">Get notified about unusual login activity on your account.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </form>
            </Tabs>
        </div>
    );
}
