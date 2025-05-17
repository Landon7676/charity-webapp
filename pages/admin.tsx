import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

const ADMIN_EMAIL = "landon7675@gmail.com";

export default function AdminDashboard() {
  const [pendingRecipients, setPendingRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingRecipients = async () => {
      const snap = await getDocs(collection(db, "users"));
      const unapproved = snap.docs
        .filter(
          (doc) =>
            doc.data().role === "recipient" &&
            doc.data().recipientProfile?.approved === false
        )
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setPendingRecipients(unapproved);
      setLoading(false);
    };

    fetchPendingRecipients();
  }, []);

  const approveRecipient = async (id: string) => {
    const ref = doc(db, "users", id);
    await updateDoc(ref, {
      "recipientProfile.approved": true,
    });
    setPendingRecipients((prev) => prev.filter((r) => r.id !== id));
    alert("Recipient approved!");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-wine">Admin Dashboard</h1>
      {pendingRecipients.length === 0 ? (
        <p>No pending recipients.</p>
      ) : (
        <ul className="space-y-6">
          {pendingRecipients.map((r) => (
            <li key={r.id} className="border border-olive p-4 rounded bg-white">
              <p><strong>Address:</strong> {r.recipientProfile.address}</p>
              <p><strong>Zip Code:</strong> {r.recipientProfile.zipCode}</p>
              <p><strong>Children:</strong> {r.recipientProfile.kidCount}</p>
              <p><strong>Ages:</strong> {r.recipientProfile.ages}</p>
              <p><strong>Gender:</strong> {r.recipientProfile.gender || "N/A"}</p>

              {r.recipientProfile.documents && (
                <div className="mt-2">
                  <h3 className="font-semibold">Uploaded Documents:</h3>
                  <ul className="list-disc ml-6 text-sm mt-1">
                    {Object.entries(r.recipientProfile.documents).map(
                      ([label, url]: [string, any]) => (
                        <li key={label}>
                          {label.replace(/-/g, " ")}: {" "}
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View
                          </a>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              <button
                onClick={() => approveRecipient(r.id)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white py-1 px-4 rounded"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
