import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function DonorDetails() {
  const [childCount, setChildCount] = useState(1);
  const [ageRange, setAgeRange] = useState("");
  const [genderPref, setGenderPref] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) return alert("User not logged in");

    await updateDoc(doc(db, "users", user.uid), {
      donorProfile: {
        childCount,
        ageRange,
        genderPref,
      },
    });

    router.push("/dashboard"); // or wherever you want to go next
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Donor Info</h2>

        <label className="block mb-2 text-sm font-medium">How many children are you looking to buy for?</label>
        <input
          type="number"
          min="1"
          value={childCount}
          onChange={(e) => setChildCount(parseInt(e.target.value))}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-2 text-sm font-medium">Preferred age range (optional)</label>
        <input
          type="text"
          placeholder="e.g., 5-10"
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2 text-sm font-medium">Preferred gender (optional)</label>
        <select
          value={genderPref}
          onChange={(e) => setGenderPref(e.target.value)}
          className="w-full p-2 border rounded mb-6"
        >
          <option value="">No preference</option>
          <option value="male">Boys</option>
          <option value="female">Girls</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
