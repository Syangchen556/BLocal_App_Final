'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaPlus, FaTimes } from 'react-icons/fa';

export default function ProductSubmissionForm({ onClose, onSubmit }) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    stock: '',
    minStock: '',
    varieties: [],
    specifications: [],
    features: []
  });

  const [newVariety, setNewVariety] = useState({
    id: '',
    name: '',
    price: '',
    color: '',
    type: ''
  });

  const [newSpecification, setNewSpecification] = useState({
    key: '',
    value: ''
  });

  const [newFeature, setNewFeature] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddVariety = () => {
    if (!newVariety.id || !newVariety.name || !newVariety.price) return;

    setFormData(prev => ({
      ...prev,
      varieties: [...prev.varieties, { ...newVariety }]
    }));

    setNewVariety({
      id: '',
      name: '',
      price: '',
      color: '',
      type: ''
    });
  };

  const handleRemoveVariety = (id) => {
    setFormData(prev => ({
      ...prev,
      varieties: prev.varieties.filter(v => v.id !== id)
    }));
  };

  const handleAddSpecification = () => {
    if (!newSpecification.key || !newSpecification.value) return;

    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { ...newSpecification }]
    }));

    setNewSpecification({
      key: '',
      value: ''
    });
  };

  const handleRemoveSpecification = (key) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter(s => s.key !== key)
    }));
  };

  const handleAddFeature = () => {
    if (!newFeature) return;

    setFormData(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));

    setNewFeature('');
  };

  const handleRemoveFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          seller: session.user.id
        }),
      });

      if (!response.ok) throw new Error('Failed to submit product');

      onSubmit();
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Failed to submit product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <FaTimes className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Base Price (Nu.)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="">Select Category</option>
                <option value="VEGETABLES">Vegetables</option>
                <option value="FRUITS">Fruits</option>
                <option value="HERBS">Herbs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Stock Alert
              </label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleInputChange}
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Varieties */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Varieties</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="ID"
                value={newVariety.id}
                onChange={(e) => setNewVariety(prev => ({ ...prev, id: e.target.value }))}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Name"
                value={newVariety.name}
                onChange={(e) => setNewVariety(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Price"
                value={newVariety.price}
                onChange={(e) => setNewVariety(prev => ({ ...prev, price: e.target.value }))}
                min="0"
                step="0.01"
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Color"
                value={newVariety.color}
                onChange={(e) => setNewVariety(prev => ({ ...prev, color: e.target.value }))}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleAddVariety}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600"
              >
                <FaPlus className="mr-2" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {formData.varieties.map((variety) => (
                <div
                  key={variety.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                >
                  <div>
                    <span className="font-medium">{variety.name}</span>
                    <span className="text-gray-500 ml-2">Nu. {variety.price}</span>
                    {variety.color && (
                      <span className="text-gray-500 ml-2">({variety.color})</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariety(variety.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Key"
                value={newSpecification.key}
                onChange={(e) => setNewSpecification(prev => ({ ...prev, key: e.target.value }))}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Value"
                value={newSpecification.value}
                onChange={(e) => setNewSpecification(prev => ({ ...prev, value: e.target.value }))}
                className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleAddSpecification}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600"
              >
                <FaPlus className="mr-2" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {formData.specifications.map((spec) => (
                <div
                  key={spec.key}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                >
                  <div>
                    <span className="font-medium">{spec.key}:</span>
                    <span className="text-gray-500 ml-2">{spec.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecification(spec.key)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Add a feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600"
              >
                <FaPlus className="mr-2" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                >
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(feature)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Product'}
          </button>
        </div>
      </form>
    </div>
  );
} 