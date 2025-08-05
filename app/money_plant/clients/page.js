"use client";

import { useState, useEffect } from "react";
import { Search, Mail, MoreVertical, Ban, CheckCircle, Building, MapPin, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminClientApi, loadImageURI } from "@/services/api";

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    async function fetchClients() {
      try {
        setIsLoading(true);
        const response = await adminClientApi.getAllClients(currentPage, itemsPerPage, debouncedSearchQuery);

        if (response.success) {
          setClients(response.data.clients);
          // Update pagination info if provided
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages);
            setTotalItems(response.data.pagination.totalItems);
            setCurrentPage(response.data.pagination.currentPage);
          }
        } else {
          throw new Error(response.message || 'Failed to fetch clients');
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch clients. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchClients();
  }, [currentPage, debouncedSearchQuery]);

  const handleUpdateAvailability = async (clientId, newAvailability) => {
    try {
      const response = await adminClientApi.updateClientAvailability(clientId, newAvailability);

      if (response.success) {
        setClients(clients.map(client =>
          client.$id === clientId ? { ...client, currently_available: newAvailability } : client
        ));

        toast({
          title: "Success",
          description: `Client ${newAvailability ? 'activated' : 'deactivated'} successfully`,
          variant: "success",
        });
      } else {
        throw new Error(response.message || 'Failed to update client availability');
      }
    } catch (error) {
      console.error("Error updating client availability:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update client status. Please try again.",
      });
    }
  };

  // Since filtering and pagination are now handled by the backend,
  // we can use the clients directly without client-side filtering
  const currentClients = clients;

  // Function to generate page numbers array
  const getPageNumbers = (currentPage, totalPages) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-sm text-purple-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-purple-50/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-black">Clients</h1>
          <p className="text-black/70">
            Manage and monitor all clients on the platform.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
          <Input
            placeholder="Search clients..."
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
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Name</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Email</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Organization</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Location</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Assigned Freelancers</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">XP Level</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Status</th>
                <th className="px-3 py-2 text-right text-sm font-medium text-purple-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentClients.map((client) => (
                <tr key={client.$id} className="border-b border-purple-100 last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      {client.profile_photo ? (
                        <img 
                          src={loadImageURI(client.profile_photo)} 
                          alt={client.full_name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9.001 9.001 0 0112 15c2.21 0 4.21.805 5.879 2.146M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-black">{client.full_name}</p>
                        <p className="text-xs text-gray-500">{client.mobile_number || 'No phone'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-black">{client.email}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-black">
                        {client.organization_type || 'Individual'}
                        {client.company_name && ` - ${client.company_name}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-black">
                        {[client.city, client.state, client.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:text-purple-700"
                      onClick={() => {
                        setSelectedClient(client);
                        setIsAssignmentsOpen(true);
                      }}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      {client.assignedFreelancers?.length || 0} freelancers
                    </Button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-purple-600">Lvl {client.level || 1}</span>
                      <span className="text-xs text-gray-500">({client.XP || 0} XP)</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        client.currently_available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {client.currently_available ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>Contact</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2"
                          onClick={() => handleUpdateAvailability(client.$id, !client.currently_available)}
                        >
                          {client.currently_available ? (
                            <>
                              <Ban className="h-4 w-4" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Activate</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
              
              {getPageNumbers(currentPage, totalPages).map((page, index) => (
                <PaginationItem key={index}>
                  {page === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Assignments Dialog */}
      <Dialog open={isAssignmentsOpen} onOpenChange={setIsAssignmentsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span>Freelancers for {selectedClient?.full_name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {selectedClient?.assignedFreelancers?.length > 0 ? (
              selectedClient.assignedFreelancers.map((freelancer) => (
                <div
                  key={freelancer.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-purple-50/50 border border-purple-100"
                >
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-purple-600">
                      {freelancer.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-black">{freelancer.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        freelancer.status === 'Assigned' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {freelancer.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{freelancer.email}</p>
                    <div className="flex flex-wrap gap-1">
                      {freelancer.expertise?.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No freelancers yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 