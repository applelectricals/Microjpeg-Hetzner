import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  const plan = searchParams.get('plan') || 'subscription';
  const subscriptionId = searchParams.get('subscription_id');
  const orderId = searchParams.get('order_id');

  // Plan display names
  const planNames: Record<string, string> = {
    'starter-monthly': 'Starter Monthly',
    'starter-yearly': 'Starter Yearly',
    'pro-monthly': 'Pro Monthly',
    'pro-yearly': 'Pro Yearly',
    'business-monthly': 'Business Monthly',
    'business-yearly': 'Business Yearly',
    'cdn-starter': 'CDN Starter',
    'cdn-business': 'CDN Business',
    'cdn-enterprise': 'CDN Enterprise',
    'api-10k': '10K API Operations',
    'api-50k': '50K API Operations',
    'api-100k': '100K API Operations',
  };

  const planName = planNames[plan] || 'Subscription';
  const isSubscription = subscriptionId !== null;
  const isAPIPackage = plan.startsWith('api-');

  // Countdown timer
  useEffect(() => {
    if (countdown === 0) {
      if (isAPIPackage) {
        navigate('/api-dashboard');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate, isAPIPackage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-green-500 rounded-full p-6">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <Card className="border-2 border-green-500 dark:border-green-400">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">
                🎉 Payment Successful!
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for your purchase
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Plan Details */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Purchase Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                    <span className="font-semibold">{planName}</span>
                  </div>
                  
                  {subscriptionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subscription ID:</span>
                      <span className="font-mono text-sm">{subscriptionId}</span>
                    </div>
                  )}
                  
                  {orderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                      <span className="font-mono text-sm">{orderId}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                    <span className="font-semibold">PayPal</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="text-green-600 font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">What's Next?</h3>
                <ul className="space-y-3">
                  {isSubscription && !isAPIPackage && (
                    <>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>Your subscription is now active and ready to use</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>Enjoy unlimited compressions with your new limits</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>Automatic renewal on your next billing date</span>
                      </li>
                    </>
                  )}
                  
                  {isAPIPackage && (
                    <>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>API credits have been added to your account</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>Credits never expire - use them anytime</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span>View your balance in the API dashboard</span>
                      </li>
                    </>
                  )}
                  
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>Confirmation email sent to your inbox</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => isAPIPackage ? navigate('/api-dashboard') : navigate('/dashboard')}
                  className="w-full"
                  size="lg"
                >
                  {isAPIPackage ? 'Go to API Dashboard' : 'Go to Dashboard'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
              </div>

              {/* Auto Redirect Notice */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Redirecting to dashboard in {countdown} seconds...
              </div>
            </CardContent>
          </Card>

          {/* Support Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              Need help?{' '}
              <a href="/support" className="text-blue-600 hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
