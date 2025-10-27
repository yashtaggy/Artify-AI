import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, // New import for manual sign-up
  updateProfile // Import to set display name
} from "firebase/auth";
import { db, auth } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

// --- GOOGLE SIGN IN (Existing Function) ---
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

    // Save locally (Note: Firestore is recommended over localStorage for persistence)
    localStorage.setItem("currentUser", JSON.stringify(userData));

    return { success: true, user: userData };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return { success: false, error };
  }
};


// --- EMAIL/PASSWORD SIGN UP (New Function to Fix the Issue) ---

/**
 * Handles user sign-up using email and password, creating the Firebase Auth record
 * which then triggers the Cloud Function for the welcome email.
 * It also initializes the user's Firestore profile data.
 * * @param name The user's desired display name.
 * @param email The user's email address.
 * @param password The user's password.
 */
export const signUpWithEmail = async (name: string, email: string, password: string) => {
  try {
    // 1. CREATE USER: This is the critical step that triggers the Cloud Function
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. UPDATE PROFILE: Set the display name (optional but good practice)
    await updateProfile(user, { displayName: name });

    const uid = user.uid;
    const userDocRef = doc(db, "users", uid); 

    let userData: any = {
      name,
      email,
      uid,
      photoURL: "", // Manual sign-up users don't have a photoURL by default
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

    // 3. INITIALIZE FIRESTORE PROFILE: Save new user using UID as doc ID
    await setDoc(userDocRef, userData);
    userData.id = uid;

    // Save locally
    localStorage.setItem("currentUser", JSON.stringify(userData));

    return { success: true, user: userData };
  } catch (error) {
    // Log detailed error messages for common issues (e.g., weak-password)
    console.error("Email/Password Sign-Up Error:", error);
    return { success: false, error };
  }
};
