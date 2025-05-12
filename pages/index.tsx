import { useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/register"); // redirect to register/login page
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Our Charity</h1>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-xl">
        Help us make an impact in the community. Your support matters.
      </p>
    </main>
  );
}
