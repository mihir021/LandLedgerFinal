import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, CheckCircle, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform text-amber-600" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-500 text-sm">Last updated: August 2026 • Effective for all LandLedger users</p>
        </div>

        {/* Policy Content Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed">
          
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <Lock className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="font-serif text-xl font-bold text-gray-900">1. Information We Collect</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3">
              LandLedger operates as a government-grade digital land registry platform. To provide immutable property registration and verification services, we collect necessary user and property information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-gray-600">
              <li><strong>Personal Identity:</strong> Full Name, Official Email Address, Phone Number, and Government-issued ID numbers (Aadhaar / Passport).</li>
              <li><strong>Property Records:</strong> Survey Numbers, Title Deeds, Location Coordinates, Boundary Details, and Uploaded Property Images/Documents.</li>
              <li><strong>Web3 Credentials:</strong> Connected Ethereum/Arbitrum Wallet Addresses required to execute smart contract transactions.</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <Eye className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="font-serif text-xl font-bold text-gray-900">2. How We Use Your Data</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3">
              Your data is utilized strictly for government compliance, property ownership verification, and smart contract execution:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-gray-600">
              <li>Verifying user KYC credentials through authorized government officers.</li>
              <li>Anchoring title transfer records permanently on the Arbitrum Sepolia blockchain ledger.</li>
              <li>Preventing fraudulent land sales, duplicate deed registrations, and unauthorized transfers.</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <FileText className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="font-serif text-xl font-bold text-gray-900">3. Blockchain Immutability Notice</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              Please note that transactions recorded on the blockchain (such as land transfer records and cryptographic hash verification logs) are permanent and publicly accessible by design. Off-chain sensitive document files remain encrypted and access-controlled within secure MongoDB clusters.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <CheckCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="font-serif text-xl font-bold text-gray-900">4. Contacting Our Data Officer</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              If you have any questions regarding your data rights or wish to report a privacy concern, please contact our Compliance Department at <a href="mailto:privacy@landledger.gov.in" className="text-amber-700 font-semibold underline">privacy@landledger.gov.in</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
