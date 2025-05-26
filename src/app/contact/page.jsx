'use client';

import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const bhutanDetails = {
    address: {
      street: 'Thimphu Market Complex',
      city: 'Thimphu',
      country: 'Bhutan'
    },
    contact: {
      phone: '+975 1234 5678',
      email: 'info@bhutanfreshmarket.bt',
      hours: {
        open: '09:00',
        close: '18:00',
        days: 'Monday - Saturday'
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[300px] bg-green-50">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative h-full flex items-center justify-center text-center">
          <div className="max-w-3xl px-4">
            <h1 className="text-4xl font-bold mb-2 text-green-800">Contact Us</h1>
            <p className="text-lg text-green-600">We&apos;d love to hear from you</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-green-700">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-green-800">Contact Information</h2>
            <div className="space-y-8">
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex items-start">
                    <FaPhone className="text-green-500 text-xl mt-1 mr-4" />
                    <div>
                      <h3 className="font-semibold text-green-700">Phone</h3>
                      <p className="text-gray-700">{bhutanDetails.contact.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-start">
                    <FaEnvelope className="text-green-500 text-xl mt-1 mr-4" />
                    <div>
                      <h3 className="font-semibold text-green-700">Email</h3>
                      <p className="text-gray-700">{bhutanDetails.contact.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-green-500 text-xl mt-1 mr-4" />
                    <div>
                      <h3 className="font-semibold text-green-700">Address</h3>
                      <p className="text-gray-700">{bhutanDetails.address.street}</p>
                      <p className="text-gray-700">{bhutanDetails.address.city}, {bhutanDetails.address.country}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-start">
                    <FaClock className="text-green-500 text-xl mt-1 mr-4" />
                    <div>
                      <h3 className="font-semibold text-green-700">Business Hours</h3>
                      <p className="text-gray-700">{bhutanDetails.contact.hours.days}</p>
                      <p className="text-gray-700">{bhutanDetails.contact.hours.open} - {bhutanDetails.contact.hours.close}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 