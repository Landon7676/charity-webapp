import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { Wishlist } from "@/types/wishlist";

export default function FamilyPage() {
  const [form, setForm] = useState<Wishlist["wishlist"]>({
    large: "",
    medium: "",
    small: "",
  });
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) return router.push("/login");
      const docSnap = await getDoc(doc(db, "users", user.uid));
      const data = docSnap.data();
      if (data?.role !== "recipient") router.push("/");
    };
    checkRole();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (["large", "medium", "small"].includes(name)) {
      setForm((prev: Wishlist["wishlist"]) => ({ ...prev, [name]: value }));
    } else if (name === "age") {
      setAge(value);
    } else if (name === "gender") {
      setGender(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const wishlist: Wishlist = {
      uid: user.uid,
      age,
      gender,
      wishlist: form
    };

    await setDoc(doc(db, "wishlists", user.uid), wishlist);
    setSuccess(true);
  };


  return (
    <main className="p-6 max-w-xl mx-auto bg-white shadow-md rounded mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">Child Wishlist</h1>
      {success && <p className="text-green-600 mb-4">Wishlist submitted!</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="age" type="number" placeholder="Child's Age" value={form.age} onChange={handleChange} className="w-full border p-2 rounded" required />
        <select name="gender" value={form.gender} onChange={handleChange} className="w-full border p-2 rounded">
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input name="large" placeholder="Large Item" value={form.large} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="medium" placeholder="Medium Item" value={form.medium} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input name="small" placeholder="Small Item" value={form.small} onChange={handleChange} className="w-full border p-2 rounded" required />
        <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full">Submit Wishlist</button>
      </form>
    </main>
  );
}
