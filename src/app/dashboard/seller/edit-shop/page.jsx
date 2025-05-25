'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaStore } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

export default function EditShop() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phone: '',
    email: '',
    businessHours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' }
    }
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'SELLER') {
      router.push('/auth/signin');
      return;
    }

    fetchShopData();
  }, [session, status]);

  const fetchShopData = async () => {
    try {
      const response = await fetch('/api/shop');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'pending') {
          router.push('/shop/profile');
          return;
        }
        setFormData({
          name: data.name || '',
          description: data.description || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            zipCode: data.address?.zipCode || ''
          },
          phone: data.phone || '',
          email: data.email || '',
          businessHours: data.businessHours || {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '09:00', close: '17:00' },
            sunday: { open: '10:00', close: '16:00' }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
      setToast({
        message: 'Error fetching shop data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBusinessHourChange = (day, type, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [type]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/shop', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error updating shop');
      }

      setToast({
        message: 'Shop updated successfully!',
        type: 'success'
      });

      setTimeout(() => {
        router.push('/shop/profile');
      }, 2000);
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <FaStore className="text-2xl text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Edit Shop Profile</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Shop Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  id="address.street"
                  required
                  value={formData.address.street}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  id="address.city"
                  required
                  value={formData.address.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  id="address.state"
                  required
                  value={formData.address.state}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  id="address.zipCode"
                  required
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4">
                    <span className="w-24 text-sm font-medium text-gray-700 capitalize">{day}</span>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleBusinessHourChange(day, 'open', e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleBusinessHourChange(day, 'close', e.target.value)}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 