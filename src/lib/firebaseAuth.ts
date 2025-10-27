import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { db, auth } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const name = user.displayName || "";
    const email = user.email || "";
    const uid = user.uid;
    const photoURL = user.photoURL || "";

    const userDocRef = doc(db, "users", uid); // Use UID as doc ID
    const docSnap = await getDoc(userDocRef);

    let userData: any = {
      name,
      email,
      uid,
      photoURL,
      bio: "",
      category: "",
      portfolioURL: "",
      studioLocation: "",
      yearsOfPractice: "",
      achievements: "",
      socialLinks: "",
      createdAt: new Date(),
      completedProfile: false,
    };

    if (docSnap.exists()) {
      const data = docSnap.data();
      userData = {
        id: uid,
        ...userData,
        bio: data.bio || "",
        category: data.category || "",
        portfolioURL: data.portfolioURL || "",
        studioLocation: data.studioLocation || "",
        yearsOfPractice: data.yearsOfPractice || "",
        achievements: data.achievements || "",
        socialLinks: data.socialLinks || "",
        completedProfile: data.completedProfile ?? false,
        photoURL: data.photoURL || photoURL,
      };
    } else {
      // Save new user using UID as doc ID
      await setDoc(userDocRef, userData);
      userData.id = uid;
    }

    // Save locally
    localStorage.setItem("currentUser", JSON.stringify(userData));

    return { success: true, user: userData };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return { success: false, error };
  }
};
