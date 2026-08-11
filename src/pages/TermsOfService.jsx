import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ShieldAlert, Scale, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
              <Scale className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-500 text-sm">Last updated: August 2026 • Government-grade Blockchain Registry Governance</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed">
          
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <FileCheck className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="font-serif text-xl font-bold text-gray-900">1. Agreement to Terms</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              By registering an account, connecting a Web3 wallet, or submitting land records on LandLedger, you agree to be bound by these legal Terms of Service and all applicable national land registry regulations.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="font-serif text-xl font-bold text-gray-900">2. User Responsibilities & Identity Verification</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-gray-600">
              <li>All registered sellers must submit authentic title deeds and official survey documents.</li>
              <li>Falsification of documents, illegal land claims, or impersonation of government officers is strictly prohibited and subject to legal prosecution.</li>
              <li>Users are responsible for securing their private keys and Web3 wallet credentials.</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <Scale className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="font-serif text-xl font-bold text-gray-900">3. Officer Verification & Smart Contract Execution</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              Property transfers are pending until approved by an assigned Government Officer. Once an officer approves the transaction, the smart contract automatically executes and logs the permanent transfer on the Arbitrum Sepolia blockchain network.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="font-serif text-xl font-bold text-gray-900">4. Legal Contact</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              For legal inquiries or regulatory compliance requests, please reach out to <a href="mailto:legal@landledger.gov.in" className="text-amber-700 font-semibold underline">legal@landledger.gov.in</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
