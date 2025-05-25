'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaClock } from 'react-icons/fa';
import ProductSubmissionForm from '@/components/products/ProductSubmissionForm';
import Toast from '@/components/ui/Toast';

export default function SellerProducts() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Sample products - In a real app, these would come from your database
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Fresh Tomatoes",
      price: 2.99,
      status: "active",
      imageUrl: "/images/products/tomatoes.jpg",
      description: "Locally grown fresh tomatoes",
      approvedAt: "2024-03-10"
    },
    {
      id: 2,
      name: "Organic Carrots",
      price: 1.99,
      status: "pending",
      imageUrl: "/images/products/carrots.jpg",
      description: "Organic carrots from local farmers",
      submittedAt: "2024-03-15"
    }
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSubmit = async () => {
    setShowAddModal(false);
    setToast({
      message: 'Product submitted for approval. You will be notified once reviewed.',
      type: 'success'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending Approval</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
          >
            <FaPlus />
            <span>Add Product</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.status === 'active' 
                      ? `Approved on ${new Date(product.approvedAt).toLocaleDateString()}`
                      : `Submitted on ${new Date(product.submittedAt).toLocaleDateString()}`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {product.status === 'active' && (
                      <>
                        <button
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                    {product.status === 'pending' && (
                      <div className="flex items-center justify-end text-yellow-600">
                        <FaClock className="mr-2" />
                        <span>Awaiting Approval</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No products found</div>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="max-w-2xl w-full mx-4">
              <ProductSubmissionForm
                onClose={() => setShowAddModal(false)}
                onSubmit={handleProductSubmit}
              />
            </div>
          </div>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
} 