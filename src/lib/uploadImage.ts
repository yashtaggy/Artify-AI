import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

export const uploadImage = async (userId: string, imageDataUrl: string) => {
  try {
    const storage = getStorage();
    const imageRef = ref(storage, `users/${userId}/images/${Date.now()}.jpg`);

    // Upload base64 image string
    await uploadString(imageRef, imageDataUrl, "data_url");

    // Get and return a download URL
    const downloadUrl = await getDownloadURL(imageRef);
    return downloadUrl;
  } catch (error) {
    console.error("❌ Image upload failed:", error);
    return null;
  }
};
