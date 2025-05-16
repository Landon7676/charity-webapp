import { useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        // Get role from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const { role } = docSnap.data();
          if (role === "donor") {
            router.push("/donor");
          } else if (role === "recipient") {
            router.push("/family");
          } else {
            router.push("/login"); // fallback
          }
        } else {
          router.push("/login"); // fallback
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null; // optional: replace with spinner or loading message
}
