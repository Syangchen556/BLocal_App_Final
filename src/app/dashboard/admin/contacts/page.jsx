'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800'
};

export default function AdminContacts() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [response, setResponse] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchContacts();
  }, [session, router]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/admin/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setToast({
        message: 'Error loading contact messages',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setContacts(contacts.map(contact =>
          contact._id === contactId
            ? { ...contact, status: newStatus }
            : contact
        ));
        setToast({
          message: 'Status updated successfully',
          type: 'success'
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({
        message: 'Error updating status',
        type: 'error'
      });
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedContact || !response.trim()) return;

    try {
      const res = await fetch(`/api/admin/contacts/${selectedContact._id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response }),
      });

      if (res.ok) {
        setContacts(contacts.map(contact =>
          contact._id === selectedContact._id
            ? { ...contact, adminResponse: response, status: 'RESOLVED' }
            : contact
        ));
        setSelectedContact(null);
        setResponse('');
        setToast({
          message: 'Response sent successfully',
          type: 'success'
        });
      } else {
        throw new Error('Failed to send response');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      setToast({
        message: 'Error sending response',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="mt-2 text-gray-600">
            Manage and respond to customer inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div
                      key={contact._id}
                      className={`p-4 rounded-lg border ${
                        selectedContact?._id === contact._id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {contact.subject}
                          </h3>
                          <p className="text-sm text-gray-500">
                            From: {contact.name} ({contact.email})
                          </p>
                          <p className="mt-2 text-gray-600">
                            {contact.message}
                          </p>
                          {contact.adminResponse && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <p className="text-sm font-medium text-gray-900">
                                Your Response:
                              </p>
                              <p className="text-sm text-gray-600">
                                {contact.adminResponse}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[contact.status]
                            }`}
                          >
                            {contact.status}
                          </span>
                          <div className="flex space-x-1">
                            {contact.status !== 'RESOLVED' && (
                              <button
                                onClick={() => handleStatusChange(contact._id, 'RESOLVED')}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Mark as resolved"
                              >
                                <FaCheck />
                              </button>
                            )}
                            {contact.status === 'PENDING' && (
                              <button
                                onClick={() => handleStatusChange(contact._id, 'IN_PROGRESS')}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Mark as in progress"
                              >
                                <FaSpinner />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedContact(contact)}
                          className="text-sm"
                        >
                          {contact.adminResponse ? 'Edit Response' : 'Respond'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No contact messages found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Response Form */}
          <div className="lg:col-span-1">
            {selectedContact ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Respond to Message
                  </h2>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleSubmitResponse} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Original Message
                    </label>
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedContact.message}
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="response"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Your Response
                    </label>
                    <textarea
                      id="response"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows="4"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                  >
                    Send Response
                  </Button>
                </form>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <FaEnvelope className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Select a message to respond
                </p>
              </div>
            )}
          </div>
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