/**
 * NotFound (404) Page
 */
import { Link } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-surface-1">
      <div className="animate-fade-in-up text-center max-w-md ll-card p-8 shadow-xl">
        {/* 404 visual */}
        <h1 className="text-7xl font-extrabold font-serif text-blue-900 sm:text-8xl">404</h1>
        <h2 className="mt-3 text-2xl font-bold font-serif text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-sm text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="btn-primary text-sm w-full sm:w-auto justify-center"
          >
            <FiHome className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            to="/search"
            className="btn-secondary text-sm w-full sm:w-auto justify-center"
          >
            <FiSearch className="h-4 w-4" />
            Search Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
