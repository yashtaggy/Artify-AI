import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export const saveGeneratedItem = async (
  userId: string,
  type: "story" | "trend" | "ad",
  content: {
    title?: string;
    imageUrl?: string;
    short?: string;
    long?: string;
  }
) => {
  console.log("⚙️ saveGeneratedItem called with:", { userId, type, content });

  if (!userId) {
    console.error("❌ No userId provided. Cannot save generated item.");
    return;
  }

  try {
    let finalImageUrl = content.imageUrl || "";
    console.log("📷 Checking image URL...");

    // Upload base64 image to Firebase Storage
    if (finalImageUrl.startsWith("data:image")) {
      console.log("📤 Uploading image to storage...");
      const imageRef = ref(storage, `users/${userId}/${Date.now()}.png`);
      await uploadString(imageRef, finalImageUrl, "data_url");
      finalImageUrl = await getDownloadURL(imageRef);
      console.log("✅ Image uploaded successfully:", finalImageUrl);
    } else {
      console.log("ℹ️ No base64 image detected, skipping upload.");
    }

    const userCollection = collection(db, "users", userId, "savedItems");
    console.log("🧾 Adding document to Firestore...");

    await addDoc(userCollection, {
      type,
      content: {
        imageUrl: finalImageUrl,
        short: content.short || "",
        long: content.long || "",
      },
      meta: {
        title: content.title || "Untitled Story",
      },
      createdAt: serverTimestamp(),
    });

    console.log("✅ Story saved successfully!");
  } catch (error) {
    console.error("❌ Error saving generated item:", error);
  }
};
