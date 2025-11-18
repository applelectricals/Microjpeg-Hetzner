import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { SEOHead } from '@/components/SEOHead';
import Header from '@/components/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '';

export default function ApiSignup() {
  const [step, setStep] = useState<'signup' | 'success'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApiKey(data.apiKey);
        setStep('success');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seoData = {
    title: 'Get Your Free API Key - MicroJPEG',
    description: 'Sign up for a free MicroJPEG API key. Get 200 free image compressions per month. No credit card required. Instant activation.',
    keywords: 'free API key, image compression API, MicroJPEG signup, free tier',
  };

  return (
    <>
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://microjpeg.com/api-signup"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        
        <Header />

        <div className="relative z-10 pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4">
            
            {step === 'signup' ? (
              <>
                {/* Signup Form */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                    Get Your <span className="bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">Free API Key</span>
                  </h1>
                  <p className="text-xl text-gray-300">
                    200 free compressions per month • No credit card required
                  </p>
                </div>

                <Card className="bg-gray-800/50 backdrop-blur-xl border-teal-500/30 p-8">
                  <form onSubmit={handleSignup} className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <Label htmlFor="email" className="text-white flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <Label htmlFor="password" className="text-white flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 pr-20"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <Label htmlFor="confirmPassword" className="text-white flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4" />
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-900/50 text-teal-500 focus:ring-teal-500"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-300">
                        I agree to the{' '}
                        <Link href="/terms" className="text-teal-400 hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-teal-400 hover:underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    {/* CAPTCHA */}
                    {RECAPTCHA_SITE_KEY && (
                      <div className="flex justify-center">
                        <ReCAPTCHA
                          sitekey={RECAPTCHA_SITE_KEY}
                          onChange={(token) => {
                            setCaptchaToken(token);
                            if (error === 'Please complete the CAPTCHA verification') {
                              setError('');
                            }
                          }}
                          theme="dark"
                        />
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-6 text-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Get Free API Key
                        </>
                      )}
                    </Button>

                    {/* Login Link */}
                    <p className="text-center text-gray-400 text-sm">
                      Already have an account?{' '}
                      <Link href="/login" className="text-teal-400 hover:underline">
                        Login
                      </Link>
                    </p>
                  </form>
                </Card>

                {/* Features */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-800/30 backdrop-blur-xl rounded-lg border border-teal-500/20">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-teal-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">200 Free Monthly</h3>
                    <p className="text-gray-400 text-sm">Compressions per month</p>
                  </div>

                  <div className="text-center p-4 bg-gray-800/30 backdrop-blur-xl rounded-lg border border-teal-500/20">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-teal-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">No Credit Card</h3>
                    <p className="text-gray-400 text-sm">Start immediately</p>
                  </div>

                  <div className="text-center p-4 bg-gray-800/30 backdrop-blur-xl rounded-lg border border-teal-500/20">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-teal-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">Instant Access</h3>
                    <p className="text-gray-400 text-sm">API key in seconds</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Success Screen */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                    🎉 <span className="bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent">Your API Key is Ready!</span>
                  </h1>
                  <p className="text-xl text-gray-300">
                    Copy your API key and start compressing images
                  </p>
                </div>

                <Card className="bg-gray-800/50 backdrop-blur-xl border-teal-500/30 p-8">
                  {/* API Key Display */}
                  <div className="mb-6">
                    <Label className="text-white text-lg font-semibold mb-3 block">
                      Your API Key
                    </Label>
                    <div className="relative">
                      <div className="bg-gray-900/70 border border-teal-500/30 rounded-lg p-4 pr-24 font-mono text-teal-400 break-all">
                        {apiKey}
                      </div>
                      <Button
                        onClick={copyApiKey}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 ${
                          copied 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-teal-500 hover:bg-teal-600'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      ⚠️ Save this key securely. You won't be able to see it again.
                    </p>
                  </div>

                  {/* Usage Instructions */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-white text-lg font-semibold">Next Steps:</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-lg">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold">
                          1
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">For WordPress Users</h4>
                          <p className="text-gray-400 text-sm">
                            Go to <strong>WordPress → Media → Micro JPEG API</strong>, paste your API key, and click "Test API Key"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-lg">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold">
                          2
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">For Developers</h4>
                          <p className="text-gray-400 text-sm">
                            Check our <Link href="/api-docs" className="text-teal-400 hover:underline">API Documentation</Link> to integrate with your application
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-lg">
                        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold">
                          3
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Monitor Usage</h4>
                          <p className="text-gray-400 text-sm">
                            Visit your <Link href="/dashboard" className="text-teal-400 hover:underline">Dashboard</Link> to track your API usage and upgrade if needed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Your Free Tier Includes:</h4>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        200 image compressions per month
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        Support for JPEG, PNG, WebP, AVIF, RAW files
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        Up to 75MB per file
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        Email support
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => window.location.href = '/dashboard'}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold"
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/api-docs'}
                      variant="outline"
                      className="flex-1 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                    >
                      View Documentation
                    </Button>
                  </div>
                </Card>

                {/* Need Help */}
                <div className="mt-8 text-center">
                  <p className="text-gray-400">
                    Need help getting started?{' '}
                    <Link href="/docs" className="text-teal-400 hover:underline">
                      Check our guides
                    </Link>
                    {' '}or{' '}
                    <a href="mailto:support@microjpeg.com" className="text-teal-400 hover:underline">
                      contact support
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
