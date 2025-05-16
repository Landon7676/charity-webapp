// pages/logout.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";


export default function LogoutPage() {
 const [user, setUser] = useState<null | object>(null);
 const router = useRouter();


 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
     if (!currentUser) {
       router.push("/login"); // Redirect if already logged out
     } else {
       setUser(currentUser);
     }
   });


   return () => unsubscribe();
 }, [router]);


 const handleConfirmLogout = async () => {
   await signOut(auth);
   router.push("/login");
 };


 const handleCancel = () => {
   router.back(); // Return to previous page
 };


 return (
   <main className="min-h-screen flex items-center justify-center bg-gray-100">
     <div className="bg-white shadow-lg rounded-lg p-6 max-w-md text-center">
       <h1 className="text-xl font-bold mb-4">Are you sure you want to log out?</h1>
       <div className="flex justify-center gap-4">
         <button
           onClick={handleConfirmLogout}
           className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
         >
           Confirm Logout
         </button>
         <button
           onClick={handleCancel}
           className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
         >
           Cancel
         </button>
       </div>
     </div>
   </main>
 );
}
