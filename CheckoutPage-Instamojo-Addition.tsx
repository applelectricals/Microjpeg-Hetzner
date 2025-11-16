// Add this to your CheckoutPage.tsx

{/* ========================================
    INSTAMOJO PAYMENT (FOR INDIA) 
    ======================================== */}

{/* Instamojo Payment - For Indian Users */}
<div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-900/20 shadow-lg shadow-blue-500/20">
  <div className="flex items-center justify-between mb-3">
    <div>
      <h3 className="font-bold text-white">Pay with Instamojo (India)</h3>
      <p className="text-sm text-gray-400">
        Trusted payment gateway for India
      </p>
    </div>
    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-semibold">
      🇮🇳 FOR INDIA
    </span>
  </div>
  
  <p className="text-sm text-gray-300 mb-2">
    ✓ Credit/Debit Cards (Visa, Mastercard, RuPay)<br/>
    ✓ Net Banking (All major banks)<br/>
    ✓ UPI & Wallets
  </p>
  
  <div className="bg-blue-900/30 border border-blue-500/50 rounded p-2 mb-3">
    <p className="text-xs text-blue-200">
      ✓ Trusted by 1M+ Indian businesses
    </p>
  </div>
  
  <button
    onClick={handleInstamojoPayment}
    disabled={isProcessing}
    className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Pay ₹{convertToINR(totalPrice)} with Instamojo
  </button>
</div>


{/* ========================================
    ADD THIS FUNCTION TO YOUR COMPONENT
    ======================================== */}

// Handle Instamojo payment
const handleInstamojoPayment = async () => {
  console.log('🔄 Initiating Instamojo payment...');

  setIsProcessing(true);
  setProcessingMessage('Redirecting to Instamojo...');

  try {
    const amountINR = convertToINR(totalPrice);

    // Create payment on backend
    const response = await fetch('/api/payment/instamojo/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        plan: `${selectedPlan}-${billingCycle}`,
        quantity,
        amount: amountINR,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to create payment');
    }

    console.log('✅ Payment created, redirecting to Instamojo');

    // Redirect to Instamojo payment page
    window.location.href = data.paymentUrl;

  } catch (error: any) {
    console.error('❌ Instamojo payment error:', error);
    setIsProcessing(false);
    alert('Failed to initialize payment. Please try again.');
  }
};

// Helper function (if you don't have it already)
const convertToINR = (usd: number) => {
  const rate = 83; // $1 = ₹83
  return Math.round(usd * rate);
};
