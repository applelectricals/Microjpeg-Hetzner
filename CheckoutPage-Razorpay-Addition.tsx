// Add this section to your existing CheckoutPage.tsx
// Place it AFTER the PayPal payment sections

{/* ========================================
    RAZORPAY PAYMENT (FOR INDIA) 
    ======================================== */}

{/* Razorpay Payment - For Indian Users */}
<div className="border-2 border-green-500 rounded-lg p-4 bg-green-900/20 shadow-lg shadow-green-500/20">
  <div className="flex items-center justify-between mb-3">
    <div>
      <h3 className="font-bold text-white">Pay with Cards/UPI (India)</h3>
      <p className="text-sm text-gray-400">
        For Indian customers - All payment methods
      </p>
    </div>
    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">
      🇮🇳 RECOMMENDED FOR INDIA
    </span>
  </div>
  
  <p className="text-sm text-gray-300 mb-2">
    ✓ Credit/Debit Cards (Visa, Mastercard, RuPay)<br/>
    ✓ UPI (Google Pay, PhonePe, Paytm)<br/>
    ✓ Net Banking & Wallets
  </p>
  
  <div className="bg-green-900/30 border border-green-500/50 rounded p-2 mb-3">
    <p className="text-xs text-green-200">
      ✓ Works perfectly in India - All payment methods supported
    </p>
  </div>
  
  <button
    onClick={handleRazorpayPayment}
    disabled={isProcessing}
    className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Pay ₹{convertToINR(totalPrice)} with Razorpay
  </button>
</div>


{/* ========================================
    ADD THESE FUNCTIONS TO YOUR COMPONENT
    ======================================== */}

// Convert USD to INR (approximate rate)
const convertToINR = (usd: number) => {
  const rate = 83; // $1 = ₹83 (update as needed)
  return Math.round(usd * rate);
};

// Load Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
      resolve(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Handle Razorpay payment
const handleRazorpayPayment = async () => {
  console.log('🔄 Initiating Razorpay payment...');
  
  // Load Razorpay script
  const scriptLoaded = await loadRazorpayScript();
  
  if (!scriptLoaded) {
    alert('Failed to load payment gateway. Please refresh and try again.');
    return;
  }

  setIsProcessing(true);
  setProcessingMessage('Initializing payment...');

  try {
    const amountINR = convertToINR(totalPrice);

    // Create order on backend
    console.log('📦 Creating Razorpay order...');
    
    const orderResponse = await fetch('/api/payment/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        plan: `${selectedPlan}-${billingCycle}`,
        quantity,
        amount: amountINR,
      }),
    });

    if (!orderResponse.ok) {
      throw new Error('Failed to create order');
    }

    const orderData = await orderResponse.json();
    
    if (!orderData.success) {
      throw new Error(orderData.error || 'Failed to create order');
    }

    console.log('✅ Order created:', orderData.order_id);

    // Razorpay checkout options
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'MicroJPEG',
      description: `${currentPlan.name} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
      image: '/logo.png', // Your logo URL
      order_id: orderData.order_id,
      
      // Payment success handler
      handler: async function (response: any) {
        console.log('✅ Payment successful:', response.razorpay_payment_id);
        
        setProcessingMessage('Verifying payment...');
        
        try {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/payment/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: `${selectedPlan}-${billingCycle}`,
              quantity,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyResponse.ok && verifyData.success) {
            console.log('✅ Payment verified');
            setProcessingMessage('Redirecting to success page...');
            
            setTimeout(() => {
              window.location.href = `/payment-success?plan=${selectedPlan}-${billingCycle}&payment_id=${response.razorpay_payment_id}`;
            }, 1000);
          } else {
            throw new Error(verifyData.error || 'Payment verification failed');
          }
        } catch (error: any) {
          console.error('❌ Verification error:', error);
          setIsProcessing(false);
          alert('Payment verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
        }
      },
      
      // Prefill user details
      prefill: {
        name: user?.firstName || user?.email || '',
        email: user?.email || '',
      },
      
      // Theme customization
      theme: {
        color: '#14b8a6', // Teal color to match your theme
      },
      
      // Modal settings
      modal: {
        ondismiss: function() {
          console.log('❌ Payment cancelled by user');
          setIsProcessing(false);
        },
        escape: true,
        backdropclose: false,
      },
      
      // Notes
      notes: {
        plan: `${selectedPlan}-${billingCycle}`,
        quantity: quantity.toString(),
      },
    };

    // @ts-ignore - Razorpay types
    const razorpay = new window.Razorpay(options);
    
    // Handle payment failure
    razorpay.on('payment.failed', function (response: any) {
      console.error('❌ Payment failed:', response.error);
      setIsProcessing(false);
      alert('Payment failed: ' + response.error.description);
    });

    // Open Razorpay checkout
    razorpay.open();
    setIsProcessing(false); // Remove processing overlay as Razorpay modal is shown

  } catch (error: any) {
    console.error('❌ Razorpay payment error:', error);
    setIsProcessing(false);
    alert('Failed to initialize payment. Please try again.');
  }
};
