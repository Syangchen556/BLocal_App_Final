'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FaUsers,
  FaShoppingBag,
  FaClipboardList,
  FaBlog,
  FaStore,
  FaChartLine,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

const navigation = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: FaChartLine },
  { name: 'Users', href: '/dashboard/admin/users', icon: FaUsers },
  { name: 'Shops', href: '/dashboard/admin/shops', icon: FaStore },
  { name: 'Products', href: '/dashboard/admin/products', icon: FaShoppingBag },
  { name: 'Orders', href: '/dashboard/admin/orders', icon: FaClipboardList },
  { name: 'Blog', href: '/dashboard/admin/blog', icon: FaBlog },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: FaCog },
];

export default function AdminLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <img
                src={session.user.image || '/images/default-avatar.png'}
                alt={session.user.name}
                className="h-8 w-8 rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{session.user.name}</p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="mt-4 flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <FaSignOutAlt className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 