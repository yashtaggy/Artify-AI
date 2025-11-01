// src/lib/saveGeneratedItem.ts
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Save a generated story/trend/ad item for a specific user in Firestore
 *
 * @param userId - Firebase UID or user's ID from localStorage
 * @param type - The type of content: "story" | "trend" | "ad"
 * @param content - The generated content (text or object)
 */
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
  if (!userId) {
    console.error("No userId provided. Cannot save generated item.");
    return;
  }

  try {
    const userCollection = collection(db, "users", userId, "savedItems");

    // ✅ Handle image URL safely
    let safeImageUrl = "";
    if (content.imageUrl) {
      safeImageUrl =
        content.imageUrl.length < 500
          ? content.imageUrl
          : "https://picsum.photos/seed/artify-default/600/400";
    } else {
      safeImageUrl = "https://picsum.photos/seed/artify-default/600/400";
    }

    // ✅ Match Firestore structure expected by dashboard
    await addDoc(userCollection, {
      type,
      content: {
        title: content.title || "Untitled Story",
        imageUrl: safeImageUrl,
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
