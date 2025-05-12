import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow p-4 flex justify-between">
      <div className="font-bold text-xl">CharitySite</div>
      <div className="space-x-4">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/donate">Donate</Link>
        <Link href="/contact">Contact</Link>
        <Link href ="/register">Register</Link>
      </div>
    </nav>
  );
}
