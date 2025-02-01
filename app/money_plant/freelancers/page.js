"use client";

import { useState, useEffect } from "react";
import { Search, Mail, MoreVertical, Ban, CheckCircle, DollarSign, Briefcase, GraduationCap, Star, MapPin, MessageSquare, Building2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

export default function FreelancersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { toast } = useToast();
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);

  useEffect(() => {
    async function fetchFreelancers() {
      try {
        setIsLoading(true);
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.freelancerCollectionId,
          [Query.orderDesc("created_at")]
        );

        // Fetch reviews and job assignments for each freelancer
        const freelancersWithDetails = await Promise.all(
          response.documents.map(async (freelancer) => {
            try {
              // Fetch reviews
              const reviews = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.reviewCollectionId,
                [Query.equal("receiverId", [freelancer.$id])]
              );

              // Calculate average rating
              const ratings = reviews.documents.map(review => parseFloat(review.rating) || 0);
              const averageRating = ratings.length > 0
                ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                : null;

              // Get reviewer details for each review
              const reviewsWithDetails = await Promise.all(
                reviews.documents.map(async (review) => {
                  try {
                    // Try to get the reviewer's details (could be either client or freelancer)
                    const reviewer = await databases.getDocument(
                      appwriteConfig.databaseId,
                      appwriteConfig.clientCollectionId,
                      review.giverId
                    ).catch(async () => {
                      // If not found in clients, try freelancers
                      return await databases.getDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.freelancerCollectionId,
                        review.giverId
                      );
                    });

                    return {
                      ...review,
                      reviewer: reviewer ? {
                        name: reviewer.full_name,
                        type: reviewer.$collectionId === appwriteConfig.clientCollectionId ? 'Client' : 'Freelancer'
                      } : null
                    };
                  } catch (error) {
                    console.error("Error fetching reviewer details:", error);
                    return review;
                  }
                })
              );

              // Fetch assigned jobs with client details
              const clientDetailsMap = new Map();
              await Promise.all(
                (freelancer.assigned_jobs || []).map(async (jobId) => {
                  try {
                    const job = await databases.getDocument(
                      appwriteConfig.databaseId,
                      appwriteConfig.jobCollectionID,
                      jobId
                    );

                    // Check if job exists and has a client reference
                    if (!job || !job.job_created_by) {
                      console.error("Job not found or missing creator reference:", jobId);
                      return;
                    }

                    // Only fetch client details if we haven't seen this client before
                    if (!clientDetailsMap.has(job.job_created_by)) {
                      const client = await databases.getDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.clientCollectionId,
                        job.job_created_by
                      );

                      clientDetailsMap.set(job.job_created_by, {
                        id: client.$id,
                        name: client.full_name,
                        email: client.email
                      });
                    }
                  } catch (error) {
                    console.error("Error fetching client details:", error);
                  }
                })
              );

              // Convert Map values to array for assignedClients
              const uniqueClientDetails = Array.from(clientDetailsMap.values());

              return {
                ...freelancer,
                reviews: reviewsWithDetails,
                averageRating,
                assignedClients: uniqueClientDetails
              };
            } catch (error) {
              console.error("Error fetching details:", error);
              return freelancer;
            }
          })
        );

        setFreelancers(freelancersWithDetails);
      } catch (error) {
        console.error("Error fetching freelancers:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch freelancers. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchFreelancers();
  }, []);

  const handleUpdateAvailability = async (freelancerId, newAvailability) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.freelancerCollectionId,
        freelancerId,
        {
          currently_available: newAvailability,
          updated_at: new Date().toISOString()
        }
      );

      setFreelancers(freelancers.map(freelancer =>
        freelancer.$id === freelancerId ? { ...freelancer, currently_available: newAvailability } : freelancer
      ));

      toast({
        title: "Success",
        description: `Freelancer ${newAvailability ? 'activated' : 'deactivated'} successfully`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating freelancer availability:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update freelancer status. Please try again.",
      });
    }
  };

  const filteredFreelancers = freelancers.filter(freelancer =>
    freelancer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    freelancer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFreelancers = filteredFreelancers.slice(startIndex, endIndex);

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
          <p className="text-sm text-purple-600">Loading freelancers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-purple-50/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-black">Freelancers</h1>
          <p className="text-black/70">
            Manage and monitor all freelancers on the platform.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
          <Input
            placeholder="Search freelancers..."
            className="pl-8 border-purple-200 focus-visible:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-purple-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-[1400px] lg:w-full">
            <thead>
              <tr className="border-b border-purple-200 bg-purple-50/50">
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Name</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Email</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Expertise</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Location</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Stats</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Assigned Clients</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Bank Details</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Earnings</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-purple-600">Status</th>
                <th className="px-3 py-2 text-right text-sm font-medium text-purple-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentFreelancers.map((freelancer) => (
                <tr key={freelancer.$id} className="border-b border-purple-100 last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {freelancer.profile_photo ? (
                        <img 
                          src={freelancer.profile_photo} 
                          alt={freelancer.full_name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {freelancer.full_name?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-black">{freelancer.full_name}</p>
                        <p className="text-xs text-gray-500">{freelancer.mobile_number || 'No phone'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-black">{freelancer.email}</td>
                  <td className="px-3  py-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-sm text-black">
                          {freelancer.role_designation?.join(", ") || "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-sm text-gray-600">
                          {freelancer.highest_qualification || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-sm text-black">
                        {[freelancer.city, freelancer.state, freelancer.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-black">
                          {freelancer.averageRating || "N/A"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-purple-600 hover:text-purple-700"
                          onClick={() => {
                            setSelectedFreelancer(freelancer);
                            setIsReviewsOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {freelancer.reviews?.length || 0} reviews
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">
                          Jobs: {freelancer.assigned_jobs?.length || 0}
                        </span>
                        <span className="text-xs text-red-500">
                          ({freelancer.cancelled_jobs?.length || 0} cancelled)
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:text-purple-700"
                      onClick={() => {
                        setSelectedFreelancer(freelancer);
                        setIsAssignmentsOpen(true);
                      }}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      {freelancer.assignedClients?.length || 0} clients
                    </Button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-black">
                          {freelancer.bankName || "Not provided"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                          Acc: {freelancer.accountNumber ? 
                            `${freelancer.accountNumber.toString().slice(0, -4)}****` : 
                            "Not provided"}
                        </p>
                        <p className="text-xs text-gray-500">
                          IFSC: {freelancer.ifscCode || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          ${freelancer.withdrawableAmount || 0}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>Total:</span>
                          <span className="font-medium text-black">
                            ${freelancer.totalEarnings || 0}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>Monthly:</span>
                          <span className="font-medium text-black">
                            ${freelancer.monthlyEarnings || 0}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        freelancer.currently_available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {freelancer.currently_available ? "Active" : "Inactive"}
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
                        <DropdownMenuItem className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>View Payouts</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2"
                          onClick={() => handleUpdateAvailability(freelancer.$id, !freelancer.currently_available)}
                        >
                          {freelancer.currently_available ? (
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

      {/* Reviews Dialog */}
      <Dialog open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Reviews for {selectedFreelancer?.full_name}</span>
              {selectedFreelancer?.averageRating && (
                <span className="flex items-center text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {selectedFreelancer.averageRating}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {selectedFreelancer?.reviews?.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No reviews yet</p>
            ) : (
              selectedFreelancer?.reviews?.map((review) => (
                <div 
                  key={`${review.$id}-${review.giverId}`} 
                  className="border border-purple-100 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium">{review.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.$createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.message_text || "No message provided"}</p>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span>From:</span>
                    {review.reviewer ? (
                      <>
                        <span className="font-medium text-purple-600">{review.reviewer.name}</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          {review.reviewer.type}
                        </span>
                      </>
                    ) : (
                      <span className="italic">Unknown reviewer</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignments Dialog */}
      <Dialog open={isAssignmentsOpen} onOpenChange={setIsAssignmentsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span>Assigned Clients for {selectedFreelancer?.full_name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {selectedFreelancer?.assignedClients?.length > 0 ? (
              selectedFreelancer.assignedClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-purple-50/50 border border-purple-100"
                >
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-purple-600">
                      {client.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-medium text-black">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No clients assigned yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 