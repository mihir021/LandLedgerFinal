import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, HelpCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ContactSupport() {
  const { showSuccess } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showSuccess('Your support ticket has been submitted! Our team will respond shortly.');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform text-amber-600" />
            Back to Home
          </Link>
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mb-3">
            <Mail className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Contact Support</h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Have questions about property registration, title verification, or Web3 wallet connection? Our support desk is here to help 24/7.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Support Info Sidebar */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Email Support</h3>
                  <p className="text-xs text-gray-500">Fast response within 2 hours</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">support@landledger.gov.in</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Toll-Free Helpline</h3>
                  <p className="text-xs text-gray-500">Mon - Sat (9 AM - 7 PM IST)</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">1800-11-LAND (1800-11-5263)</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Headquarters</h3>
                  <p className="text-xs text-gray-500">Central Land Registry Office</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-snug">
                Ministry of Land & Revenue Complex, Electronics City, Bengaluru, Karnataka - 560100
              </p>
            </div>

          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mb-2">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-gray-900">Message Received!</h3>
                <p className="text-gray-500 max-w-md mx-auto text-sm">
                  Thank you for reaching out. Ticket <span className="font-mono font-bold text-gray-800">#LL-83921</span> has been opened for your request.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-serif text-xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Property Verification Inquiry"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your query or issue in detail..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-semibold text-sm text-[#0A1628] shadow-md transition-all hover:shadow-lg cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #FDE047)' }}
                >
                  <Send className="h-4 w-4" /> Send Message
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
