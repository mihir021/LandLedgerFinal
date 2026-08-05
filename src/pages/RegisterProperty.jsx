/**
 * Register Property Page
 * Professional multi-field form for property registration.
 */
import { useState } from 'react';
import {
  FiMapPin, FiHash, FiFileText, FiDollarSign,
  FiImage, FiUpload, FiCheckCircle, FiChevronDown,
} from 'react-icons/fi';
import { states, landTypes } from '../services/mockData';

export default function RegisterProperty() {
  const [form, setForm] = useState({
    surveyNumber: '',
    propertyId: '',
    state: '',
    district: '',
    city: '',
    address: '',
    area: '',
    landType: '',
    price: '',
    images: [],
    documents: [],
  });
  const [submitted, setSubmitted] = useState(false);

  /** Update a single form field */
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would call the blockchain API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Register New Property</h1>
        <p className="mt-1 text-sm text-navy-400">
          Submit property details to register on the blockchain. All fields are required.
        </p>
      </div>

      {/* Success Message */}
      {submitted && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 animate-fade-in-up">
          <FiCheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-400">Property Submitted Successfully!</p>
            <p className="text-xs text-emerald-400/70">Your property has been queued for blockchain registration and officer verification.</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-card p-8 animate-fade-in-up delay-100">
        {/* ── Section: Identification ── */}
        <SectionHeading icon={FiHash} title="Property Identification" />
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <InputField
            id="surveyNumber"
            label="Survey Number"
            placeholder="SRV/MH/PUN/2024/XXXX"
            value={form.surveyNumber}
            onChange={(v) => updateField('surveyNumber', v)}
          />
          <InputField
            id="propertyId"
            label="Property ID"
            placeholder="PROP-2024-XXX"
            value={form.propertyId}
            onChange={(v) => updateField('propertyId', v)}
          />
        </div>

        <hr className="my-8 border-white/5" />

        {/* ── Section: Location ── */}
        <SectionHeading icon={FiMapPin} title="Location Details" />
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <SelectField
            id="state"
            label="State"
            value={form.state}
            options={states}
            onChange={(v) => updateField('state', v)}
          />
          <InputField
            id="district"
            label="District"
            placeholder="Enter district"
            value={form.district}
            onChange={(v) => updateField('district', v)}
          />
          <InputField
            id="city"
            label="City"
            placeholder="Enter city"
            value={form.city}
            onChange={(v) => updateField('city', v)}
          />
          <InputField
            id="address"
            label="Full Address"
            placeholder="Plot No., Road, Landmark..."
            value={form.address}
            onChange={(v) => updateField('address', v)}
          />
        </div>

        <hr className="my-8 border-white/5" />

        {/* ── Section: Property Info ── */}
        <SectionHeading icon={FiFileText} title="Property Information" />
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <InputField
            id="area"
            label="Area (sq ft)"
            placeholder="e.g. 2400"
            type="number"
            value={form.area}
            onChange={(v) => updateField('area', v)}
          />
          <SelectField
            id="landType"
            label="Land Type"
            value={form.landType}
            options={landTypes}
            onChange={(v) => updateField('landType', v)}
          />
          <InputField
            id="price"
            label="Price (₹)"
            placeholder="e.g. 8500000"
            type="number"
            icon={FiDollarSign}
            value={form.price}
            onChange={(v) => updateField('price', v)}
          />
        </div>

        <hr className="my-8 border-white/5" />

        {/* ── Section: Uploads ── */}
        <SectionHeading icon={FiUpload} title="Documents & Images" />
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <UploadField
            id="images"
            label="Property Images"
            accept="image/*"
            icon={FiImage}
            description="Upload property photos (JPG, PNG)"
          />
          <UploadField
            id="documents"
            label="Property Documents"
            accept=".pdf,.doc,.docx"
            icon={FiFileText}
            description="Upload title deeds, NOCs, etc. (PDF, DOC)"
          />
        </div>

        {/* ── Submit ── */}
        <div className="mt-10 flex justify-end gap-4">
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-navy-300 transition-all hover:bg-white/10"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
          >
            <FiCheckCircle className="h-4 w-4" />
            Submit for Registration
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────── */

/** Section heading with icon */
function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-blue-400" />
      <h2 className="text-base font-semibold text-white">{title}</h2>
    </div>
  );
}

/** Text / number input */
function InputField({ id, label, placeholder, type = 'text', value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-navy-300">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-navy-600 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}

/** Select dropdown */
function SelectField({ id, label, value, options, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-navy-300">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="" className="bg-navy-800">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-navy-800">{opt}</option>
          ))}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
      </div>
    </div>
  );
}

/** File upload area */
function UploadField({ id, label, accept, icon: Icon, description }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-navy-300">{label}</label>
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] px-6 py-8 text-center transition-all hover:border-blue-500/30 hover:bg-blue-500/5"
      >
        <Icon className="h-8 w-8 text-navy-500" />
        <p className="text-sm text-navy-400">Click to upload</p>
        <p className="text-xs text-navy-600">{description}</p>
        <input id={id} type="file" accept={accept} multiple className="hidden" />
      </label>
    </div>
  );
}
