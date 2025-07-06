"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Mail, Shield, User, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useAdminAuth } from "@/hooks/AdminAuthContext";
import { adminAuthApi } from "@/services/api";

export default function AdminManagementPage() {
  const { toast } = useToast();
  const { getToken, admin: currentAdmin } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoadingAdmins(true);
      const token = getToken();
      console.log('Fetching admins with token:', token); // Debug log
      const adminsList = await adminAuthApi.getAllAdmins(token);
      
      // Transform the data to match the expected format
      const transformedAdmins = adminsList.map(admin => ({
        id: admin.id,
        fullName: admin.name,
        email: admin.email,
        role: admin.role === 'superadmin' ? 'Super Admin' : 'Admin',
        lastActive: admin.updated_at || admin.created_at,
        status: 'active', // For now, assume all are active since we don't have this field in DB
      }));
      
      setAdmins(transformedAdmins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch admin list. Using fallback data.",
      });
      
      // Fallback: show current admin at least
      if (currentAdmin) {
        setAdmins([{
          id: currentAdmin.id,
          fullName: currentAdmin.name,
          email: currentAdmin.email,
          role: currentAdmin.role === 'superadmin' ? 'Super Admin' : 'Admin',
          lastActive: new Date().toISOString(),
          status: 'active',
        }]);
      }
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Call the backend API to create a new admin
      await adminAuthApi.signup(
        formData.fullName,
        formData.email,
        formData.password,
        'admin' // Default role is admin
      );

      toast({
        title: "Success",
        description: "Admin account created successfully.",
        variant: "success",
      });

      // Reset form and close dialog
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setIsDialogOpen(false);
      
      // Refresh the admin list
      await fetchAdmins();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create admin account.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      setIsLoading(true);
      const token = getToken();
      
      await adminAuthApi.deleteAdmin(token, adminId);

      toast({
        title: "Success",
        description: "Admin account deleted successfully.",
        variant: "success",
      });

      // Refresh the admin list
      await fetchAdmins();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete admin account.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-purple-50/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Admin Management
          </h1>
          <p className="text-black/70">
            Create and manage admin accounts for the platform.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Admin
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
          <Input
            placeholder="Search admins..."
            className="pl-8 border-purple-200 focus-visible:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-purple-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-200 bg-purple-50/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
                  Last Active
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-600">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-purple-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingAdmins ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                      <span className="ml-2 text-purple-600">Loading admins...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No admins found.
                  </td>
                </tr>
              ) : (
                currentItems.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-b border-purple-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">
                          {admin.fullName}
                        </p>
                        <p className="text-xs text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-black">{admin.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-black">
                    {new Date(admin.lastActive).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        admin.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {admin.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {admin.role !== "Super Admin" && admin.id !== currentAdmin?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={isLoading}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-600"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Admin</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-purple-200 bg-purple-50/50">
          <div className="flex items-center text-sm text-purple-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAdmins.length)} of {filteredAdmins.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-purple-200 hover:bg-purple-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <Button
                key={number}
                variant={currentPage === number ? "default" : "outline"}
                size="sm"
                onClick={() => paginate(number)}
                className={currentPage === number 
                  ? "bg-purple-600 hover:bg-purple-700" 
                  : "border-purple-200 hover:bg-purple-100"}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-purple-200 hover:bg-purple-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-900">
              Create New Admin
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-900">
                  Full Name
                </label>
                <Input
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Enter admin's full name"
                  className="focus-visible:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-900">
                  Email
                </label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter admin's email"
                  className="focus-visible:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-900">
                  Password
                </label>
                <Input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter password"
                  className="focus-visible:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-900">
                  Confirm Password
                </label>
                <Input
                  required
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm password"
                  className="focus-visible:ring-purple-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
                className="border-purple-200 hover:bg-purple-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Admin"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}