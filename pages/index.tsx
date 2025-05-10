import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Our Charity</h1>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-xl">
        Help us make an impact in the community. Your support matters.
      </p>
      <Button>Donate Now</Button>
    </main>
  );
}
