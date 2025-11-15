import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { XCircle, ArrowRight, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/header';

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  return { isDark, setIsDark };
}

export default function PaymentError() {
  const { isDark, setIsDark } = useDarkMode();
  const [, setLocation] = useLocation();
  const [errorData, setErrorData] = useState<any>(null);

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionId = urlParams.get('subscription_id');
    const orderId = urlParams.get('order_id');
    const error = urlParams.get('error');

    setErrorData({
      subscriptionId,
      orderId,
      error
    });
  }, []);

  const getErrorMessage = (errorCode: string | null) => {
    const messages: Record<string, string> = {
      'activation_failed': 'We couldn\'t activate your subscription automatically.',
      'processing_failed': 'We encountered an error processing your payment.',
      'verification_failed': 'We couldn\'t verify your payment with PayPal.',
      'default': 'An unexpected error occurred while processing your payment.'
    };

    return messages[errorCode || 'default'] || messages['default'];
  };

  const errorMessage = getErrorMessage(errorData?.error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900">
      <Header isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Payment Needs Attention
          </h1>
          <p className="text-xl text-gray-300">
            Don't worry - your payment was successful
          </p>
        </div>

        {/* Main Error Card */}
        <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50 p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              What Happened?
            </h2>
            <p className="text-gray-300 text-lg mb-4">
              {errorMessage}
            </p>
            <p className="text-gray-400">
              Your payment was successfully processed by PayPal, but we encountered a technical issue 
              activating your subscription in our system. Our team has been notified and will resolve 
              this within 24 hours.
            </p>
          </div>

          {/* Reference IDs */}
          {(errorData?.subscriptionId || errorData?.orderId) && (
            <div className="bg-gray-900/50 p-4 rounded-lg mb-6">
              <p className="text-gray-400 text-sm mb-2">
                📋 Please save this information for reference:
              </p>
              {errorData.subscriptionId && (
                <div className="mb-2">
                  <span className="text-gray-400 text-sm">Subscription ID:</span>
                  <p className="text-white font-mono text-sm break-all">
                    {errorData.subscriptionId}
                  </p>
                </div>
              )}
              {errorData.orderId && (
                <div>
                  <span className="text-gray-400 text-sm">Order ID:</span>
                  <p className="text-white font-mono text-sm break-all">
                    {errorData.orderId}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-teal-400" />
              What Happens Next?
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-400 text-sm font-bold">1</span>
                </span>
                <span>
                  <strong className="text-white">Our team has been notified</strong> - We'll manually 
                  activate your subscription within 24 hours.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-400 text-sm font-bold">2</span>
                </span>
                <span>
                  <strong className="text-white">You'll receive an email</strong> - We'll notify you 
                  once your subscription is active (usually within a few hours).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-400 text-sm font-bold">3</span>
                </span>
                <span>
                  <strong className="text-white">No additional payment required</strong> - Your payment 
                  was already processed successfully.
                </span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Contact Support Card */}
        <Card className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-xl border-teal-500/50 p-6 mb-6">
          <div className="flex items-start gap-4">
            <Mail className="w-8 h-8 text-teal-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Need Immediate Assistance?
              </h3>
              <p className="text-gray-200 mb-4">
                If you need your subscription activated urgently, please contact our support team 
                with the reference ID(s) above.
              </p>
              <Button
                onClick={() => window.location.href = `mailto:support@microjpeg.com?subject=Payment Activation Issue&body=Subscription ID: ${errorData?.subscriptionId || errorData?.orderId || 'N/A'}%0D%0A%0D%0APlease activate my subscription.`}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </Button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => setLocation('/compress')}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
          >
            Continue to App
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setLocation('/pricing')}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            View Pricing
          </Button>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Common Questions</h3>
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            <Card className="bg-gray-800/30 border-gray-700/30 p-4">
              <p className="text-white font-semibold mb-2">
                Will I be charged again?
              </p>
              <p className="text-gray-400 text-sm">
                No. Your payment was already processed successfully. You won't be charged again.
              </p>
            </Card>
            <Card className="bg-gray-800/30 border-gray-700/30 p-4">
              <p className="text-white font-semibold mb-2">
                How long until my subscription is active?
              </p>
              <p className="text-gray-400 text-sm">
                Most cases are resolved within 1-4 hours during business hours. Maximum 24 hours.
              </p>
            </Card>
            <Card className="bg-gray-800/30 border-gray-700/30 p-4">
              <p className="text-white font-semibold mb-2">
                Can I use the service now?
              </p>
              <p className="text-gray-400 text-sm">
                You can use the free tier features now. Premium features will be available once we 
                activate your subscription.
              </p>
            </Card>
          </div>
        </div>

        {/* Support Contact */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>
            Support Email:{' '}
            <a href="mailto:support@microjpeg.com" className="text-teal-400 hover:text-teal-300">
              support@microjpeg.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
