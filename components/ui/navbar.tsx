import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-indigo text-sand shadow p-4 flex justify-between items-center">
      <div className="font-bold text-xl tracking-wide">Goodfellows</div>
      <div className="space-x-4">
        <Link
          href="/"
          className="hover:text-cyan transition-colors duration-200"
        >
          Home
        </Link>
        <Link
          href="/about"
          className="hover:text-cyan transition-colors duration-200"
        >
          About
        </Link>
        <Link
          href="/donate"
          className="hover:text-cyan transition-colors duration-200"
        >
          Donate
        </Link>
        <Link
          href="/contact"
          className="hover:text-cyan transition-colors duration-200"
        >
          Contact
        </Link>
        <Link
          href="/register"
          className="bg-teal text-white px-3 py-1 rounded hover:bg-cyan transition-colors duration-200"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}
