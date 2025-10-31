import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Saves a generated story (or other AI output) to Firestore
 * for the authenticated user.
 */
export const saveGeneratedItem = async (
  userId: string,
  type: "story" | "trend" | "ad",
  content: {
    title?: string;
    imageUrl?: string; // Direct image URL only
    short?: string;
    long?: string;
  }
) => {
  console.log("💾 Saving generated item:", { userId, type, content });

  if (!userId) throw new Error("User ID missing — cannot save story.");

  try {
    const userCollection = collection(db, "users", userId, "savedItems");
    await addDoc(userCollection, {
      type,
      content,
      createdAt: serverTimestamp(),
    });

    console.log("✅ Story saved successfully in Firestore!");
  } catch (error) {
    console.error("❌ Firestore save error:", error);
    throw error;
  }
};
