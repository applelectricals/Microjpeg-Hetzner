import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { Shield, Settings, BarChart3, Lock } from "lucide-react";
import { Link } from "wouter";
import logoUrl from '@assets/mascot-logo-optimized.png';

export default function CookiePolicy() {
  useEffect(() => {
    document.title = "Cookie Policy - Micro JPEG";
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-white">
              Cookie Policy
            </CardTitle>
            <p className="text-gray-400 text-center mt-4">
              Last updated: September 7, 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <p className="text-gray-300 mb-6">
              This Cookie Policy explains how Micro JPEG uses cookies and similar tracking technologies when you visit our website. We want to ensure you understand what cookies are, how we use them, and what choices you have regarding their use.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">What are Cookies?</h2>
                <p className="text-gray-300 mb-4">
                  Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences, improve your experience, and provide analytics about how the site is used.
                </p>
                <p className="text-gray-300">
                  Cookies can be "persistent" (remain on your device until deleted or expired) or "session" (deleted when you close your browser).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Types of Cookies We Use</h2>

                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-white">
                        <Lock className="w-5 h-5 mr-2 text-red-400" />
                        Essential Cookies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-3">
                        Required for basic website functionality. Cannot be disabled.
                      </p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Authentication and login sessions</li>
                        <li>• Security and fraud prevention</li>
                        <li>• Basic site functionality</li>
                        <li>• User preferences</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-white">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                        Analytics Cookies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-3">
                        Help us understand how you use our website to improve your experience.
                      </p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Page views and site usage</li>
                        <li>• User interactions and behavior</li>
                        <li>• Performance metrics</li>
                        <li>• Error tracking</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-white">
                        <Settings className="w-5 h-5 mr-2 text-green-400" />
                        Functional Cookies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-3">
                        Remember your preferences and settings for a better experience.
                      </p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Language preferences</li>
                        <li>• Theme and display settings</li>
                        <li>• Compression preferences</li>
                        <li>• Interface customizations</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-white">
                        <Shield className="w-5 h-5 mr-2 text-purple-400" />
                        Performance Cookies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-3">
                        Monitor and improve website performance and loading times.
                      </p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Page load times</li>
                        <li>• Server response monitoring</li>
                        <li>• Resource optimization</li>
                        <li>• Network performance</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Specific Cookies We Use</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-teal-500/30">
                    <thead>
                      <tr className="bg-gray-800/50">
                        <th className="border border-teal-500/30 px-4 py-2 text-left text-white">Cookie Name</th>
                        <th className="border border-teal-500/30 px-4 py-2 text-left text-white">Purpose</th>
                        <th className="border border-teal-500/30 px-4 py-2 text-left text-white">Duration</th>
                        <th className="border border-teal-500/30 px-4 py-2 text-left text-white">Type</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="border border-teal-500/30 px-4 py-2 font-mono text-gray-300">session_id</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">User authentication and session management</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">7 days</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">Essential</td>
                      </tr>
                      <tr>
                        <td className="border border-teal-500/30 px-4 py-2 font-mono text-gray-300">preferences</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">Store user compression and UI preferences</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">30 days</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">Functional</td>
                      </tr>
                      <tr>
                        <td className="border border-teal-500/30 px-4 py-2 font-mono text-gray-300">analytics</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">Track usage patterns and improve service</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">1 year</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">Analytics</td>
                      </tr>
                      <tr>
                        <td className="border border-teal-500/30 px-4 py-2 font-mono text-gray-300">performance</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">Monitor site performance and loading times</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">30 days</td>
                        <td className="border border-teal-500/30 px-4 py-2 text-gray-300">Performance</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Cookies</h2>
                <p className="text-gray-300 mb-4">
                  We may use third-party services that set their own cookies:
                </p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li><strong>Stripe:</strong> For secure payment processing (essential for subscription management)</li>
                  <li><strong>Google Analytics:</strong> For website analytics and usage insights (can be opted out)</li>
                  <li><strong>SendGrid:</strong> For email delivery and communication preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Managing Your Cookie Preferences</h2>
                <p className="text-gray-300 mb-4">
                  You have several options for managing cookies:
                </p>

                <h3 className="text-xl font-medium text-gray-200 mb-3">Browser Settings</h3>
                <p className="text-gray-300 mb-4">
                  Most browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
                  <li>Block all cookies</li>
                  <li>Allow only first-party cookies</li>
                  <li>Delete existing cookies</li>
                  <li>Set up notifications when cookies are set</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-200 mb-3">Our Cookie Preferences</h3>
                <div className="bg-gray-800/50 p-4 rounded-lg mb-4 border border-teal-500/30">
                  <p className="text-gray-300 mb-4">
                    You can manage your cookie preferences for this website:
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="mr-2">
                      Manage Cookie Preferences
                    </Button>
                    <Button variant="outline">
                      Accept All Cookies
                    </Button>
                  </div>
                </div>

                <h3 className="text-xl font-medium text-gray-200 mb-3">Opt-Out Links</h3>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li><a href="https://tools.google.com/dlpage/gaoptout" className="text-teal-400 hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
                  <li><a href="https://www.aboutads.info/choices/" className="text-teal-400 hover:underline" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance Opt-out</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Impact of Disabling Cookies</h2>
                <p className="text-gray-300 mb-4">
                  While you can use our website with most cookies disabled, some functionality may be affected:
                </p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>You may need to log in repeatedly</li>
                  <li>Preferences and settings won't be remembered</li>
                  <li>Some features may not work properly</li>
                  <li>We may not be able to provide personalized experiences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Updates to This Policy</h2>
                <p className="text-gray-300">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by updating the "Last updated" date at the top of this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
                <p className="text-gray-300 mb-4">
                  If you have questions about our use of cookies, please contact us:
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-teal-500/30">
                  <p className="text-gray-300 mb-2"><strong>Email:</strong> privacy@microjpeg.com</p>
                  <p className="text-gray-300"><strong>Subject:</strong> Cookie Policy Inquiry</p>
                </div>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-teal-500/30">
              <p className="text-sm text-gray-400 text-center">
                This Cookie Policy helps you understand how we use cookies to improve your experience while respecting your privacy choices.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
    </>
  );
}