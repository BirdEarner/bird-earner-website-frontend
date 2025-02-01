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
import { databases, appwriteConfig } from "@/hooks/appwrite_config";
import { Query } from "appwrite";
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

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      try {
        setIsLoading(true);
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.clientCollectionId,
          [Query.orderDesc("created_at")]
        );

        // Fetch job assignments for each client
        const clientsWithDetails = await Promise.all(
          response.documents.map(async (client) => {
            try {
              // Fetch all jobs
              const jobs = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.jobCollectionID,
                [Query.equal("job_created_by", [client.$id])]
              );

              // Get all freelancers who applied or were assigned to the jobs
              const freelancerDetailsMap = new Map();
              await Promise.all(
                jobs.documents.flatMap(job => {
                  const allFreelancerIds = [
                    ...(job.applied_freelancers || []),
                    job.assigned_freelancer
                  ].filter(Boolean);
                  
                  return allFreelancerIds.map(async (freelancerId) => {
                    try {
                      // Only fetch freelancer details if we haven't seen this freelancer before
                      if (!freelancerDetailsMap.has(freelancerId)) {
                        const freelancer = await databases.getDocument(
                          appwriteConfig.databaseId,
                          appwriteConfig.freelancerCollectionId,
                          freelancerId
                        );

                        freelancerDetailsMap.set(freelancerId, {
                          id: freelancer.$id,
                          name: freelancer.full_name,
                          email: freelancer.email,
                          expertise: freelancer.role_designation,
                          status: freelancer.$id === job.assigned_freelancer ? 'Assigned' : 'Applied'
                        });
                      }
                    } catch (error) {
                      console.error("Error fetching freelancer details:", error);
                    }
                  });
                })
              );

              // Convert Map values to array for assignedFreelancers
              const uniqueFreelancerDetails = Array.from(freelancerDetailsMap.values());

              return {
                ...client,
                assignedFreelancers: uniqueFreelancerDetails
              };
            } catch (error) {
              console.error("Error fetching details:", error);
              return client;
            }
          })
        );

        setClients(clientsWithDetails);
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
  }, []);

  const handleUpdateAvailability = async (clientId, newAvailability) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.clientCollectionId,
        clientId,
        {
          currently_available: newAvailability,
          updated_at: new Date().toISOString()
        }
      );

      setClients(clients.map(client =>
        client.$id === clientId ? { ...client, currently_available: newAvailability } : client
      ));

      toast({
        title: "Success",
        description: `Client ${newAvailability ? 'activated' : 'deactivated'} successfully`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating client availability:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update client status. Please try again.",
      });
    }
  };

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

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
                          src={client.profile_photo} 
                          alt={client.full_name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {client.full_name?.charAt(0)}
                          </span>
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