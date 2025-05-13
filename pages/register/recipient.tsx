import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

// Make sure to export as default function
export default function RecipientRegistration() {
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [childCount, setChildCount] = useState(1);
  const [error, setError] = useState("");
  const router = useRouter();

  const validZipCodes = ["48188", "48187"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to continue");
      return;
    }

    const cleanZip = postalCode.trim();
    if (!validZipCodes.includes(cleanZip)) {
      setError("We currently only serve Canton, MI (48187, 48188)");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        recipientProfile: {
          address: address.trim(),
          postalCode: cleanZip,
          childCount,
          qualified: true,
          lastUpdated: new Date()
        }
      });
      router.push("/dashboard");
    } catch (err) {
      setError("Submission failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Recipient Registration</h2>
        
        {/* Form fields remain the same as before */}
        {/* ... rest of your form code ... */}
      </form>
    </main>
  );
}