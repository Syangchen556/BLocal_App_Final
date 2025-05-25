'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import PurchaseHistory from '@/components/profile/PurchaseHistory';
import OrderTracking from '@/components/profile/OrderTracking';
import BuyerStats from '@/components/profile/BuyerStats';
import ProfileInfo from '@/components/profile/ProfileInfo';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'tracking', 'stats'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'orders', label: 'Purchase History' },
    { id: 'tracking', label: 'Order Tracking' },
    { id: 'stats', label: 'Statistics' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'profile' && <ProfileInfo user={session.user} />}
          {activeTab === 'orders' && <PurchaseHistory userId={session.user.id} />}
          {activeTab === 'tracking' && <OrderTracking userId={session.user.id} />}
          {activeTab === 'stats' && <BuyerStats userId={session.user.id} />}
        </div>
      </div>
    </main>
  );
} 