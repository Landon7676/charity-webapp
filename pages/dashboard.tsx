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
  approved?: boolean;
};

type RecipientUser = {
  id: string;
  role: "recipient";
  recipientProfile: RecipientProfile;
  claimedBy?: string;
  wishlists?: Wishlist[];
};

const ADMIN_EMAIL = "admin@gmail.com";

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);

  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  // Donor-specific state
  const [matches, setMatches] = useState<RecipientUser[]>([]);

  // Recipient-specific state
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [kidCount, setKidCount] = useState(0);

  //Claimed recipient state
  const [claimedRecipients, setClaimedRecipients] = useState<RecipientUser[]>(
    []
  );
  const [isApproved, setIsApproved] = useState(true);
  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsAdmin(user.email === ADMIN_EMAIL);
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
        if (recipient.claimedBy) return false;
        if (!recipient.recipientProfile?.approved) return false;

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
          const ages = r.ages.split(",").map((a: string) => parseInt(a.trim()));
          return ages.every((age: number) => age >= min && age <= max);
        })();

        return kidCountOk && genderOk && ageRangeOk;
      });

      setMatches(filtered);
      // Fetch claimed recipients for this donor
      const claimed: RecipientUser[] = [];
      const claimedSnaps = await getDocs(collection(db, "users"));

      claimedSnaps.docs.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;

        const claimedByMatch = data.claimedBy === user.uid;
        const isRecipient = data.role === "recipient";
        const hasProfile = !!data.recipientProfile;

        console.log(`🧪 Evaluating doc ${id}`);
        console.log({ claimedByMatch, isRecipient, hasProfile });

        if (isRecipient && claimedByMatch && hasProfile) {
          claimed.push({ id, ...data } as RecipientUser);
        }
      });

      console.log("👁️ Claimed recipients found:", claimed.length);
      console.log("📦 Claimed recipients:", claimed);

      setClaimedRecipients(claimed);
      console.log(
        "Claimed recipients:",
        claimed.map((c) => ({ id: c.id, wishlists: c.wishlists }))
      );
    }
    if (role === "recipient") {
      if (!userData.recipientProfile?.approved) {
        setLoading(false);
        return setRole("pending-approval"); // New pseudo-role to show the prompt
      }

      const count = userData.recipientProfile.kidCount || 0;
      setKidCount(count);

      if (userData.wishlists) {
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
  useEffect(() => {
    void fetchData();
  }, []);
  const claimRecipient = async (recipientId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", recipientId);
    const snap = await getDoc(ref);
    const data = snap.data();

    if (!data) return;

    // If wishlists field is missing, initialize it
    if (!data.wishlists) {
      const kidCount = data.recipientProfile?.kidCount || 1;
      const emptyWishlists = Array.from({ length: kidCount }, (_, i) => ({
        childId: i + 1,
        items: [],
      }));

      await updateDoc(ref, {
        claimedBy: user.uid,
        wishlists: emptyWishlists,
      });
    } else {
      await updateDoc(ref, {
        claimedBy: user.uid,
      });
    }

    alert("Recipient successfully claimed!");

    await fetchData();
  };

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
      {/* DONOR DASHBOARD */}
      {role === "donor" && (
        <>
          {/* 🔹 Matching Recipients */}
          <h2 className="text-xl font-semibold mb-2">Matching Recipients</h2>
          {matches.length === 0 ? (
            <p>No matches found.</p>
          ) : (
            <ul className="space-y-4">
              {matches.map((match) => (
                <li
                  key={match.id}
                  className="border border-olive p-4 rounded bg-white"
                >
                  <p>
                    <strong>Children:</strong> {match.recipientProfile.kidCount}
                  </p>
                  <p>
                    <strong>Ages:</strong> {match.recipientProfile.ages}
                  </p>
                  <p>
                    <strong>Gender:</strong> {match.recipientProfile.gender}
                  </p>
                  <button
                    onClick={() => claimRecipient(match.id)}
                    className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground py-2 px-4 rounded"
                  >
                    Claim Recipient
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* 🔹 Claimed Recipients (Always Visible) */}
          <h2 className="text-xl font-semibold mt-8 mb-2">
            My Claimed Recipients
          </h2>
          <p className="text-sm text-gray-500">
            👀 Claimed recipients found: {claimedRecipients.length}
          </p>
          {claimedRecipients.length === 0 ? (
            <p>You haven't claimed any recipients yet.</p>
          ) : (
            <ul className="space-y-4">
              {claimedRecipients.map((recip) => {
                console.log("🎯 Rendering claimed recipient:", recip);
                if (!recip.recipientProfile) {
                  return (
                    <li
                      key={recip.id}
                      className="border p-4 rounded bg-red-100 text-red-700"
                    >
                      ⚠️ Missing profile data for recipient ID: {recip.id}
                    </li>
                  );
                }
                return (
                  <li
                    key={recip.id}
                    className="border border-olive p-4 rounded bg-white"
                  >
                    <p>
                      <strong>Children:</strong>{" "}
                      {recip.recipientProfile.kidCount ?? "N/A"}
                    </p>
                    <p>
                      <strong>Ages:</strong>{" "}
                      {recip.recipientProfile.ages ?? "N/A"}
                    </p>
                    <p>
                      <strong>Gender:</strong>{" "}
                      {recip.recipientProfile.gender || "Not specified"}
                    </p>
                    {recip.wishlists && recip.wishlists.length > 0 ? (
                      <div className="mt-4">
                        <h3 className="font-semibold text-indigo mb-2">
                          Wishlist
                        </h3>
                        {recip.wishlists.map((child) => (
                          <div key={child.childId} className="mb-4">
                            <h4 className="text-sm font-bold">
                              Child {child.childId}
                            </h4>
                            <ul className="list-disc ml-6">
                              {child.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.name || "Unnamed item"}
                                  {item.link && (
                                    <a
                                      href={item.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 underline ml-2"
                                    >
                                      View
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm italic mt-2 text-muted">
                        No wishlist submitted yet.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
      {/* RECIPIENT DASHBOARD */}
      {role === "pending-approval" && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
          <p>
            Your application is under review. You’ll be notified once approved.
          </p>
        </div>
      )}

      {role === "recipient" && (
        <>
          <h2 className="text-xl font-semibold mb-2 text-indigo">
            Your Wishlists
          </h2>
          {wishlists.map((child) => (
            <div
              key={child.childId}
              className="mb-6 bg-white p-4 border border-olive rounded"
            >
              <h3 className="text-lg font-semibold mb-2">
                Child {child.childId}
              </h3>
              {child.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(
                        child.childId,
                        idx,
                        "name",
                        e.target.value
                      )
                    }
                    className="flex-1 border border-olive p-2 rounded"
                  />
                  <input
                    type="url"
                    placeholder="Optional link"
                    value={item.link}
                    onChange={(e) =>
                      handleItemChange(
                        child.childId,
                        idx,
                        "link",
                        e.target.value
                      )
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
            className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground py-2 px-4 rounded"
          >
            Save Wishlist
          </button>
        </>
      )}
      {isAdmin && (
  <div className="mt-6 p-4 border border-indigo rounded bg-indigo-50">
    <h2 className="text-xl font-bold mb-2 text-indigo">Admin Panel</h2>
    <p className="text-sm text-muted">You are signed in as an admin.</p>
    {/* Add admin tools here, or link to /admin */}
  </div>
)}
    </main>
  );
}
