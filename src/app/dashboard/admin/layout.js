'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaUsers,
  FaShoppingBag,
  FaClipboardList,
  FaBlog,
  FaStore,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaBars,
  FaChevronLeft
} from 'react-icons/fa';

// Admin navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: FaChartLine },
  { name: 'Users', href: '/dashboard/admin/users', icon: FaUsers },
  { name: 'Shops', href: '/dashboard/admin/shops', icon: FaStore },
  { name: 'Products', href: '/dashboard/admin/products', icon: FaShoppingBag },
  { name: 'Orders', href: '/dashboard/admin/orders', icon: FaClipboardList },
  { name: 'Blog', href: '/dashboard/admin/blogs', icon: FaBlog },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: FaCog },
];

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Show access denied if not logged in or not an admin
  if (!session || session.user.role.toUpperCase() !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">You must be an admin to access this page.</p>
          <Link href="/" className="mt-4 inline-block text-green-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Admin dashboard layout (without global navbar and footer)
  return (
    <div className="min-h-screen bg-gray-100 flex" style={{ marginTop: 0, paddingTop: 0 }}>
      {/* Sidebar - changes width based on sidebarOpen state */}
      <div 
        className={`fixed inset-y-0 left-0 bg-white shadow-lg z-10 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and toggle button */}
          <div className="flex items-center justify-between h-16 border-b px-4">
            {sidebarOpen && <h1 className="text-xl font-bold text-gray-800">Admin</h1>}
            <div className="flex items-center">
              {sidebarOpen && (
                <Link 
                  href="/" 
                  className="text-gray-500 hover:text-green-600 mr-2"
                  title="Return to main site"
                >
                  <FaHome className="h-5 w-5" />
                </Link>
              )}
              <button 
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-green-600"
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? <FaChevronLeft className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center ${sidebarOpen ? 'px-4' : 'justify-center'} py-2 text-sm font-medium rounded-lg ${isActive
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title={!sidebarOpen ? item.name : ''}
                >
                  <item.icon className={`${sidebarOpen ? 'mr-3' : ''} h-5 w-5`} />
                  {sidebarOpen && item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className={`${sidebarOpen ? 'p-4' : 'p-2'} border-t`}>
            {sidebarOpen ? (
              <>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    {session.user.name?.charAt(0) || 'A'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="mt-4 flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <FaSignOutAlt className="mr-3 h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white mb-2">
                  {session.user.name?.charAt(0) || 'A'}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-red-600 hover:text-red-800"
                  title="Sign Out"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - adjusts padding based on sidebar state */}
      <div className={`w-full transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-16'}`}>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
