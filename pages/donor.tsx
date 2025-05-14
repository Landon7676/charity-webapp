import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function DonorPage() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) return router.push("/login");
      const docSnap = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
      const userDoc = docSnap.docs[0]?.data();
      if (userDoc?.role !== "donor") router.push("/");
    };
    checkRole();
  }, [router]);

  const handleSearch = async () => {
    const q = query(collection(db, "wishlists"), where("age", "==", age), where("gender", "==", gender));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setResults(data);
  };

  const claimWishlist = async (wishlistId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "wishlists", wishlistId), {
      claimedBy: user.uid,
      claimedAt: new Date()
    });
    setResults(results.filter((item) => item.id !== wishlistId)); // remove from display
  };

  return (
    <main className="p-6 max-w-xl mx-auto bg-white shadow-md rounded mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">Find a Wishlist</h1>
      <div className="space-y-4 mb-6">
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Desired Age" className="w-full border p-2 rounded" />
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border p-2 rounded">
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <button onClick={handleSearch} className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Search</button>
      </div>

      {results.length === 0 && <p className="text-center text-gray-500">No wishlists found.</p>}

      {results.map((item) => (
        <div key={item.id} className="border p-4 rounded mb-4 bg-gray-50">
          <p><strong>Age:</strong> {item.age}</p>
          <p><strong>Gender:</strong> {item.gender}</p>
          <p><strong>Large:</strong> {item.wishlist.large}</p>
          <p><strong>Medium:</strong> {item.wishlist.medium}</p>
          <p><strong>Small:</strong> {item.wishlist.small}</p>
          <button onClick={() => claimWishlist(item.id)} className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Claim</button>
        </div>
      ))}
    </main>
  );
}
