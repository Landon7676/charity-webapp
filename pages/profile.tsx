import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

type WishlistItem = { name: string; link?: string };
type Wishlist = { childId: number; items: WishlistItem[] };

type RecipientProfile = {
  kidCount: number;
  ages: string;
  gender: string;
  approved?: boolean;
};

type DonorProfile = {
  childCount: number;
  genderPref: string;
  ageRange: string;
};

export default function ProfilePage() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  // Recipient state
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [kidCount, setKidCount] = useState(0);

  // Donor state
  const [donorProfile, setDonorProfile] = useState<DonorProfile>({
    childCount: 0,
    genderPref: "",
    ageRange: "",
  });

  useEffect(() => {
    async function fetchData() {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data();

      if (!data) {
        setLoading(false);
        return;
      }

      setRole(data.role);

      if (data.role === "recipient") {
        const profile = data.recipientProfile as RecipientProfile;
        setKidCount(profile.kidCount);
        if (data.wishlists) {
          setWishlists(data.wishlists);
        } else {
          // Initialize empty wishlists if none
          const empty = Array.from({ length: profile.kidCount }, (_, i) => ({
            childId: i + 1,
            items: [],
          }));
          setWishlists(empty);
          await updateDoc(userRef, { wishlists: empty });
        }
      } else if (data.role === "donor") {
        const donorProf = data.donorProfile as DonorProfile;
        if (donorProf) {
          setDonorProfile(donorProf);
        }
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // Recipient Wishlist handlers
  const handleItemChange = (
    childId: number,
    index: number,
    field: keyof WishlistItem,
    value: string
  ) => {
    setWishlists((prev) =>
      prev.map((child) =>
        child.childId === childId
          ? {
              ...child,
              items: child.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
              ),
            }
          : child
      )
    );
  };

  const addItem = (childId: number) => {
    setWishlists((prev) =>
      prev.map((child) =>
        child.childId === childId
          ? { ...child, items: [...child.items, { name: "", link: "" }] }
          : child
      )
    );
  };

  const saveWishlist = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), { wishlists });
    alert("Wishlist saved!");
  };

  // Donor profile handlers
  const handleDonorChange = (
    field: keyof DonorProfile,
    value: string | number
  ) => {
    setDonorProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveDonorProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), { donorProfile });
    alert("Donor preferences saved!");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-wine">My Profile</h1>

      {/* Recipient Wishlist UI */}
      {role === "recipient" && (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-indigo">
            Your Wishlists
          </h2>
          {wishlists.map((child) => (
            <div
              key={child.childId}
              className="mb-6 bg-white p-6 border border-olive rounded shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-3">
                Child {child.childId}
              </h3>
              {child.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 mb-3">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(child.childId, idx, "name", e.target.value)
                    }
                    className="flex-1 border border-olive p-3 rounded"
                  />
                  <input
                    type="url"
                    placeholder="Optional link"
                    value={item.link}
                    onChange={(e) =>
                      handleItemChange(child.childId, idx, "link", e.target.value)
                    }
                    className="flex-1 border border-olive p-3 rounded"
                  />
                </div>
              ))}
              <button
                onClick={() => addItem(child.childId)}
                className="text-teal text-sm hover:underline"
              >
                + Add item
              </button>
            </div>
          ))}
          <button
            onClick={saveWishlist}
            className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground py-3 px-6 rounded"
          >
            Save Wishlist
          </button>
        </>
      )}

      {/* Donor Preferences UI */}
      {role === "donor" && (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-indigo">
            Your Preferences
          </h2>
          <div className="bg-white p-6 border border-olive rounded shadow-sm max-w-md">
            <label className="block mb-4">
              <span className="font-semibold">Number of Children</span>
              <input
                type="number"
                min={0}
                value={donorProfile.childCount}
                onChange={(e) =>
                  handleDonorChange("childCount", parseInt(e.target.value) || 0)
                }
                className="mt-1 block w-full border border-olive p-3 rounded"
              />
            </label>
            <label className="block mb-4">
              <span className="font-semibold">Gender Preference</span>
              <select
                value={donorProfile.genderPref}
                onChange={(e) => handleDonorChange("genderPref", e.target.value)}
                className="mt-1 block w-full border border-olive p-3 rounded"
              >
                <option value="">No preference</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="both">Both</option>
              </select>
            </label>
            <label className="block mb-4">
              <span className="font-semibold">Age Range (e.g. 3-10)</span>
              <input
                type="text"
                placeholder="e.g. 3-10"
                value={donorProfile.ageRange}
                onChange={(e) => handleDonorChange("ageRange", e.target.value)}
                className="mt-1 block w-full border border-olive p-3 rounded"
              />
            </label>
            <button
              onClick={saveDonorProfile}
              className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground py-3 px-6 rounded"
            >
              Save Preferences
            </button>
          </div>
        </>
      )}
    </main>
  );
}
