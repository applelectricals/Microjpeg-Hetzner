import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { signupSchema, type SignupInput } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, UserPlus, Check, X, Mail, User, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import logoPath from "@assets/mascot_1758657553459.webp";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const watchedEmail = form.watch("email");
  const watchedPassword = form.watch("password");

  // Email availability check
  useEffect(() => {
    const checkEmail = async () => {
      if (!watchedEmail || !watchedEmail.includes("@")) {
        setEmailAvailable(null);
        return;
      }

      setCheckingEmail(true);
      try {
        const response = await apiRequest("POST", "/api/auth/check-email", { email: watchedEmail });
        const data = await response.json();
        setEmailAvailable(data.available);
      } catch (error) {
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedEmail]);

  // Password strength indicators
  const passwordChecks = {
    length: watchedPassword.length >= 8,
    uppercase: /[A-Z]/.test(watchedPassword),
    lowercase: /[a-z]/.test(watchedPassword),
    number: /[0-9]/.test(watchedPassword),
  };

  const signupMutation = useMutation({
    mutationFn: async (data: SignupInput) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account before using all features.",
      });
      
      // Redirect based on subscription tier (new users typically get free tier)
      const user = data.user;
      const tier = user?.subscription_tier || user?.subscriptionTier;
      if (tier === 'test_premium') {
        setLocation("/test-premium");
      } else if (tier === 'premium') {
        setLocation("/compress-premium");
      } else if (tier === 'enterprise') {
        setLocation("/compress-enterprise");
      } else {
        setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupInput) => {
    if (emailAvailable === false) {
      toast({
        title: "Email unavailable",
        description: "This email is already registered. Please use a different email.",
        variant: "destructive",
      });
      return;
    }
    signupMutation.mutate(data);
  };

  const PasswordIndicator = ({ check, label }: { check: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {check ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-gray-400" />
      )}
      <span className={check ? "text-green-700" : "text-gray-500"}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center mb-4">
            <img src={logoPath} alt="MicroJPEG Logo" className="w-16 h-16" style={{mixBlendMode: 'multiply'}} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600 bg-clip-text text-transparent">
            MicroJPEG
          </h1>
          <p className="text-gray-700 text-lg font-medium">Professional image compression</p>
          <p className="text-sm text-gray-500">Create your account and start optimizing images instantly</p>
        </div>

        <Card className="border-2 border-orange-100 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Create your account
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Join thousands of users compressing images efficiently
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Signup Button */}
            <Button 
              onClick={() => window.location.href = '/api/login'}
              variant="outline"
              className="w-full h-12 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-gray-800 hover:text-blue-900 font-medium shadow-md hover:shadow-lg"
              data-testid="button-google-signup"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-medium">Or create with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...form.register("firstName")}
                      className={`pl-10 h-12 border-orange-200 focus:border-orange-400 focus:ring-orange-400 ${
                        form.formState.errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                  </div>
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      {...form.register("lastName")}
                      className={`pl-10 h-12 border-orange-200 focus:border-orange-400 focus:ring-orange-400 ${
                        form.formState.errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                  </div>
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...form.register("email")}
                    className={`pl-10 pr-10 h-12 border-orange-200 focus:border-orange-400 focus:ring-orange-400 ${
                      form.formState.errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  <div className="absolute right-3 top-3">
                    {checkingEmail ? (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    ) : emailAvailable === true ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : emailAvailable === false ? (
                      <X className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
                {emailAvailable === false && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    This email is already registered
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    {...form.register("password")}
                    className={`pr-12 h-12 border-orange-200 focus:border-orange-400 focus:ring-orange-400 ${
                      form.formState.errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
                
                {/* Password strength indicators */}
                {watchedPassword && (
                  <div className="space-y-2 mt-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Password requirements:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <PasswordIndicator check={passwordChecks.length} label="8+ characters" />
                      <PasswordIndicator check={passwordChecks.uppercase} label="Uppercase" />
                      <PasswordIndicator check={passwordChecks.lowercase} label="Lowercase" />
                      <PasswordIndicator check={passwordChecks.number} label="Number" />
                    </div>
                  </div>
                )}
                
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {signupMutation.error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {(signupMutation.error as any)?.message || "Signup failed. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200" 
                disabled={signupMutation.isPending || emailAvailable === false}
              >
                {signupMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="font-bold text-orange-600 hover:text-orange-700 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
              <div className="text-center mt-3">
                <p className="text-xs text-gray-600 font-medium">
                  ✓ Free forever plan ✓ No credit card required ✓ Start compressing immediately
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}