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
  Image as ImageIcon,
  Trash2,
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
import { databases, appwriteConfig, storage } from "@/hooks/appwrite_config";
import { Query, ID } from "appwrite";
import Image from "next/image";

export default function NotificationManagementPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserSelectOpen, setIsUserSelectOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [notificationImage, setNotificationImage] = useState(null);
  const [notificationImagePreview, setNotificationImagePreview] = useState("");
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(true);
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    targetType: "all", // all, clients, freelancers, specific
    scheduleEnabled: false,
    scheduleDate: "",
    scheduleTime: "",
    location: "/home", // Default location
  });

  // Available notification locations
  const notificationLocations = [
    { value: "/home", label: "Home Page" },
    { value: "/client-home", label: "Client Home" },
    { value: "/freelancer-home", label: "Freelancer Home" },
    { value: "/dashboard", label: "Dashboard" },
    { value: "/jobs", label: "Jobs Page" },
  ];

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "Error",
          description: "Image size should be less than 5MB",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please upload only image files",
        });
        return;
      }

      setNotificationImage(file);
      const imageUrl = URL.createObjectURL(file);
      setNotificationImagePreview(imageUrl);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setNotificationImage(null);
    setNotificationImagePreview("");
  };

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

  // Fetch scheduled notifications
  const fetchScheduledNotifications = async () => {
    try {
      setIsLoadingScheduled(true);
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        [
          Query.equal('status', 'scheduled'),
          Query.greaterThan('schedule_date', new Date().toISOString()),
          Query.orderAsc('schedule_date'),
        ]
      );
      setScheduledNotifications(response.documents);
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load scheduled notifications.",
      });
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  // Delete scheduled notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notificationId
      );

      // Remove from local state
      setScheduledNotifications(prev => 
        prev.filter(notification => notification.$id !== notificationId)
      );

      toast({
        title: "Success",
        description: "Scheduled notification deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notification.",
      });
    }
  };

  // Fetch scheduled notifications on mount
  useEffect(() => {
    fetchScheduledNotifications();
  }, []);

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

      // Upload image if present
      let imageUrl = null;
      if (notificationImage) {
        const fileUpload = await storage.createFile(
          appwriteConfig.notificationBucketId,
          ID.unique(),
          notificationImage
        );
        imageUrl = storage.getFileView(appwriteConfig.notificationBucketId, fileUpload.$id);
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
        image_url: imageUrl,
        location: notificationData.location,
      };

      // Create notification document in database
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        ID.unique(),
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
        location: "/home",
      });
      setSelectedUsers([]);
      setNotificationImage(null);
      setNotificationImagePreview("");

      // After successful creation, refresh the scheduled notifications list
      if (notificationData.scheduleEnabled) {
        await fetchScheduledNotifications();
      }
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

  // Format date for display
  const formatScheduleDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
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
                <Label>Location</Label>
                <Select
                  value={notificationData.location}
                  onValueChange={(value) =>
                    setNotificationData({ ...notificationData, location: value })
                  }
                >
                  <SelectTrigger className="border-purple-200">
                    <SelectValue placeholder="Select notification location" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationLocations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Notification Image (Optional)</Label>
                <div className="mt-2">
                  {!notificationImage ? (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-200 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-8 h-8 mb-2 text-purple-500" />
                          <p className="mb-2 text-sm text-purple-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-purple-500">PNG, JPG or GIF (MAX. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <Image
                        src={notificationImagePreview}
                        alt="Notification preview"
                        width={300}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
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
                  <div className="space-y-1 flex-1">
                    <h3 className="font-medium">
                      {notificationData.title || "Notification Title"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {notificationData.message || "Notification message will appear here"}
                    </p>
                    {notificationImagePreview && (
                      <div className="mt-2">
                        <Image
                          src={notificationImagePreview}
                          alt="Notification preview"
                          width={200}
                          height={150}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
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
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Location:</span>
                      <Badge variant="outline" className="text-xs">
                        {notificationLocations.find(loc => loc.value === notificationData.location)?.label || notificationData.location}
                      </Badge>
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

      {/* Scheduled Notifications Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-black">
            Scheduled Notifications
          </h2>
          <Button
            variant="outline"
            onClick={fetchScheduledNotifications}
            className="border-purple-200 hover:bg-purple-50"
          >
            Refresh
          </Button>
        </div>

        <div className="rounded-xl border border-purple-200 bg-white shadow-sm overflow-hidden">
          {isLoadingScheduled ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          ) : scheduledNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No scheduled notifications found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50 border-b border-purple-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Message</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Target</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-purple-900">Scheduled For</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-purple-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-200">
                  {scheduledNotifications.map((notification) => (
                    <tr key={notification.$id} className="hover:bg-purple-50/50">
                      <td className="px-4 py-3 text-sm text-purple-900">{notification.title}</td>
                      <td className="px-4 py-3 text-sm text-purple-700">
                        {notification.message.length > 50
                          ? `${notification.message.substring(0, 50)}...`
                          : notification.message}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">
                          {notification.target_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {notificationLocations.find(loc => loc.value === notification.location)?.label || notification.location}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-purple-700">
                        {formatScheduleDate(notification.schedule_date)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.$id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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