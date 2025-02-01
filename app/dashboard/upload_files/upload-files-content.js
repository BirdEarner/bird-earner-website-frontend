"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";
import { Upload, X, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { appwriteConfig, databases, uploadFile } from "@/hooks/appwrite_config";
import { ID, Query } from "appwrite";
import { useAuth } from "@/hooks/AuthContext";
import { Input } from "@/components/ui/input";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

export default function UploadFilesContent() {
  const searchParams = useSearchParams();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { userData, role } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function getClients() {
      setIsLoading(true);
      try {
        console.log("Current role:", role.active);

        if (role.active === "freelancer") {
          const activejobs = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.jobCollectionID,
            [
              Query.equal("assigned_freelancer", [`${userData.$id}`]),
              Query.equal("completed_status", false),
              Query.isNotNull("assigned_freelancer"),
            ]
          );
          console.log("Active jobs:", activejobs.documents);

          const allUserIds = activejobs.documents.map(
            (job) => job.job_created_by
          );
          const userids = [...new Set(allUserIds)];
          console.log("Unique client IDs:", userids);

          if (userids.length === 0) {
            console.log("No clients found");
            return;
          }

          const clients = await Promise.all(
            userids.map(async (id) => {
              try {
                return await databases.getDocument(
                  appwriteConfig.databaseId,
                  appwriteConfig.clientCollectionId,
                  id
                );
              } catch (error) {
                console.error(`Error fetching client ${id}:`, error);
                return null;
              }
            })
          );
          console.log("Fetched clients:", clients);

          const mappedJobs = activejobs.documents.map(job => {
            const client = clients.find(c => c && c.$id === job.job_created_by);
            if (client) {
              return {
                ...job,
                user: client,
                status: "active"
              };
            }
            return null;
          }).filter(Boolean);

          console.log("Mapped jobs with clients:", mappedJobs);
          setClients(mappedJobs);
        } else {
          console.log("User is not a freelancer");
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Failed to load clients. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (userData && role) {
      getClients();
    }
  }, [userData, role, toast]);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  const handleFile = (newFile) => {
    if (!newFile) return;
    
    const isZip = newFile.type === "application/zip" || newFile.name.endsWith(".zip");
    const isUnderLimit = newFile.size <= 100 * 1024 * 1024; // 100MB

    if (isZip && isUnderLimit) {
      setFile(newFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a ZIP file under 100MB",
        variant: "destructive",
      });
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    return interval;
  };

  const handleUpload = async (client) => {
    if (!file) return;
    
    setIsUploading(true);
    const progressInterval = simulateProgress();

    try {
      const { fileUrl, fileId, bucketId } = await uploadFile(file);
      
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.file_managementCollectionID,
        ID.unique(),
        {
          sender_user_id: userData.$id,
          reciever_user_id: client.user.$id,
          file_id: fileId,
          bucket_id: bucketId,
          file_name: file.name,
          file_size: file.size,
          file_link: fileUrl,
          file_type: file.type,
          job_id: client.$id,
        }
      );

      setUploadProgress(100);
      
      toast({
        title: "Upload Complete",
        description: `${file.name} has been successfully uploaded to ${client.user.full_name}`,
        variant: "success",
      });

      setTimeout(() => {
        setFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
    }
  };

  // Filter clients based on search query
  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.title.toLowerCase().includes(searchLower) ||
      client.user.full_name.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Upload Files</h2>
          <p className="text-muted-foreground">
            Upload and manage your files here.
          </p>
        </div>
      </div>

      {/* Add search input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
          <Input
            placeholder="Search by title or client name..."
            className="pl-8 border-purple-200 focus-visible:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border bg-card">
          <div className="flex flex-col items-center justify-center space-y-4 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Upload Files</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop your files here
              </p>
            </div>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload").click()}
              disabled={isUploading}
            >
              Select Files
            </Button>
          </div>
        </div>

        {file && (
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Clients Section - Update to use filteredClients */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative rounded-xl border border-purple-200 bg-white p-6 shadow-sm"
                >
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 rounded bg-purple-100" />
                        <div className="h-3 w-32 rounded bg-purple-100" />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 w-24 rounded bg-purple-100" />
                      <div className="h-3 w-16 rounded bg-purple-100" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredClients.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Users className="mx-auto h-12 w-12 text-purple-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {searchQuery ? "No matching clients found" : "No Clients Found"}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search terms"
                  : "You don't have any active clients at the moment."}
              </p>
            </div>
          ) : (
            filteredClients.map((client, index) => (
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
                      <h3 className="font-semibold text-black">{client.title}</h3>
                      <p className="text-sm text-black/70">
                        {client.user.full_name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-black/70">
                    Created At: {new Date(client.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`capitalize ${
                      client.status === "active"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
                {file && !isUploading && (
                  <div className="mt-4">
                    <Button
                      onClick={() => handleUpload(client)}
                      className="w-full"
                    >
                      Upload to {client.user.full_name}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 