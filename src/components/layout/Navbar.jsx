'use client';

import { useState, useEffect, useRef } from 'react';
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
  const { wishlist, lastAction } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);
  const prevWishlistCountRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Animate wishlist icon when items are added
  useEffect(() => {
    const wishlistItemsCount = wishlist?.items?.length || 0;
    
    // Animate when items are added (based on lastAction)
    if (lastAction === 'add') {
      setIsWishlistAnimating(true);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setIsWishlistAnimating(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Update the previous count reference
    prevWishlistCountRef.current = wishlistItemsCount;
  }, [wishlist, lastAction]);

  const cartItemsCount = cart?.items?.length || 0;
  const wishlistItemsCount = wishlist?.items?.length || 0;

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
            {session && session.user ? (
              <>
                {/* Common links for all authenticated users */}
                <Link href="/cart" className="relative text-gray-600 hover:text-green-600 transition-colors">
                  <FaShoppingCart className="h-6 w-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <Link href="/wishlist" className="relative text-gray-600 hover:text-green-600 transition-colors">
                  <FaHeart 
                    className={`h-6 w-6 ${isWishlistAnimating ? 'animate-heartbeat text-red-500' : ''}`} 
                  />
                  {wishlistItemsCount > 0 && (
                    <span className={`absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${isWishlistAnimating ? 'animate-pulse' : ''}`}>
                      {wishlistItemsCount}
                    </span>
                  )}
                </Link>
                
                {/* Role-specific navigation links */}
                {session.user.role && session.user.role.toUpperCase() === 'ADMIN' && (
                  <Link href="/dashboard/admin" className="text-gray-600 hover:text-green-600 transition-colors font-medium">
                    Admin Dashboard
                  </Link>
                )}
                {session.user.role && session.user.role.toUpperCase() === 'SELLER' && (
                  <>
                    <Link href="/dashboard/seller" className="text-gray-600 hover:text-green-600 transition-colors">
                      <FaStore className="h-6 w-6" title="Seller Dashboard" />
                    </Link>
                  </>
                )}
                {/* Buyer Dashboard link removed as requested */}
                <div className="group relative">
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors">
                    <FaUser className="h-6 w-6" />
                    <span className="text-sm">{session.user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile Customization
                    </Link>
                    {session.user.role && session.user.role.toUpperCase() === 'ADMIN' && (
                      <Link href="/dashboard/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                    )}
                    {session.user.role && session.user.role.toUpperCase() === 'SELLER' && (
                      <Link href="/dashboard/seller" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Seller Dashboard
                      </Link>
                    )}
                    {session.user.role && session.user.role.toUpperCase() === 'BUYER' && (
                      <Link href="/dashboard/buyer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Buyer Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="h-4 w-4 mr-2 inline" />
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
              {session && session.user ? (
                <>
                  <Link href="/cart" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                    <FaShoppingCart className="h-5 w-5 mr-2" />
                    Cart ({cartItemsCount})
                  </Link>
                  <Link href="/wishlist" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                    <FaHeart className={`h-5 w-5 mr-2 ${isWishlistAnimating ? 'animate-heartbeat text-red-500' : ''}`} />
                    Wishlist ({wishlistItemsCount})
                  </Link>
                  <Link href="/profile" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                    <FaUser className="h-5 w-5 mr-2" />
                    Profile Customization
                  </Link>
                  {session.user.role && session.user.role.toUpperCase() === 'ADMIN' && (
                    <Link href="/dashboard/admin" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                      <FaUser className="h-5 w-5 mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  {session.user.role && session.user.role.toUpperCase() === 'SELLER' && (
                    <Link href="/dashboard/seller" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                      <FaStore className="h-5 w-5 mr-2" />
                      Seller Dashboard
                    </Link>
                  )}
                  {session.user.role && session.user.role.toUpperCase() === 'BUYER' && (
                    <Link href="/dashboard/buyer" className="flex items-center py-2 text-gray-600 hover:text-green-600">
                      <FaUser className="h-5 w-5 mr-2" />
                      Buyer Dashboard
                    </Link>
                  )}
                  {/* Become a Seller link removed as requested */}
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