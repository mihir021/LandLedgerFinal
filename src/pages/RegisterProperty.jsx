/**
 * Register Property Page
 * Professional multi-field form for property registration.
 * Submits to backend with multipart file uploads.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMapPin, FiHash, FiFileText, FiDollarSign,
  FiImage, FiUpload, FiCheckCircle,
  FiLoader, FiX,
} from 'react-icons/fi';
import { createProperty } from '../services/propertyService';
import { useToast } from '../context/ToastContext';

/** Static options (matching backend model enums) */
const states = ['Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Tamil Nadu', 'Rajasthan', 'Gujarat', 'Delhi', 'Telangana'];
const landTypes = ['agricultural', 'residential', 'commercial', 'industrial', 'mixed'];
const landTypeLabels = { agricultural: 'Agricultural', residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial', mixed: 'Mixed' };

export default function RegisterProperty() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    surveyNumber: '',
    state: '',
    district: '',
    city: '',
    address: '',
    area: '',
    landType: '',
    price: '',
    description: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** Update a single form field */
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** Handle file selection */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setDocumentFiles((prev) => [...prev, ...files].slice(0, 5));
  };

  /** Remove a selected file */
  const removeImage = (idx) => setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeDocument = (idx) => setDocumentFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!form.surveyNumber || !form.state || !form.district || !form.city || !form.address || !form.area || !form.landType || !form.price) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append('surveyNumber', form.surveyNumber);
      formData.append('state', form.state);
      formData.append('district', form.district);
      formData.append('city', form.city);
      formData.append('address', form.address);
      formData.append('area', form.area);
      formData.append('landType', form.landType);
      formData.append('price', form.price);
      if (form.description) formData.append('description', form.description);

      imageFiles.forEach((file) => formData.append('images', file));
      documentFiles.forEach((file) => formData.append('documents', file));

      await createProperty(formData);
      toast.success('Property registered successfully!');
      navigate('/seller');
    } catch (err) {
      setError(err.message || 'Failed to register property.');
      toast.error(err.message || 'Failed to register property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold font-serif text-gray-900">Register New Property</h1>
        <p className="mt-1 text-sm text-gray-600">
          Submit property details to register on the blockchain. All fields are required.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="ll-card p-8 animate-fade-in-up delay-100">
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
        </div>

        <hr className="my-8 ll-divider" />

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

        <hr className="my-8 ll-divider" />

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
            labels={landTypeLabels}
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

        {/* Description */}
        <div className="mt-5">
          <label htmlFor="description" className="ll-label">Description (optional)</label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe the property..."
            className="ll-input resize-none"
          />
        </div>

        <hr className="my-8 ll-divider" />

        {/* ── Section: Uploads ── */}
        <SectionHeading icon={FiUpload} title="Documents & Images" />
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {/* Images */}
          <div>
            <label className="ll-label">Property Images</label>
            <label
              htmlFor="images"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-6 text-center transition-all hover:border-blue-800 hover:bg-blue-50"
            >
              <FiImage className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">Click to upload</p>
              <p className="text-xs text-gray-500">JPG, PNG, WEBP (max 5 files)</p>
              <input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>
            {imageFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {imageFiles.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-2.5 py-1 text-xs text-gray-800">
                    {f.name.slice(0, 20)}
                    <button type="button" onClick={() => removeImage(i)} className="text-gray-400 hover:text-red-600"><FiX className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div>
            <label className="ll-label">Property Documents</label>
            <label
              htmlFor="documents"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-6 text-center transition-all hover:border-blue-800 hover:bg-blue-50"
            >
              <FiFileText className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">Click to upload</p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG (max 5 files)</p>
              <input id="documents" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple onChange={handleDocumentChange} className="hidden" />
            </label>
            {documentFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {documentFiles.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 border border-gray-200 px-2.5 py-1 text-xs text-gray-800">
                    {f.name.slice(0, 20)}
                    <button type="button" onClick={() => removeDocument(i)} className="text-gray-400 hover:text-red-600"><FiX className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm font-medium text-red-700">{error}</p>
        )}

        {/* ── Submit ── */}
        <div className="mt-10 flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-sm px-8 py-3"
          >
            {loading ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FiCheckCircle className="h-4 w-4" />
                Submit for Registration
              </>
            )}
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
      <Icon className="h-5 w-5 text-blue-900" />
      <h2 className="text-base font-bold font-serif text-gray-900">{title}</h2>
    </div>
  );
}

/** Text / number input */
function InputField({ id, label, placeholder, type = 'text', value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="ll-label">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ll-input"
      />
    </div>
  );
}

/** Select dropdown */
function SelectField({ id, label, value, options, labels, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="ll-label">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ll-select"
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {labels ? (labels[opt] || opt) : opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
