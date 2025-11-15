import { useState } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import logoUrl from '@assets/mascot-logo-optimized.png';

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "We'll get back to you within 24 hours.",
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
        <Header />

        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="bg-teal-900/50 text-teal-300 mb-4">
              Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions, feedback, or need help? We're here to assist you.
              Reach out through any of the channels below.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/20 transition-all">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-teal-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email Support</h3>
                      <p className="text-gray-300 text-sm mb-2">
                        Get help with technical issues or account questions
                      </p>
                      <a
                        href="mailto:support@microjpeg.com"
                        className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                      >
                        support@microjpeg.com
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/20 transition-all">
                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-6 h-6 text-teal-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Live Chat</h3>
                      <p className="text-gray-300 text-sm mb-2">
                        Chat with our support team in real-time
                      </p>
                      <span className="text-sm text-gray-400">
                        Available Mon-Fri, 9AM-6PM EST
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/20 transition-all">
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-teal-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Enterprise Support</h3>
                      <p className="text-gray-300 text-sm mb-2">
                        Dedicated support for enterprise customers
                      </p>
                      <span className="text-sm text-gray-400">
                        Available 24/7 for Enterprise plans
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/20 transition-all">
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-teal-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Response Times</h3>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div>Free users: 48-72 hours</div>
                        <div>Pro users: 24 hours</div>
                        <div>Enterprise: 4 hours</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Send us a Message</h2>
                  <p className="text-gray-300">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        data-testid="input-name"
                        className="bg-gray-700/50 border-teal-500/30 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                        className="bg-gray-700/50 border-teal-500/30 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What can we help you with?"
                      data-testid="input-subject"
                      className="bg-gray-700/50 border-teal-500/30 text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please describe your question or issue in detail..."
                      data-testid="textarea-message"
                      className="bg-gray-700/50 border-teal-500/30 text-white placeholder-gray-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all text-white"
                    disabled={isSubmitting}
                    data-testid="button-submit"
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Frequently Asked Questions
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  How quickly will I receive a response?
                </h3>
                <p className="text-gray-300 text-sm">
                  Response times vary by plan: Free users get responses within 48-72 hours,
                  Pro users within 24 hours, and Enterprise customers within 4 hours.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Do you offer phone support?
                </h3>
                <p className="text-gray-300 text-sm">
                  Phone support is available exclusively for Enterprise customers with
                  24/7 availability. All other users can reach us via email or live chat.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Can you help with API integration?
                </h3>
                <p className="text-gray-300 text-sm">
                  Absolutely! Our team can provide guidance on API integration,
                  documentation, and best practices for implementing our service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  What about billing questions?
                </h3>
                <p className="text-gray-300 text-sm">
                  For billing inquiries, subscription changes, or payment issues,
                  contact us at billing@microjpeg.com for fastest resolution.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800/50 backdrop-blur-xl border-t border-teal-500/30 text-white py-12 relative z-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img src={logoUrl} alt="MicroJPEG Logo" className="w-10 h-10" />
                  <span className="text-xl font-bold">MicroJPEG</span>
                </div>
                <p className="text-gray-300">
                  The smartest way to compress and optimize your images for the web.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-semibold mb-4 text-teal-400">Product</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><Link href="/features" className="hover:text-teal-400 transition-colors">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
                  <li><Link href="/api-docs" className="hover:text-teal-400 transition-colors">API</Link></li>
                  <li><Link href="/api-docs" className="hover:text-teal-400 transition-colors">Documentation</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-semibold mb-4 text-teal-400">Company</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><Link href="/about" className="hover:text-teal-400 transition-colors">About</Link></li>
                  <li><Link href="/blog" className="hover:text-teal-400 transition-colors">Blog</Link></li>
                  <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link></li>
                  <li><Link href="/support" className="hover:text-teal-400 transition-colors">Support</Link></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold mb-4 text-teal-400">Legal</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><Link href="/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms-of-service" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
                  <li><Link href="/cookie-policy" className="hover:text-teal-400 transition-colors">Cookie Policy</Link></li>
                  <li><Link href="/cancellation-policy" className="hover:text-teal-400 transition-colors">Cancellation Policy</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-teal-400 transition-colors">GDPR</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-teal-500/30 mt-8 pt-8 text-center text-gray-400">
              <p>© 2025 MicroJPEG. All rights reserved. Making the web faster, one image at a time.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}