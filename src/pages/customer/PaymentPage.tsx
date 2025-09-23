import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';

type PaymentStatus = 'success' | 'failed' | 'pending';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [orderId, setOrderId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  useEffect(() => {
    // Get payment details from URL params
    const statusParam = searchParams.get('status') as PaymentStatus;
    const orderIdParam = searchParams.get('orderId');
    const amountParam = searchParams.get('amount');
    const methodParam = searchParams.get('method');

    if (statusParam) setStatus(statusParam);
    if (orderIdParam) setOrderId(orderIdParam);
    if (amountParam) setAmount(amountParam);
    if (methodParam) setPaymentMethod(methodParam);
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Clock className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Payment Pending';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Your payment has been processed successfully. Your order is being prepared.';
      case 'failed':
        return 'There was an issue processing your payment. Please try again.';
      default:
        return 'Your payment is being processed. You will receive a confirmation shortly.';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center">
            {/* Status Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              {getStatusIcon()}
            </motion.div>

            {/* Status Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl font-bold mb-4 ${getStatusColor()}`}
            >
              {getStatusTitle()}
            </motion.h1>

            {/* Status Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-6"
            >
              {getStatusMessage()}
            </motion.p>

            {/* Payment Details */}
            {(orderId || amount || paymentMethod) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`rounded-lg p-4 mb-6 text-left ${
                  paymentMethod === 'cash' 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-gray-50'
                }`}
              >
                <h3 className="font-semibold mb-3">Order Details</h3>
                {orderId && (
                  <div className={`flex justify-between mb-2 p-2 rounded ${
                    paymentMethod === 'cash' ? 'bg-green-100' : 'bg-white'
                  }`}>
                    <span className="text-gray-600">Order ID:</span>
                    <span className={`font-bold ${
                      paymentMethod === 'cash' ? 'text-green-700' : 'text-gray-900'
                    }`}>#{orderId}</span>
                  </div>
                )}
                {amount && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{amount}</span>
                  </div>
                )}
                {paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className={`font-medium ${
                      paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {paymentMethod === 'cash' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}
                    </span>
                  </div>
                )}
                {paymentMethod === 'cash' && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-700">
                      💰 <strong>Cash Payment:</strong> Pay ₹{amount} when your order arrives
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              {status === 'success' && (
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate(`/orders/${orderId}/track`)}
                    className="w-full bg-gradient-primary"
                  >
                    Track Your Order
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/orders')}
                    className="w-full"
                  >
                    View All Orders
                  </Button>
                </div>
              )}

              {status === 'failed' && (
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/cart')}
                    className="w-full bg-gradient-primary"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full"
                  >
                    Back to Home
                  </Button>
                </div>
              )}

              {status === 'pending' && (
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/orders')}
                    variant="outline"
                    className="w-full"
                  >
                    Check Order Status
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="w-full"
                  >
                    Back to Home
                  </Button>
                </div>
              )}

              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="w-full text-gray-500"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </motion.div>

            {/* Payment Gateway Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 pt-4 border-t border-gray-200"
            >
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <ExternalLink className="h-4 w-4" />
                <span>Powered by secure payment gateways</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
