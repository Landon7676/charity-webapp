import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

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
      // Save initial family information
      await updateDoc(doc(db, "users", user.uid), {
        recipientProfile: {
          address: address.trim(),
          postalCode: cleanZip,
          childCount,
          qualified: true,
          lastUpdated: new Date(),
          children: [] // Initialize empty array for child details
        }
      });
      
      // Redirect to child details page with child count
      router.push(`/child-details?count=${childCount}`);
    } catch (err) {
      setError("Submission failed. Please try again.");
    }
  };

    return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Recipient Registration</h2>
        
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}

        {/* Street Address Input */}
        <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
            Street Address:
            </label>
            <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="123 Main St"
            required
            />
        </div>

        {/* ZIP Code Input */}
        <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
            ZIP Code:
            </label>
            <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="48188"
            maxLength={5}
            required
            />
            <p className="text-sm text-gray-500 mt-1">Must be in Canton, MI (48187 or 48188)</p>
        </div>

        {/* Number of Children Input */}
        <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
            Number of Children in Household:
            </label>
            <input
            type="number"
            min="1"
            value={childCount}
            onChange={(e) => setChildCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            />
        </div>

        <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
            Submit Application
        </button>
        </form>
    </main>
    );
}