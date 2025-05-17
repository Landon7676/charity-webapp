// components/Navbar.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";


export default function Navbar() {
 const [loggedIn, setLoggedIn] = useState(false);
 const router = useRouter();


 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, (user) => {
     setLoggedIn(!!user);
   });


   return () => unsubscribe();
 }, []);


 const handleLogout = async () => {
   await signOut(auth);
   router.push("/login");
 };


 return (
   <nav className="bg-white shadow p-4 flex justify-between items-center">
     <div className="font-bold text-xl">GoodFellows</div>
     <div className="space-x-4">
       <Link href="/">Home</Link>
       <Link href="/about">About</Link>
       <Link href="/donate">Donate</Link>
       <Link href="/contact">Contact</Link>


       {loggedIn && <Link href="/profile">Profile</Link>}


       {!loggedIn ? (
         <Link href="/register">Register</Link>
       ) : (
         <button onClick={handleLogout} className="text-blue-600 hover:underline">
           Logout
         </button>
       )}
     </div>
   </nav>
 );
}
