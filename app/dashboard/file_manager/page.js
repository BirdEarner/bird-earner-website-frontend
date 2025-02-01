"use client";
import { Upload, Search, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/AuthContext";
import { useEffect, useState } from "react";
import { appwriteConfig, databases } from "@/hooks/appwrite_config";
import { Query } from "appwrite";

export default function UploadsPage() {
  const { userData, role } = useAuth();
  const [fileData, setFileData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getFiles() {
      if (!userData || !userData.$id || !role || !role.active) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let query = [];
        
        if (role.active === "client") {
          query = [Query.equal("reciever_user_id", [`${userData.$id}`])];
        } else if (role.active === "freelancer") {
          query = [Query.equal("sender_user_id", [`${userData.$id}`])];
        } else {
          setIsLoading(false);
          return;
        }

        const files = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.file_managementCollectionID,
          query
        );

        setFileData(files.documents);
      } catch (error) {
        console.error("Error fetching files:", error);
        setFileData([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    }

    getFiles();
  }, [userData, role]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-sm text-purple-600">Loading files...</p>
        </div>
      </div>
    );
  }

  // Show message when no files are found
  if (!isLoading && fileData.length === 0) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-purple-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No Files Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {role.active === "client" ? 
              "You haven't received any files yet." : 
              "You haven't uploaded any files yet."}
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
            {role.active === "client" ? "Received Files" : "Uploaded Files"}
          </h1>
          <p className="text-black/70">
            {role.active === "client" ? 
              "View files received from freelancers." : 
              "Manage your uploaded files. Files are automatically deleted after 10 days."}
          </p>
        </div>
        {role.active === "freelancer" && (
          <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Upload className="h-4 w-4" />
            Upload New
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
          <Input
            placeholder="Search uploads..."
            className="pl-8 border-purple-200 focus-visible:ring-purple-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-purple-200 bg-white shadow-sm">
        {fileData.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-purple-100 p-4 last:border-0 hover:bg-purple-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-black">{file.file_name}</h3>
                <p className="text-sm text-black/70">Sent to {file.client}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-black">{file.size}</p>
                <p className="text-sm text-black/70">
                  Expires in {file.expiresIn}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-purple-600 hover:bg-purple-100 hover:text-purple-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
