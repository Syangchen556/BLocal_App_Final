'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

function SignIn() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting login with:', formData.email);
        // Handle login
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        });

        console.log('Login result:', result);
        if (result?.error) {
          setError(result.error);
        } else {
          console.log('Login successful, checking user role');
          
          // Add a small delay to ensure session is properly set
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Fetch the user session to check the role
          const response = await fetch('/api/auth/session');
          const session = await response.json();
          console.log('Session data:', session);
          
          // Check user role (now standardized to uppercase in auth.js)
          const userRole = session?.user?.role;
          console.log(`User role detected: ${userRole}, redirecting to appropriate dashboard`);
          
          if (userRole === 'ADMIN') {
            router.push('/dashboard/admin');
          } else if (userRole === 'SELLER') {
            router.push('/dashboard/seller');
          } else if (userRole === 'BUYER') {
            router.push('/dashboard/buyer');
          } else {
            console.log('Unknown role, redirecting to homepage');
            router.push('/');
          }
          router.refresh();
        }
      } else {
        console.log('Attempting registration with:', formData.email);
        // Handle registration
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        console.log('Registration response status:', res.status);
        let data;
        try {
          data = await res.json();
          console.log('Registration response data:', data);
        } catch (parseError) {
          console.error('Error parsing registration response:', parseError);
          setError('Unexpected server response. Please try again.');
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        console.log('Registration successful, attempting auto-login');
        // Auto login after successful registration
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        });

        console.log('Auto-login result:', result);
        if (result?.error) {
          setError(result.error);
        } else {
          console.log('Auto-login successful, checking user role');
          
          // Add a small delay to ensure session is properly set
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Fetch the user session to check the role
          const response = await fetch('/api/auth/session');
          const session = await response.json();
          console.log('Session data:', session);
          
          // Check user role (now standardized to uppercase in auth.js)
          const userRole = session?.user?.role;
          console.log(`User role detected: ${userRole}, redirecting to appropriate dashboard`);
          
          if (userRole === 'ADMIN') {
            router.push('/dashboard/admin');
          } else if (userRole === 'SELLER') {
            router.push('/dashboard/seller');
          } else if (userRole === 'BUYER') {
            router.push('/dashboard/buyer');
          } else {
            console.log('Unknown role, redirecting to homepage');
            router.push('/');
          }
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <>
                <div className="mb-4">
                  <label htmlFor="name" className="sr-only">Full name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">I want to join as:</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="BUYER"
                        checked={formData.role === 'BUYER'}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Buyer</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="SELLER"
                        checked={formData.role === 'SELLER'}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Seller</span>
                    </label>
                  </div>
                </div>
              </>
            )}
            <div className="mb-4">
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '', role: 'BUYER' });
              }}
              className="font-medium text-green-600 hover:text-green-500"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
}

export default SignIn;