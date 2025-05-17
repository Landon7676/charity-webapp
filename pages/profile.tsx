import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [donorData, setDonorData] = useState<any>(null);
  const [recipientData, setRecipientData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return router.push("/login");

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setRole(data.role || null);

        if (data.role === "donor") {
          setDonorData(data.donorProfile || { childCount: 1, ageRange: "", genderPref: "" });
        } else if (data.role === "recipient") {
          setRecipientData(
            data.familyProfile || {
              children: [
                { age: "", gender: "", wishlist: { large: "", medium: "", small: "" } },
              ],
            }
          );
        }
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      donorProfile: donorData,
    });

    alert("Donor profile updated!");
  };

  const handleRecipientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      familyProfile: recipientData,
    });

    alert("Recipient profile updated!");
  };

  if (loading) return <div className="p-4">Loading profile...</div>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 shadow-md rounded w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>

        {role === "donor" && donorData && (
          <form onSubmit={handleDonorSubmit}>
            <label className="block mb-2 font-medium">Children to buy for</label>
            <input
              type="number"
              value={donorData.childCount}
              min="1"
              onChange={(e) =>
                setDonorData({ ...donorData, childCount: parseInt(e.target.value) })
              }
              className="w-full p-2 border rounded mb-4"
              required
            />

            <label className="block mb-2 font-medium">Preferred Age Range</label>
            <input
              type="text"
              value={donorData.ageRange}
              onChange={(e) => setDonorData({ ...donorData, ageRange: e.target.value })}
              className="w-full p-2 border rounded mb-4"
              placeholder="e.g., 5-10"
            />

            <label className="block mb-2 font-medium">Preferred Gender</label>
            <select
              value={donorData.genderPref}
              onChange={(e) => setDonorData({ ...donorData, genderPref: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">No preference</option>
              <option value="male">Boys</option>
              <option value="female">Girls</option>
            </select>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Save Donor Profile
            </button>
          </form>
        )}

        {role === "recipient" && recipientData && (
          <form onSubmit={handleRecipientSubmit}>
            {recipientData.children.map((child: any, i: number) => (
              <div key={i} className="mb-6 border p-4 rounded">
                <h3 className="font-semibold mb-2">Child {i + 1}</h3>

                <label className="block mb-1 font-medium">Age</label>
                <input
                  type="text"
                  value={child.age}
                  onChange={(e) => {
                    const updated = [...recipientData.children];
                    updated[i].age = e.target.value;
                    setRecipientData({ children: updated });
                  }}
                  className="w-full p-2 border rounded mb-2"
                  required
                />

                <label className="block mb-1 font-medium">Gender</label>
                <select
                  value={child.gender}
                  onChange={(e) => {
                    const updated = [...recipientData.children];
                    updated[i].gender = e.target.value;
                    setRecipientData({ children: updated });
                  }}
                  className="w-full p-2 border rounded mb-2"
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Boy</option>
                  <option value="female">Girl</option>
                </select>

                <label className="block mb-1 font-medium">Wishlist Items</label>
                <input
                  type="text"
                  placeholder="Large item"
                  value={child.wishlist.large}
                  onChange={(e) => {
                    const updated = [...recipientData.children];
                    updated[i].wishlist.large = e.target.value;
                    setRecipientData({ children: updated });
                  }}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Medium item"
                  value={child.wishlist.medium}
                  onChange={(e) => {
                    const updated = [...recipientData.children];
                    updated[i].wishlist.medium = e.target.value;
                    setRecipientData({ children: updated });
                  }}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Small item"
                  value={child.wishlist.small}
                  onChange={(e) => {
                    const updated = [...recipientData.children];
                    updated[i].wishlist.small = e.target.value;
                    setRecipientData({ children: updated });
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Save Recipient Profile
            </button>
          </form>
        )}

        {!role && <div className="text-center">No role found in profile.</div>}
      </div>
    </main>
  );
}
