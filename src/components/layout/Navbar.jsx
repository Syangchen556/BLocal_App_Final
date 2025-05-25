'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaShoppingCart, FaHeart, FaUser, FaStore, FaSignOutAlt, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartItemsCount = cart?.items?.length || 0;
  const wishlistItemsCount = wishlist?.length || 0;

  const isActive = (path) => pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">BLocal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`nav-link ${isActive('/') ? 'text-green-600' : 'text-gray-600'}`}>
              Home
            </Link>
            <Link href="/blog" className={`nav-link ${isActive('/blog') ? 'text-green-600' : 'text-gray-600'}`}>
              Blog
            </Link>
            <Link href="/help" className={`nav-link ${isActive('/help') ? 'text-green-600' : 'text-gray-600'}`}>
              Help
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-6">
            {session ? (
              <>
                <Link href="/cart" className="relative text-gray-600 hover:text-green-600 transition-colors">
                  <FaShoppingCart className="h-6 w-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <Link href="/wishlist" className="relative text-gray-600 hover:text-green-600 transition-colors">
                  <FaHeart className="h-6 w-6" />
                  {wishlistItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistItemsCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                    <FaUser className="h-6 w-6" />
                    <span>{session.user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                    <Link href="/dashboard" className="dropdown-item">
                      <FaUser className="h-4 w-4" />
                      Dashboard
                    </Link>
                    {session.user.role === 'seller' && (
                      <>
                        <Link href="/dashboard/seller" className="dropdown-item">
                          <FaStore className="h-4 w-4" />
                          Seller Dashboard
                        </Link>
                        <Link href="/shop" className="dropdown-item">
                          <FaStore className="h-4 w-4" />
                          My Shop
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="dropdown-item text-red-600 hover:bg-red-50"
                    >
                      <FaSignOutAlt className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="btn-primary">
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-green-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-4">
              {/* Mobile Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </form>

              <Link href="/" className="block py-2 text-gray-600 hover:text-green-600">
                Home
              </Link>
              <Link href="/blog" className="block py-2 text-gray-600 hover:text-green-600">
                Blog
              </Link>
              <Link href="/help" className="block py-2 text-gray-600 hover:text-green-600">
                Help
              </Link>
              {session ? (
                <>
                  <Link href="/cart" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                    <FaShoppingCart className="h-5 w-5 mr-2" />
                    Cart ({cartItemsCount})
                  </Link>
                  <Link href="/wishlist" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                    <FaHeart className="h-5 w-5 mr-2" />
                    Wishlist ({wishlistItemsCount})
                  </Link>
                  <Link href="/dashboard" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                    <FaUser className="h-5 w-5 mr-2" />
                    Dashboard
                  </Link>
                  {session.user.role === 'seller' && (
                    <>
                      <Link href="/dashboard/seller" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                        <FaStore className="h-5 w-5 mr-2" />
                        Seller Dashboard
                      </Link>
                      <Link href="/shop" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                        <FaStore className="h-5 w-5 mr-2" />
                        My Shop
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="flex items-center py-2 text-red-600 hover:text-red-700"
                  >
                    <FaSignOutAlt className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/signin" className="block w-full btn-primary text-center">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 