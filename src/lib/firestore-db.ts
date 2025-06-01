import { db } from "@/lib/firebase-config"; // Adjust to your Firebase initialization
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { User, UserData } from "@/types/user"; // Adjust imports
import { Resume } from "@/types/resume"; // Adjust imports
import { createStripeCustomer } from "@/lib/stripe-payment";

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

export async function findOrCreateUser(
  clerkId: string,
  emailAddress: string
): Promise<User> {
  let existingUser = await loadUser(clerkId);
  if (!existingUser) {
    const stripeId = await createStripeCustomer(emailAddress, clerkId);
    const newUser: User = {
      stripeId,
      clerkId,
      email: emailAddress,
      data: {
        profiles: [],
        paymentUsage: {
          planKey: "free",
          generationsUsed: 0,
        },
      },
    };
    await saveUser(newUser);
    return newUser;
  }
  return existingUser;
}
