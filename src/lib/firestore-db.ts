import { db } from "@/lib/firebase-config"; // Adjust to your Firebase initialization
import { doc, getDoc, setDoc, updateDoc, arrayUnion, query, collection, where, getDocs } from "firebase/firestore";
import { User, UserData } from "@/types/user"; // Adjust imports
import { Resume } from "@/types/resume"; // Adjust imports

export async function loadUser(clerkId: string): Promise<User | null> {
  const userRef = doc(db, "users", clerkId);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as User;
}

export async function saveUser(user: User): Promise<void> {
  const userRef = doc(db, "users", user.clerkId);
  await setDoc(userRef, user, { merge: true });
}

export async function updateUserData(
  clerkId: string,
  newUserData: UserData
): Promise<void> {
  const userRef = doc(db, "users", clerkId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }

  await updateDoc(userRef, {
    data: newUserData,
  });
}