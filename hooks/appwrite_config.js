import { ID, Client, Account, Databases, Storage } from "appwrite";

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("671cc8860027b96d7f3d"); // Replace with your Project ID

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "671cc8860027b96d7f3d",
  databaseId: "671cc8b0001ff969ee76",
  freelancerCollectionId: "671cc8be00219424fe65",
  clientCollectionId: "671cceb9002cacc68e57",
  bucketId: "671d0e22001ee9f5b509",
  filesBucketId: "6769c9d1002a8bd22e16",
  file_managementCollectionID: "676a9e650026c1fd72d3",
  roleCollectionID: "6733184d001684b89a24",
  jobCollectionID: "673327260000fb1f8aed",
  messageCollectionID: "674f23ba0019a93a384f",
  paymentHistoryCollectionId: "6769187c002cd44cc156",
  withdrawalRequestsCollectionId: "677cd4020023da8571b7",
  reviewCollectionId: "676922e0000cae8e2c3f",
  adminCollectionId: "678809d40024a74f1b25"
};

export { client, account, appwriteConfig, databases, storage };

// Upload File
export async function uploadFile(
  file,
  isFile = true,
  type = "application/octet-stream"
) {
  if (!file) return;

  try {
    const uniqueID = ID.unique();
    console.log("hi 1");
    const uploadedFile = await storage.createFile(
      isFile ? appwriteConfig.filesBucketId : appwriteConfig.bucketId,
      uniqueID,
      file
    );
    console.log("hi 2");

    // Generate URL based on file type
    const fileUrl = await getFileURL(
      uniqueID,
      file.type,
      isFile ? appwriteConfig.filesBucketId : appwriteConfig.bucketId
    );

    return {
      fileUrl,
      fileId: uniqueID,
      bucketId: isFile ? appwriteConfig.filesBucketId : appwriteConfig.bucketId,
    };
  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw new Error(error);
  }
}

// Get File URL based on type
export async function getFileURL(fileId, mimeType, bucketId) {
  try {
    // Use getFilePreview for images and getFileView for other types
    let fileUrl;
    if (mimeType.startsWith("image")) {
      fileUrl = storage.getFilePreview(bucketId, fileId);
    } else {
      console.log("from downlkoad");

      fileUrl = storage.getFileDownload(bucketId, fileId);
    }

    if (!fileUrl) throw new Error("Failed to retrieve file URL");

    return fileUrl;
  } catch (error) {
    console.error("Error getting file URL:", error.message);
    throw new Error(error);
  }
}
