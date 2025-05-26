'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCreditCard, FaMoneyBill, FaPaypal, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

export default function PaymentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Form fields for credit card
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    
    fetchOrderDetails();
  }, [session, orderId, router]);
  
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch the order details
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details. Please try again.');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces after every 4 digits
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '') // Remove existing spaces
        .replace(/\D/g, '') // Remove non-digits
        .replace(/(.{4})/g, '$1 ') // Add space after every 4 digits
        .trim(); // Remove trailing space
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // Format expiry date as MM/YY
    if (name === 'expiryDate') {
      const digits = value.replace(/\D/g, '');
      let formattedValue = value;
      
      if (digits.length <= 2) {
        formattedValue = digits;
      } else {
        formattedValue = `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
      }
      
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // Format CVV to only allow digits
    if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '');
      setCardDetails(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  const validateCardDetails = () => {
    const errors = [];
    
    if (!cardDetails.cardNumber.trim()) {
      errors.push('Card number is required');
    } else if (cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      errors.push('Card number must be 16 digits');
    }
    
    if (!cardDetails.cardHolder.trim()) {
      errors.push('Cardholder name is required');
    }
    
    if (!cardDetails.expiryDate.trim()) {
      errors.push('Expiry date is required');
    } else {
      const [month, year] = cardDetails.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of year
      const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
      
      if (!month || !year || month > 12 || month < 1) {
        errors.push('Invalid expiry date');
      } else if ((parseInt(year) < currentYear) || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.push('Card has expired');
      }
    }
    
    if (!cardDetails.cvv.trim()) {
      errors.push('CVV is required');
    } else if (cardDetails.cvv.length < 3) {
      errors.push('CVV must be 3 digits');
    }
    
    return errors;
  };

  const handleSubmitPayment = async (e) => {
    if (e) e.preventDefault();
    
    // Validate form fields based on payment method
    if (paymentMethod === 'credit_card') {
      const validationErrors = validateCardDetails();
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error));
        return;
      }
    }
    
    try {
      setProcessingPayment(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update order status based on payment method
      const paymentStatus = paymentMethod === 'cash' ? 'pending' : 'paid';
      const orderStatus = paymentMethod === 'cash' ? 'pending' : 'processing';
      
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: orderStatus,
          paymentStatus: paymentStatus
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }
      
      setPaymentSuccess(true);
      
      if (paymentMethod === 'cash') {
        toast.success('Order placed successfully with Cash on Delivery!');
      } else {
        toast.success('Payment successful!');
      }
      
      // Redirect to order confirmation page
      setTimeout(() => {
        router.push(`/orders/${orderId}/confirmation`);
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button
            variant="primary"
            onClick={() => router.push('/cart')}
          >
            Return to Cart
          </Button>
        </div>
      </div>
    );
  }
  
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-green-500 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been placed and {paymentMethod === 'cash' ? 'will be processed for cash on delivery' : 'payment was successful'}. You will be redirected to the order confirmation page shortly.
          </p>
          <p className="text-sm text-gray-500 mb-4">Order Number: {order?.orderNumber || 'N/A'}</p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirecting to order confirmation...</p>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/orders/${orderId}/confirmation`)}
          >
            Go to Order Confirmation
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h1>
            
            <div className="space-y-4 mb-8">
              <div 
                className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'credit_card' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => handlePaymentMethodChange('credit_card')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'credit_card' ? 'border-green-500 bg-green-500' : 'border-gray-300'} flex items-center justify-center mr-3`}>
                    {paymentMethod === 'credit_card' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <FaCreditCard className="text-gray-600 mr-3" />
                  <span className="font-medium">Credit Card</span>
                </div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'paypal' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => handlePaymentMethodChange('paypal')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'paypal' ? 'border-green-500 bg-green-500' : 'border-gray-300'} flex items-center justify-center mr-3`}>
                    {paymentMethod === 'paypal' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <FaPaypal className="text-gray-600 mr-3" />
                  <span className="font-medium">PayPal</span>
                </div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                onClick={() => handlePaymentMethodChange('cash')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'cash' ? 'border-green-500 bg-green-500' : 'border-gray-300'} flex items-center justify-center mr-3`}>
                    {paymentMethod === 'cash' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <FaMoneyBill className="text-gray-600 mr-3" />
                  <span className="font-medium">Cash on Delivery</span>
                </div>
              </div>
            </div>
            
            {paymentMethod === 'credit_card' && (
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength="19"
                  />
                </div>
                
                <div>
                  <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    id="cardHolder"
                    name="cardHolder"
                    placeholder="John Doe"
                    value={cardDetails.cardHolder}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      maxLength="5"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      maxLength="3"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Processing...</span>
                      </div>
                    ) : (
                      <span>Pay Now</span>
                    )}
                  </Button>
                </div>
              </form>
            )}
            
            {paymentMethod === 'paypal' && (
              <div className="space-y-4">
                <p className="text-gray-600">You will be redirected to PayPal to complete your payment.</p>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSubmitPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    <span>Continue to PayPal</span>
                  )}
                </Button>
              </div>
            )}
            
            {paymentMethod === 'cash' && (
              <div className="space-y-4">
                <p className="text-gray-600">You will pay when your order is delivered.</p>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSubmitPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    <span>Place Order with Cash on Delivery</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            {order && (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-500 mb-1">Order Number</p>
                  <p className="font-medium">{order.orderNumber || 'N/A'}</p>
                </div>
                
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-500 mb-2">Items</p>
                  <ul className="space-y-2">
                    {order.items && order.items.map((item, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product?.name || 'Product'}</span>
                        <span>Nu. {((item.price || 0) * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>Nu. {order.total ? order.total.toFixed(2) : '0.00'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Nu. 0.00</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>Nu. 0.00</span>
                  </div>
                  
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>Nu. {order.total ? order.total.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
