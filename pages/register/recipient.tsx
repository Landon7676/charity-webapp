import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function RecipientForm() {
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [kidCount, setKidCount] = useState(1);
  const [ages, setAges] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!address.toLowerCase().includes("canton")) {
      setError("Address must be in Canton.");
      return;
    }

    if (zipCode !== "48187" && zipCode !== "48188") {
      setError("Zip code must be 48187 or 48188.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("User not logged in.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        recipientProfile: {
          address,
          zipCode,
          kidCount,
          ages,
          gender,
        },
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-card text-card-foreground border border-border shadow-md rounded-lg p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Recipient Info</h2>

        {error && <p className="text-destructive mb-4">{error}</p>}

        <label className="block mb-2 text-sm font-medium">Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-2 border border-border bg-background text-foreground rounded mb-4"
          placeholder="e.g. 123 Main St, Canton MI 48188"
          required
        />

        <label className="block mb-2 text-sm font-medium">Zip Code</label>
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="w-full p-2 border border-border bg-background text-foreground rounded mb-4"
          required
        />

        <label className="block mb-2 text-sm font-medium">Number of Children</label>
        <input
          type="number"
          value={kidCount}
          min={1}
          onChange={(e) => setKidCount(parseInt(e.target.value))}
          className="w-full p-2 border border-border bg-background text-foreground rounded mb-4"
          required
        />

        <label className="block mb-2 text-sm font-medium">Ages of Children</label>
        <input
          type="text"
          value={ages}
          onChange={(e) => setAges(e.target.value)}
          className="w-full p-2 border border-border bg-background text-foreground rounded mb-4"
          placeholder="e.g. 3, 7, 10"
          required
        />

        <label className="block mb-2 text-sm font-medium">Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full p-2 border border-border bg-background text-foreground rounded mb-6"
        >
          <option value="">N/A</option>
          <option value="male">Boys</option>
          <option value="female">Girls</option>
          <option value="both">Both</option>
        </select>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
