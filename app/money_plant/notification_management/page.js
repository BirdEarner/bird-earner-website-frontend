"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Users,
  Calendar,
  Clock,
  Search,
  Send,
  UserCheck,
  Briefcase,
  ChevronDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { databases, appwriteConfig } from "@/hooks/appwrite_config";
import { Query } from "appwrite";

export default function NotificationManagementPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserSelectOpen, setIsUserSelectOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    targetType: "all", // all, clients, freelancers, specific
    scheduleEnabled: false,
    scheduleDate: "",
    scheduleTime: "",
  });

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        
        // Fetch clients
        const clientsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.clientCollectionId
        );

        // Fetch freelancers
        const freelancersResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.freelancerCollectionId
        );

        // Combine and format users
        const allUsers = [
          ...clientsResponse.documents.map(client => ({
            id: client.$id,
            name: client.full_name,
            email: client.email,
            type: 'client'
          })),
          ...freelancersResponse.documents.map(freelancer => ({
            id: freelancer.$id,
            name: freelancer.full_name,
            email: freelancer.email,
            type: 'freelancer'
          }))
        ];

        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again.",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (user) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleSendNotification = async () => {
    setIsLoading(true);

    try {
      // Validate inputs
      if (!notificationData.title || !notificationData.message) {
        throw new Error("Please fill in all required fields");
      }

      if (notificationData.targetType === "specific" && selectedUsers.length === 0) {
        throw new Error("Please select at least one user");
      }

      if (
        notificationData.scheduleEnabled &&
        (!notificationData.scheduleDate || !notificationData.scheduleTime)
      ) {
        throw new Error("Please set both date and time for scheduled notification");
      }

      // Prepare notification data
      const notification = {
        title: notificationData.title,
        message: notificationData.message,
        target_type: notificationData.targetType,
        scheduled: notificationData.scheduleEnabled,
        schedule_date: notificationData.scheduleEnabled ? 
          `${notificationData.scheduleDate}T${notificationData.scheduleTime}:00.000Z` : null,
        recipients: notificationData.targetType === "specific" ? 
          selectedUsers.map(user => user.id) : [],
        status: notificationData.scheduleEnabled ? "scheduled" : "sent",
        created_at: new Date().toISOString(),
      };

      // Create notification document in database
      await databases.createDocument(
        appwriteConfig.databaseId,
        // You'll need to create a notifications collection in Appwrite
        "notifications", // Add this collection ID to appwrite_config.js
        "unique()",
        notification
      );

      toast({
        title: "Success",
        description: notificationData.scheduleEnabled
          ? "Notification scheduled successfully"
          : "Notification sent successfully",
      });

      // Reset form
      setNotificationData({
        title: "",
        message: "",
        targetType: "all",
        scheduleEnabled: false,
        scheduleDate: "",
        scheduleTime: "",
      });
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send notification. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-purple-50/50">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Notification Management
        </h1>
        <p className="text-black/70">
          Send notifications to users or schedule them for later
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Notification Form */}
        <div className="space-y-6">
          <div className="rounded-xl border border-purple-200 bg-white shadow-sm p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Title</Label>
                <Input
                  placeholder="Enter notification title"
                  value={notificationData.title}
                  onChange={(e) =>
                    setNotificationData({ ...notificationData, title: e.target.value })
                  }
                  className="border-purple-200 focus-visible:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Enter notification message"
                  value={notificationData.message}
                  onChange={(e) =>
                    setNotificationData({ ...notificationData, message: e.target.value })
                  }
                  className="min-h-[100px] border-purple-200 focus-visible:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label>Target Recipients</Label>
                <Select
                  value={notificationData.targetType}
                  onValueChange={(value) =>
                    setNotificationData({ ...notificationData, targetType: value })
                  }
                >
                  <SelectTrigger className="border-purple-200">
                    <SelectValue placeholder="Select target recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="clients">All Clients</SelectItem>
                    <SelectItem value="freelancers">All Freelancers</SelectItem>
                    <SelectItem value="specific">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User Selection Dialog */}
              {notificationData.targetType === "specific" && (
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUserSelectOpen(true)}
                    className="w-full border-purple-200 hover:bg-purple-50"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Select Users
                  </Button>

                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map((user) => (
                        <Badge
                          key={user.id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {user.name}
                          <button
                            onClick={() => handleUserRemove(user.id)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="schedule"
                    checked={notificationData.scheduleEnabled}
                    onCheckedChange={(checked) =>
                      setNotificationData({ ...notificationData, scheduleEnabled: checked })
                    }
                  />
                  <Label htmlFor="schedule">Schedule for later</Label>
                </div>

                {notificationData.scheduleEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={notificationData.scheduleDate}
                        onChange={(e) =>
                          setNotificationData({
                            ...notificationData,
                            scheduleDate: e.target.value,
                          })
                        }
                        className="border-purple-200 focus-visible:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={notificationData.scheduleTime}
                        onChange={(e) =>
                          setNotificationData({
                            ...notificationData,
                            scheduleTime: e.target.value,
                          })
                        }
                        className="border-purple-200 focus-visible:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSendNotification}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                    {notificationData.scheduleEnabled ? "Scheduling..." : "Sending..."}
                  </>
                ) : (
                  <>
                    {notificationData.scheduleEnabled ? (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Notification
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Notification
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="rounded-xl border border-purple-200 bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Preview</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">
                      {notificationData.title || "Notification Title"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {notificationData.message || "Notification message will appear here"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Recipients:</span>
                      {notificationData.targetType === "all" && (
                        <Badge variant="outline" className="text-xs">
                          All Users
                        </Badge>
                      )}
                      {notificationData.targetType === "clients" && (
                        <Badge variant="outline" className="text-xs">
                          All Clients
                        </Badge>
                      )}
                      {notificationData.targetType === "freelancers" && (
                        <Badge variant="outline" className="text-xs">
                          All Freelancers
                        </Badge>
                      )}
                      {notificationData.targetType === "specific" && (
                        <Badge variant="outline" className="text-xs">
                          {selectedUsers.length} Selected Users
                        </Badge>
                      )}
                    </div>
                    {notificationData.scheduleEnabled && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          Scheduled for:{" "}
                          {notificationData.scheduleDate &&
                            notificationData.scheduleTime &&
                            `${notificationData.scheduleDate} at ${notificationData.scheduleTime}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Selection Dialog */}
      <Dialog open={isUserSelectOpen} onOpenChange={setIsUserSelectOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900">
              Select Users
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 border-purple-200 focus-visible:ring-purple-500"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-lg cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        {user.type === "client" ? (
                          <Briefcase className="h-4 w-4 text-purple-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {user.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserSelectOpen(false)}
              className="border-purple-200 hover:bg-purple-50"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 