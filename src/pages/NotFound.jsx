/**
 * NotFound (404) Page
 */
import { Link } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 hero-gradient">
      <div className="animate-fade-in-up text-center">
        {/* 404 visual */}
        <h1 className="text-8xl font-extrabold text-gradient sm:text-9xl">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-white">Page Not Found</h2>
        <p className="mt-3 text-navy-400">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:brightness-110"
          >
            <FiHome className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            to="/search"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            <FiSearch className="h-4 w-4" />
            Search Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
