import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
} from "firebase/firestore";

// --- Types ---
type WishlistItem = { name: string; link?: string };
type Wishlist = { childId: number; items: WishlistItem[] };

type RecipientProfile = {
  address: string;
  zipCode: string;
  kidCount: number;
  ages: string;
  gender: string;
};

type RecipientUser = {
  id: string;
  role: "recipient";
  recipientProfile: RecipientProfile;
};

export default function Dashboard() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  // Donor-specific state
  const [matches, setMatches] = useState<RecipientUser[]>([]);

  // Recipient-specific state
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [kidCount, setKidCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
const userSnap = await getDoc(userRef);
const userData = userSnap.data();

// ✅ Early return if user doesn't exist
if (!userData) {
  console.error("User document not found.");
  setLoading(false);
  return;
}

const role = userData.role;
setRole(role);

if (role === "donor" && userData.donorProfile) {
  const donor = userData.donorProfile;

  const recipientSnaps = await getDocs(collection(db, "users"));
  const recipients = recipientSnaps.docs
    .filter((doc) => doc.data().role === "recipient")
    .map((doc) => ({ id: doc.id, ...doc.data() })) as RecipientUser[];

  const filtered = recipients.filter((recipient) => {
    const r = recipient.recipientProfile;
    if (!r) return false;

    const kidCountOk = r.kidCount <= donor.childCount;

    const genderOk =
      donor.genderPref === "" ||
      donor.genderPref === "both" ||
      donor.genderPref === r.gender;

    const ageRangeOk = (() => {
      if (!donor.ageRange) return true;
      const [min, max] = donor.ageRange.split("-").map(Number);
      const ages = r.ages
        .split(",")
        .map((a: string) => parseInt(a.trim()));
      return ages.every((age: number) => age >= min && age <= max);
    })();

    return kidCountOk && genderOk && ageRangeOk;
  });

  setMatches(filtered);
}
      if (role === "recipient") {
        const count = userData?.recipientProfile?.kidCount || 0;
        setKidCount(count);

        if (userData?.wishlists) {
          setWishlists(userData.wishlists);
        } else {
          const empty = Array.from({ length: count }, (_, i) => ({
            childId: i + 1,
            items: [],
          }));
          setWishlists(empty);
          await updateDoc(userRef, { wishlists: empty });
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

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

  const saveAll = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), { wishlists });
    alert("Wishlist saved!");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-wine">Dashboard</h1>

      {role === "donor" && (
        <>
          <h2 className="text-xl font-semibold mb-2">Matching Recipients</h2>
          {matches.length === 0 ? (
            <p>No matches found.</p>
          ) : (
            <ul className="space-y-4">
              {matches.map((match) => (
                <li key={match.id} className="border border-olive p-4 rounded bg-white">
                  <p><strong>Children:</strong> {match.recipientProfile.kidCount}</p>
                  <p><strong>Ages:</strong> {match.recipientProfile.ages}</p>
                  <p><strong>Gender:</strong> {match.recipientProfile.gender}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {role === "recipient" && (
        <>
          <h2 className="text-xl font-semibold mb-2 text-indigo">Your Wishlists</h2>
          {wishlists.map((child) => (
            <div key={child.childId} className="mb-6 bg-white p-4 border border-olive rounded">
              <h3 className="text-lg font-semibold mb-2">Child {child.childId}</h3>
              {child.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(child.childId, idx, "name", e.target.value)
                    }
                    className="flex-1 border border-olive p-2 rounded"
                  />
                  <input
                    type="url"
                    placeholder="Optional link"
                    value={item.link}
                    onChange={(e) =>
                      handleItemChange(child.childId, idx, "link", e.target.value)
                    }
                    className="flex-1 border border-olive p-2 rounded"
                  />
                </div>
              ))}
              <button
                onClick={() => addItem(child.childId)}
                className="text-sm mt-2 text-teal hover:underline"
              >
                + Add item
              </button>
            </div>
          ))}
          <button
            onClick={saveAll}
            className="bg-teal hover:bg-cyan text-white py-2 px-4 rounded"
          >
            Save Wishlist
          </button>
        </>
      )}
    </main>
  );
}
