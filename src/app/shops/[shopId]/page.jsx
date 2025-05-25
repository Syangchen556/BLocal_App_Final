import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import FeaturedBlogs from '@/components/shops/FeaturedBlogs';
import ManageFeaturedBlogs from '@/components/shops/ManageFeaturedBlogs';

export default function ShopDetails({ params }) {
  const { data: session } = useSession();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShopDetails();
  }, [params.shopId]);

  const fetchShopDetails = async () => {
    try {
      const response = await fetch(`/api/shops/${params.shopId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shop details');
      }
      const data = await response.json();
      setShop(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-10">
        <p>Shop not found</p>
      </div>
    );
  }

  const isOwner = session?.user?.id === shop.owner._id.toString();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Shop Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32">
            <Image
              src={shop.logo || '/images/default-shop.png'}
              alt={shop.name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{shop.name}</h1>
            <p className="text-gray-600 mb-4">{shop.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-500" />
                <span>{`${shop.address.street}, ${shop.address.city}, ${shop.address.country}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="text-green-500" />
                <span>{shop.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-green-500" />
                <span>{shop.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-green-500" />
                <span>Open: {shop.businessHours?.open || '9:00 AM'} - {shop.businessHours?.close || '6:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Blog Posts */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        {isOwner ? (
          <ManageFeaturedBlogs shopId={shop._id} />
        ) : (
          <FeaturedBlogs shopId={shop._id} isOwner={isOwner} />
        )}
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shop.products?.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image
                  src={product.media.mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description.short}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold">
                    Nu. {product.pricing.base.toFixed(2)}
                  </span>
                  <Link 
                    href={`/product/${product._id}`}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 