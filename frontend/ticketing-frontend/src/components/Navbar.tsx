'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Ticketing System
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/tickets" className="text-gray-700 hover:text-blue-600">
              My Tickets
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                Admin Panel
              </Link>
            )}
            <div className="text-sm text-gray-600">
              {user?.name} ({user?.role})
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}