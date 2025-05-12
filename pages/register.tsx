import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor"); // default role
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save role to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        role,
        createdAt: new Date()
      });

      setSuccess(true);

      // Redirect based on role
      if (role === "recipient") {
        router.push("/family");
      } else if (role === "donor") {
        router.push("/donor"); // change to actual path
      }

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {success && <p className="text-green-600 mb-4">Registration successful!</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <label className="block mb-2 text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-2 text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <label className="block mb-2 text-sm font-medium">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded mb-6"
        >
          <option value="donor">Donor</option>
          <option value="recipient">Recipient</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </main>
  );
}
