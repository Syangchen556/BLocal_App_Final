'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

export default function SellerInventory() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample inventory data - In a real app, these would come from your database
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: "Fresh Tomatoes",
      sku: "TOM001",
      category: "Vegetables",
      quantity: 100,
      minQuantity: 20,
      price: 2.99,
      cost: 1.50,
      supplier: "Local Farm Co.",
      lastRestocked: "2024-03-10",
      status: "In Stock"
    },
    {
      id: 2,
      name: "Organic Carrots",
      sku: "CAR001",
      category: "Vegetables",
      quantity: 15,
      minQuantity: 25,
      price: 1.99,
      cost: 0.80,
      supplier: "Organic Farms Ltd.",
      lastRestocked: "2024-03-12",
      status: "Low Stock"
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'in stock':
        return 'bg-green-100 text-green-800';
      case 'low stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out of stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const deleteItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
          >
            <FaPlus />
            <span>Add Item</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Items</h3>
            <p className="text-3xl font-bold text-green-600">
              {inventory.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Low Stock Items</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {inventory.filter(item => item.quantity < item.minQuantity).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Out of Stock</h3>
            <p className="text-3xl font-bold text-red-600">
              {inventory.filter(item => item.quantity === 0).length}
            </p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">Supplier: {item.supplier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                      {item.quantity < item.minQuantity && (
                        <FaExclamationTriangle className="ml-2 text-yellow-500" title="Low Stock" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Min: {item.minQuantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Cost: ${item.cost.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No inventory items found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 