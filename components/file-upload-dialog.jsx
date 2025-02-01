"use client";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { appwriteConfig, databases, uploadFile } from "@/hooks/appwrite_config";
import { ID } from "appwrite";
import { useAuth } from "@/hooks/AuthContext";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

export function FileUploadDialog({
  open,
  onOpenChange,
  selectedUser,
  clientName,
}) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { userData } = useAuth();
  const { toast } = useToast();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

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

  const handleUpload = async () => {
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
          reciever_user_id: selectedUser.user.$id,
          file_id: fileId,
          bucket_id: bucketId,
          file_name: file.name,
          file_size: file.size,
          file_link: fileUrl,
          file_type: file.type,
          job_id: selectedUser.$id,
        }
      );

      setUploadProgress(100);
      
      toast({
        title: "Upload Complete",
        description: `${file.name} has been successfully uploaded to ${clientName}`,
        variant: "success",
      });

      setTimeout(() => {
        setFile(null);
        setIsUploading(false);
        setUploadProgress(0);
        onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Send a file to {clientName}. The file will be automatically deleted
            after 10 days.
          </DialogDescription>
        </DialogHeader>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-4 rounded-lg border-2 border-dashed p-4 text-center ${
            isDragging ? "border-primary bg-primary/10" : "border-border"
          }`}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop your file here, or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            Only ZIP files up to 100MB are allowed
          </p>
          <input
            type="file"
            accept=".zip"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => document.getElementById("file-upload").click()}
            disabled={isUploading}
          >
            Select File
          </Button>
        </div>

        {file && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Selected File:</p>
            <div className="flex items-center justify-between rounded-md border border-border p-2">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <DialogFooter>
          <Button
            type="submit"
            disabled={!file || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
