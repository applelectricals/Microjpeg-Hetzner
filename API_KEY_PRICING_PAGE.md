# MIRROR API KEY BUTTON TO PRICING PAGE

## STEP 1: Find existing API key component

Search for the existing API key button:
```bash
grep -r "API.*Key\|apiKey" client/src/pages/
```

## STEP 2: In EnhancedPricingPage.tsx

Find the API packages section (around line 420-450) and ADD:

```typescript
// After the API package cards, add:

{/* API Key Section */}
<Card className="mt-8 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-500">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold mb-2 dark:text-white">
          Need an API Key?
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Generate your API key instantly and start integrating
        </p>
      </div>
      <Button
        onClick={() => window.location.href = '/api'}
        size="lg"
        className="ml-4"
      >
        Get Your API Key →
      </Button>
    </div>
  </CardContent>
</Card>
```

## OR - If you want inline generation:

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// In the component:
const { user, isAuthenticated } = useAuth();
const { toast } = useToast();

// After API packages section:
<Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-2 border-blue-500">
  <CardContent className="p-6">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-2 dark:text-white">
          🔑 Get Your Free API Key
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start with 1,000 free operations. No credit card required.
        </p>
      </div>
      
      {user?.apiKey ? (
        <div className="flex gap-2">
          <Button
            onClick={() => window.location.href = '/api'}
            variant="outline"
          >
            View API Key
          </Button>
          <Button onClick={() => window.location.href = '#api-packages'}>
            Buy More Credits
          </Button>
        </div>
      ) : (
        <Button
          onClick={async () => {
            if (!isAuthenticated) {
              window.location.href = '/login?redirect=/pricing';
              return;
            }
            
            try {
              const response = await fetch('/api/keys/generate', {
                method: 'POST',
                credentials: 'include'
              });
              
              const result = await response.json();
              
              if (result.success) {
                toast({
                  title: '🎉 API Key Generated!',
                  description: 'Check your API dashboard for your key.',
                });
                setTimeout(() => window.location.href = '/api', 1500);
              } else {
                toast({
                  title: 'Error',
                  description: result.error,
                  variant: 'destructive'
                });
              }
            } catch (error) {
              console.error('API key error:', error);
            }
          }}
          size="lg"
          className="min-w-[200px]"
        >
          Generate Free API Key
        </Button>
      )}
    </div>
  </CardContent>
</Card>
```

## EXACT LOCATION IN EnhancedPricingPage.tsx:

Find this section (around line 440):
```typescript
{/* API Prepaid Packages */}
<div className="grid md:grid-cols-3 gap-6">
  {apiPackages.map((pkg) => (
    <Card key={pkg.ops}>
      ...
    </Card>
  ))}
</div>
```

Add RIGHT AFTER the closing `</div>`:
```typescript
{/* API Prepaid Packages */}
<div className="grid md:grid-cols-3 gap-6">
  {/* ... existing cards ... */}
</div>

{/* ADD THIS: */}
<Card className="mt-8 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-500">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold mb-2 dark:text-white">
          🔑 Get Your Free API Key
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start with 1,000 free operations • No credit card required
        </p>
      </div>
      <Button
        onClick={() => window.location.href = '/api'}
        size="lg"
      >
        Get API Key →
      </Button>
    </div>
  </CardContent>
</Card>
```

## THAT'S IT! 
Simple redirect to existing API page where the key generation already works.
