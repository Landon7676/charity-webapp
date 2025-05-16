import { useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";

export default function RecipientForm() {
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [kidCount, setKidCount] = useState(1);
  const [ages, setAges] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [residenceFile, setResidenceFile] = useState<File | null>(null);
  const [childrenFile, setChildrenFile] = useState<File | null>(null);
  const [incomeFile, setIncomeFile] = useState<File | null>(null);
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
      const uploadedFiles: Record<string, string> = {};

      const uploadFile = async (file: File | null, label: string) => {
        if (!file) throw new Error(`${label} is missing.`);
        if (file.size > 10 * 1024 * 1024) throw new Error(`${label} must be under 10MB.`);
        if (file.type !== "application/pdf") throw new Error(`${label} must be a PDF.`);

        const fileRef = ref(storage, `recipients/${user.uid}/${label}.pdf`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        uploadedFiles[label] = url;
      };

      await uploadFile(residenceFile, "proof-of-residence");
      await uploadFile(childrenFile, "proof-of-children");
      await uploadFile(incomeFile, "proof-of-income");

      await updateDoc(doc(db, "users", user.uid), {
        recipientProfile: {
          address,
          zipCode,
          kidCount,
          ages,
          gender,
          documents: uploadedFiles,
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
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          Recipient Info
        </h2>

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

        <label className="block mb-2 text-sm font-medium">
          Upload Required Proof Documents (PDF only, max 10MB each)
        </label>

        <label className="block text-sm font-medium mb-1">Proof of Residence</label>
        <ul className="text-sm text-muted mb-4 list-disc ml-6">
          <li>CURRENT YEAR State of MI Dept of Human Services Letter with Canton address</li>
          <li>Driver's License or State ID (copy front & back)</li>
          <li>Rental Agreement or Tax Bill with Canton address</li>
          <li>Current Utility Bill with Canton address</li>
        </ul>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setResidenceFile(e.target.files?.[0] || null)}
          className="w-full mb-4"
          required
        />

        <label className="block text-sm font-medium mb-1">Proof Children Live With You</label>
        <ul className="text-sm text-muted mb-4 list-disc ml-6">
          <li>State of MI DHS Letter with children's names</li>
          <li>Custody or Guardianship papers</li>
          <li>Rental Agreement with children's names</li>
          <li>Student demographics page (not report cards)</li>
        </ul>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setChildrenFile(e.target.files?.[0] || null)}
          className="w-full mb-4"
          required
        />

        <label className="block text-sm font-medium mb-1">Proof of Income / Assistance</label>
        <ul className="text-sm text-muted mb-4 list-disc ml-6">
          <li>DHS Letter with income page</li>
          <li>Current Pay Stubs</li>
          <li>Social Security Docs (Adult & Child)</li>
          <li>Self Employment, Unemployment, Pension</li>
          <li>Alimony, Child Support, Food Assistance (no bridge card)</li>
        </ul>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setIncomeFile(e.target.files?.[0] || null)}
          className="w-full mb-6"
          required
        />

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
