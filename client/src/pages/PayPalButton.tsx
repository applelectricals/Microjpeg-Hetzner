import { useEffect, useRef } from 'react';

interface PayPalButtonProps {
  amount: number;
  description: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  type: 'order';
  userId: string;
  tier: string;
  cycle: string;
}

export default function PayPalButton({
  amount,
  description,
  onSuccess,
  onError,
  userId,
  tier,
  cycle
}: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let script: HTMLScriptElement;

    fetch('/api/paypal/config')
      .then(res => res.json())
      .then(config => {
        if (import.meta.env.DEV) {
          console.log('💳 PayPal config loaded');
        }
        
        if (!config.clientId) {
          console.error('❌ No Client ID');
          return;
        }

        script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${config.clientId}&currency=USD`;
        
        script.addEventListener('load', () => {
          console.log('✅ PayPal SDK loaded');
          if (paypalRef.current && (window as any).paypal) {
            renderButtons();
          }
        });
        
        script.addEventListener('error', (e) => {
          console.error('❌ SDK load failed:', e);
        });
        
        document.body.appendChild(script);
      });

    return () => {
      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const renderButtons = () => {
    if (!paypalRef.current) return;

    const paypal = (window as any).paypal;

    paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'pay',
        height: 45
      },
      createOrder: function(data: any, actions: any) {
        return actions.order.create({
          purchase_units: [{
            description: description,
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2)
            },
            custom_id: userId
          }],
          application_context: {
            shipping_preference: 'NO_SHIPPING'
          }
        });
      },
      onApprove: async function(data: any, actions: any) {
        console.log('💰 Capturing payment...');
        const order = await actions.order.capture();
        console.log('✅ Payment captured:', order);
        
        try {
          const response = await fetch('/api/paypal/order-approved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              userId,
              tier,
              cycle,
              amount
            })
          });

          const result = await response.json();
          onSuccess(result);
        } catch (error) {
          console.error('Backend error:', error);
          onError(error);
        }
      },
      onError: function(err: any) {
        console.error('❌ PayPal error:', err);
        onError(err);
      }
    }).render(paypalRef.current);
  };

  return <div ref={paypalRef} />;
}