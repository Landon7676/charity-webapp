import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

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
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      setRole(userData?.role);

      if (userData?.role === "donor" && userData?.donorProfile) {
        const donor = userData.donorProfile;
        const recipientSnaps = await getDocs(collection(db, "users"));

        const recipients = recipientSnaps.docs
  .filter((doc) => doc.data().role === "recipient")
  .map((doc) => ({ id: doc.id, ...doc.data() })) as RecipientUser[];

        // Matching logic
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

      setLoading(false);
    };

    fetchMatches();
  }, []);

  if (loading) {
    return <p className="p-8">Loading matches...</p>;
  }

  if (role !== "donor") {
    return <p className="p-8">You must be a donor to view matches.</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-wine">Matching Recipients</h1>

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
    </main>
  );
}
