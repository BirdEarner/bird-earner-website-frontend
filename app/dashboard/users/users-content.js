"use client";

import { useEffect, useState } from "react";
import { Users, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { useAuth } from "@/hooks/AuthContext";
import { appwriteConfig, databases } from "@/hooks/appwrite_config";
import { Query } from "appwrite";
import { useSearchParams } from 'next/navigation';

export default function UsersContent() {
  const searchParams = useSearchParams();
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [linkedUsersData, setLinkedUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { role } = useAuth();

  useEffect(() => {
    async function getUsers() {
      if (!role || !role.active) {
        console.log("Missing role or active role");
        setIsLoading(false);
        return;
      }

      const currentUserData = role.active === "client" ? role.clientData : role.freelancerData;
      
      if (!currentUserData || !currentUserData.$id) {
        console.log("Missing user data:", { currentUserData });
        setIsLoading(false);
        return;
      }

      console.log("Current role:", role.active);
      console.log("Current user data:", currentUserData);

      try {
        setIsLoading(true);
        let activejobs;

        if (role.active === "client") {
          // First, let's get all jobs for this client
          console.log("Fetching jobs for client ID:", currentUserData.$id);
          
          activejobs = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.jobCollectionID,
            [
              Query.equal("job_created_by", currentUserData.$id),
              Query.isNotNull("assigned_freelancer")
            ]
          );

          console.log("All jobs found:", activejobs.documents);

          // Get all jobs that have assigned freelancers
          const jobsWithFreelancers = activejobs.documents.filter(job => job.assigned_freelancer);
          console.log("Jobs with assigned freelancers:", jobsWithFreelancers);

          // Get unique freelancer IDs
          const allUserIds = jobsWithFreelancers.map(job => job.assigned_freelancer);
          const userids = [...new Set(allUserIds)];
          console.log("Unique freelancer IDs:", userids);

          if (userids.length === 0) {
            console.log("No freelancer IDs found");
            setLinkedUsersData([]);
            return;
          }

          // Get freelancers one by one and log each attempt
          const freelancers = [];
          for (const id of userids) {
            try {
              console.log("Fetching freelancer with ID:", id);
              const freelancer = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.freelancerCollectionId,
                id
              );
              console.log("Successfully fetched freelancer:", freelancer);
              freelancers.push(freelancer);
            } catch (error) {
              console.error(`Error fetching freelancer ${id}:`, error);
            }
          }

          console.log("All fetched freelancers:", freelancers);

          // Map jobs to freelancers
          const mappedJobs = jobsWithFreelancers.map(job => {
            const freelancer = freelancers.find(f => f.$id === job.assigned_freelancer);
            if (freelancer) {
              console.log("Mapping job to freelancer:", { job: job.title, freelancer: freelancer.full_name });
              return {
                ...job,
                user: freelancer,
                status: "active"
              };
            }
            return null;
          }).filter(Boolean);

          console.log("Final mapped jobs:", mappedJobs);
          setLinkedUsersData(mappedJobs);
        } else if (role.active === "freelancer") {
          // If user is freelancer, get jobs where they are assigned
          console.log("Fetching jobs for freelancer ID:", currentUserData.$id);
          
          activejobs = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.jobCollectionID,
            [
              Query.equal("assigned_freelancer", currentUserData.$id),
              Query.equal("completed_status", false)
            ]
          );

          console.log("All jobs found:", activejobs.documents);

          if (activejobs.documents.length === 0) {
            console.log("No jobs found");
            setLinkedUsersData([]);
            return;
          }

          // Get unique client IDs from jobs
          const allUserIds = activejobs.documents.map(job => job.job_created_by);
          const userids = [...new Set(allUserIds)];
          console.log("Unique client IDs:", userids);

          // Get clients one by one and log each attempt
          const clients = [];
          for (const id of userids) {
            try {
              console.log("Fetching client with ID:", id);
              const client = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.clientCollectionId,
                id
              );
              console.log("Successfully fetched client:", client);
              clients.push(client);
            } catch (error) {
              console.error(`Error fetching client ${id}:`, error);
            }
          }

          console.log("All fetched clients:", clients);

          // Map jobs to clients
          const mappedJobs = activejobs.documents.map(job => {
            const client = clients.find(c => c.$id === job.job_created_by);
            if (client) {
              console.log("Mapping job to client:", { job: job.title, client: client.full_name });
              return {
                ...job,
                user: client,
                status: "active"
              };
            }
            return null;
          }).filter(Boolean);

          console.log("Final mapped jobs:", mappedJobs);
          setLinkedUsersData(mappedJobs);
        }
      } catch (error) {
        console.error("Error in getUsers:", error);
        setLinkedUsersData([]);
      } finally {
        setIsLoading(false);
      }
    }

    getUsers();
  }, [role]);

  // Filter users based on search query
  const filteredUsers = linkedUsersData.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.title.toLowerCase().includes(searchLower) ||
      user.user.full_name.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-sm text-purple-600">Loading users...</p>
        </div>
      </div>
    );
  }

  // Show message when no users are found
  if (!isLoading && linkedUsersData.length === 0) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-purple-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No Users Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {role.active === "client" ? 
              "You don't have any assigned freelancers yet." : 
              "You don't have any active clients yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-purple-50/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-black">
            {role.active === "client" ? "Freelancers" : "Clients"}
          </h1>
          <p className="text-black/70">
            {role.active === "client" ? 
              "Manage your freelancers and their projects." : 
              "View your clients and their projects."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
          <Input
            placeholder={`Search ${role.active === "client" ? "freelancers" : "clients"}...`}
            className="pl-8 border-purple-200 focus-visible:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Users className="mx-auto h-12 w-12 text-purple-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {searchQuery ? "No matching users found" : "No Users Found"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery 
                ? "Try adjusting your search terms"
                : role.active === "client" 
                  ? "You don't have any assigned freelancers yet."
                  : "You don't have any active clients yet."}
            </p>
          </div>
        ) : (
          filteredUsers.map((element, index) => (
            <div
              key={index}
              className="relative rounded-xl border border-purple-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-purple-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">{element.title}</h3>
                    <p className="text-sm text-black/70">
                      {element.user.full_name}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="gap-2 bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setSelectedClient(element);
                    setIsDialogOpen(true);
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Send Files
                </Button>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-black/70">
                  Created At: {new Date(element.created_at).toLocaleDateString()}
                </span>
                <span
                  className={`capitalize ${
                    element.status === "active"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {element.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <FileUploadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedUser={selectedClient}
        clientName={selectedClient?.title}
      />
    </div>
  );
} 