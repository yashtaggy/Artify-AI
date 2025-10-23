import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const name = user.displayName || "";
    const email = user.email || "";
    const uid = user.uid;
    const photoURL = user.photoURL || "";

    const usersRef = collection(db, "users");

    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

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

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userData = {
          id: doc.id,
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
      });
    } else {
      const docRef = await addDoc(usersRef, userData);
      userData.id = docRef.id;
    }

    localStorage.setItem("currentUser", JSON.stringify(userData));

    return { success: true, user: userData };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return { success: false, error };
  }
};
