'use client';

import { useState } from 'react';
import { FaSearch, FaChevronDown, FaChevronUp, FaEnvelope, FaPhone, FaComments } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';

const FAQCategories = {
  ORDERING: 'Ordering',
  PAYMENT: 'Payment & Billing',
  SHIPPING: 'Shipping & Delivery',
  RETURNS: 'Returns & Refunds',
  ACCOUNT: 'Account & Security',
  SELLER: 'Seller Information'
};

const FAQs = [
  {
    category: FAQCategories.ORDERING,
    items: [
      {
        question: "How do I track my order?",
        answer: "You can track your order by going to 'My Orders' in your account dashboard. There you'll find all your orders and their current status. You'll receive email notifications for status updates."
      },
      {
        question: "Can I cancel an order after placing it?",
        answer: "Yes, you can cancel your order if it hasn't been shipped yet. Go to 'My Orders' and look for the cancel option next to eligible orders. Orders that have already been processed cannot be cancelled."
      },
      {
        question: "How do I modify my order?",
        answer: "To modify your order, please contact our customer support team immediately. We can help you make changes if the order hasn't been processed for shipping yet."
      }
    ]
  },
  {
    category: FAQCategories.PAYMENT,
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept various payment methods including credit/debit cards, cash on delivery, and mobile money payments. All online payments are processed securely through our payment gateway."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, we use industry-standard encryption to protect your payment information. We never store your complete credit card details on our servers."
      },
      {
        question: "When will I be charged for my order?",
        answer: "For credit/debit card payments, you'll be charged immediately when placing the order. For cash on delivery, you'll pay when receiving the items."
      }
    ]
  },
  {
    category: FAQCategories.SHIPPING,
    items: [
      {
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 day delivery. Delivery times may vary based on your location."
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we only ship within Bhutan. We're working on expanding our shipping options to other countries."
      },
      {
        question: "How much does shipping cost?",
        answer: "Shipping costs vary based on your location and the weight of your order. The exact shipping cost will be calculated at checkout."
      }
    ]
  },
  {
    category: FAQCategories.RETURNS,
    items: [
      {
        question: "What is your return policy?",
        answer: "We accept returns within 7 days of delivery. Items must be unused and in their original packaging. Contact our support team to initiate a return."
      },
      {
        question: "How do I return an item?",
        answer: "To return an item, go to 'My Orders', select the order, and click 'Return Item'. Follow the instructions to print the return label and ship the item back."
      },
      {
        question: "When will I receive my refund?",
        answer: "Refunds are processed within 5-7 business days after we receive the returned item. The refund will be issued to your original payment method."
      }
    ]
  },
  {
    category: FAQCategories.ACCOUNT,
    items: [
      {
        question: "How do I reset my password?",
        answer: "Click on 'Forgot Password' on the login page. Enter your email address and follow the instructions sent to your email to reset your password."
      },
      {
        question: "How do I update my account information?",
        answer: "Go to 'My Account' and click on 'Edit Profile'. You can update your personal information, shipping address, and notification preferences."
      },
      {
        question: "How do I delete my account?",
        answer: "To delete your account, go to 'My Account' > 'Settings' > 'Delete Account'. Please note that this action cannot be undone."
      }
    ]
  },
  {
    category: FAQCategories.SELLER,
    items: [
      {
        question: "How do I become a seller?",
        answer: "To become a seller, click on 'Become a Seller' in the main menu. Complete the registration form and provide the required documentation."
      },
      {
        question: "How do I manage my shop?",
        answer: "Access your seller dashboard to manage products, orders, and shop settings. You can add new products, update inventory, and track sales."
      },
      {
        question: "How do I receive payments as a seller?",
        answer: "Seller payments are processed weekly. You'll receive payments directly to your registered bank account after deducting platform fees."
      }
    ]
  }
];

const GettingStartedSteps = [
  {
    icon: "🔍",
    title: "Browse Products",
    description: "Use the main menu to explore categories and find products you love."
  },
  {
    icon: "🛒",
    title: "Add to Cart",
    description: "Click \"Add to Cart\" under any item you wish to purchase. Review your cart before checkout."
  },
  {
    icon: "💳",
    title: "Checkout",
    description: "Choose your payment method and complete the checkout process securely."
  },
  {
    icon: "📦",
    title: "Track Orders",
    description: "Go to \"My Orders\" in your account dashboard to track your delivery."
  },
  {
    icon: "↩️",
    title: "Request Returns",
    description: "Use the return option next to delivered items if you need to return anything."
  },
  {
    icon: "📞",
    title: "Need Help?",
    description: "Contact our support team through live chat, email, or phone."
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQs, setExpandedFAQs] = useState({});
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [toast, setToast] = useState(null);

  // Filter FAQs based on search query and category
  const filteredFAQs = FAQs.filter(category => 
    selectedCategory === 'all' || category.category === selectedCategory
  ).map(category => ({
    ...category,
    items: category.items.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  // Filter Getting Started steps based on search query
  const filteredSteps = GettingStartedSteps.filter(step =>
    step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const toggleFAQ = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setExpandedFAQs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setToast({
          message: 'Message sent successfully! We\'ll get back to you soon.',
          type: 'success'
        });
        setShowContactForm(false);
        setContactForm({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setToast({
        message: 'Failed to send message. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Help Center Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-lg text-gray-600 mb-8">
          We're here to help. Search for a topic or browse common questions.
        </p>
        
        {/* Enhanced Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          {searchFocused && searchQuery && (
            <div className="absolute w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="p-2 text-sm text-gray-500">
                Found {filteredFAQs.reduce((acc, cat) => acc + cat.items.length, 0) + filteredSteps.length} results
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === 'all'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Categories
          </button>
          {Object.values(FAQCategories).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Summary */}
      {searchQuery && (
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <p className="text-gray-600">
            Showing results for "{searchQuery}"
          </p>
        </div>
      )}

      {/* FAQs Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {filteredFAQs.map((category, categoryIndex) => (
            <div key={category.category} className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.items.map((faq, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <button
                      onClick={() => toggleFAQ(categoryIndex, itemIndex)}
                      className="w-full p-6 text-left flex justify-between items-center"
                    >
                      <h4 className="text-lg font-semibold text-gray-900">
                        {faq.question}
                      </h4>
                      {expandedFAQs[`${categoryIndex}-${itemIndex}`] ? (
                        <FaChevronUp className="text-gray-400" />
                      ) : (
                        <FaChevronDown className="text-gray-400" />
                      )}
                    </button>
                    {expandedFAQs[`${categoryIndex}-${itemIndex}`] && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredFAQs.length === 0 && searchQuery && (
            <div className="text-center text-gray-500">
              No FAQs found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Getting Started
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSteps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 flex items-start space-x-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-2xl">{step.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
          {filteredSteps.length === 0 && searchQuery && (
            <div className="text-center text-gray-500 md:col-span-2">
              No getting started guides found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Still Need Help?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <FaEnvelope className="text-3xl text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600">support@veggieshop.com</p>
            </div>
            <div className="text-center">
              <FaPhone className="text-3xl text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600">+975 1234 5678</p>
            </div>
            <div className="text-center">
              <FaComments className="text-3xl text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600">Available 24/7</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button
              variant="primary"
              onClick={() => setShowContactForm(!showContactForm)}
              className="w-full md:w-auto"
            >
              {showContactForm ? 'Close Contact Form' : 'Contact Us'}
            </Button>
          </div>

          {showContactForm && (
            <form onSubmit={handleContactSubmit} className="mt-8 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div className="text-center">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full md:w-auto"
                >
                  Send Message
                </Button>
              </div>
            </form>
          )}
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