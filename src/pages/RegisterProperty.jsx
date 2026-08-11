/**
 * Register Property Page — Enhanced Version
 * Features dependent cascading location dropdowns (State -> District -> City),
 * step progress indicator, field-level validation, live file previews,
 * and matching MongoDB schema structure.
 */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMapPin, FiHash, FiFileText, FiDollarSign,
  FiImage, FiUpload, FiCheckCircle,
  FiLoader, FiX, FiInfo, FiLayers, FiFile
} from 'react-icons/fi';
import { INDIA_LOCATION_DATA, STATES_LIST } from '../data/indiaStatesDistrictsCities';
import SearchableSelect from '../components/SearchableSelect';
import { createProperty } from '../services/propertyService';
import { useToast } from '../context/ToastContext';
import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, getSafeFeeOverrides } from '../config/web3';
import { LandLedgerABI } from '../config/LandLedgerABI.js';

const landTypes = ['residential', 'commercial', 'agricultural', 'industrial', 'mixed'];
const landTypeLabels = {
  residential: 'Residential',
  commercial: 'Commercial',
  agricultural: 'Agricultural',
  industrial: 'Industrial',
  mixed: 'Mixed',
};

const FORM_STEPS = [
  { id: 1, name: 'Identification', icon: FiHash },
  { id: 2, name: 'Location Details', icon: FiMapPin },
  { id: 3, name: 'Property Info', icon: FiFileText },
  { id: 4, name: 'Uploads & Verification', icon: FiUpload },
];

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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { writeContractAsync } = useWriteContract();
  const { address: walletAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();

  // Create image object URLs for live preview thumbnails
  useEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  /** Cascading District options based on chosen State */
  const districtOptions = useMemo(() => {
    if (!form.state || !INDIA_LOCATION_DATA[form.state]) return [];
    return Object.keys(INDIA_LOCATION_DATA[form.state]);
  }, [form.state]);

  /** Cascading City / Taluka options based on chosen District */
  const cityOptions = useMemo(() => {
    if (!form.state || !form.district || !INDIA_LOCATION_DATA[form.state]?.[form.district]) return [];
    return INDIA_LOCATION_DATA[form.state][form.district];
  }, [form.state, form.district]);

  /** Form field updater */
  const updateField = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Cascading reset logic:
      if (field === 'state') {
        updated.district = '';
        updated.city = '';
      } else if (field === 'district') {
        updated.city = '';
      }
      return updated;
    });

    // Clear field-level error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /** Calculate current active step based on filled fields */
  const currentStep = useMemo(() => {
    if (!form.surveyNumber) return 1;
    if (!form.state || !form.district || !form.city || !form.address) return 2;
    if (!form.area || !form.landType || !form.price) return 3;
    return 4;
  }, [form]);

  /** Handle image upload selection */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files].slice(0, 5));
    if (errors.images) setErrors((prev) => ({ ...prev, images: '' }));
  };

  /** Handle document upload selection */
  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setDocumentFiles((prev) => [...prev, ...files].slice(0, 5));
  };

  /** Remove selected file */
  const removeImage = (idx) => setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeDocument = (idx) => setDocumentFiles((prev) => prev.filter((_, i) => i !== idx));

  /** Validate form before submission */
  const validateForm = () => {
    const newErrors = {};
    if (!form.surveyNumber.trim()) newErrors.surveyNumber = 'Survey Number is required.';
    if (!form.state) newErrors.state = 'State selection is required.';
    if (!form.district) newErrors.district = 'District selection is required.';
    if (!form.city) newErrors.city = 'City / Taluka selection is required.';
    if (!form.address.trim()) newErrors.address = 'Full street address is required.';
    if (!form.area || Number(form.area) <= 0) newErrors.area = 'Enter a valid area in sq ft.';
    if (!form.landType) newErrors.landType = 'Please select a property land category.';
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'Enter a valid price in INR (₹).';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      toast.error('Please complete all required fields correctly.');
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        document.getElementById(firstErrorKey)?.focus();
      }
      return;
    }

    // A property must be anchored by the seller's wallet.  Continuing without
    // a signature leaves the officer with nothing that can be verified later.
    if (!isConnected || !walletAddress) {
      const message = 'Connect the seller wallet in the top bar before submitting a property.';
      setSubmitError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    try {
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

      // Use one stable parcel id everywhere.  The officer reads this same id
      // when verifying, so a successful seller registration always opens a
      // wallet request for the officer instead of being mistaken for missing.
      const rawSurvey = form.surveyNumber.trim().toUpperCase();
      const uniqueParcelId = rawSurvey.length > 5 && !rawSurvey.match(/^\d+$/)
        ? rawSurvey
        : `SRV-${rawSurvey}-${Date.now().toString().slice(-4)}`;

      toast.info('Confirm the property registration in your wallet...');
      const feeOverrides = await getSafeFeeOverrides(publicClient);
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: LandLedgerABI,
        functionName: 'registerLand',
        args: [
          uniqueParcelId,
          `${form.address}, ${form.city}, ${form.state}`,
          BigInt(Number(form.area) || 1)
        ],
        ...feeOverrides,
      });
      toast.info('Registration submitted on-chain. Saving the property record...');

      formData.append('walletAddress', walletAddress);
      formData.append('txHash', txHash);
      formData.append('blockchainParcelId', uniqueParcelId);

      // 2. Backend Storage
      await createProperty(formData);
      toast.success('Property registered successfully!');
      navigate('/seller');
    } catch (err) {
      setSubmitError(err.message || 'Failed to register property.');
      toast.error(err.message || 'Failed to register property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6 px-4">
      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-3xl font-bold font-serif text-gray-900">Register New Property</h1>
        <p className="mt-1 text-sm text-gray-600">
          Submit land details to register on the official ledger and blockchain.
        </p>
      </div>

      {/* ── Section Progress Bar ── */}
      <div className="mb-8 ll-card p-4 animate-fade-in-up">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FORM_STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold shadow-xs'
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                }`}
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs shrink-0 font-bold ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isDone ? <FiCheckCircle className="h-4 w-4" /> : step.id}
                </div>
                <div className="min-w-0">
                  <p className="text-xs truncate">{step.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="ll-card p-6 sm:p-8 animate-fade-in-up space-y-8">

        {/* ── Step 1: Identification ── */}
        <section>
          <SectionHeading icon={FiHash} title="1. Property Identification" />
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="surveyNumber" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Survey Number <span className="text-red-500">*</span>
              </label>
              <input
                id="surveyNumber"
                type="text"
                value={form.surveyNumber}
                onChange={(e) => updateField('surveyNumber', e.target.value)}
                placeholder="e.g. SRV/GJ/AHM/2024/1024"
                className={`ll-input ${errors.surveyNumber ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/20' : 'focus:border-amber-500 focus:ring-amber-500/20'}`}
              />
              {errors.surveyNumber ? (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.surveyNumber}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                  <FiInfo className="h-3 w-3 shrink-0" /> Expected format e.g. SRV/GJ/AHM/2024/1024 or LAND-REG-XXXX
                </p>
              )}
            </div>
          </div>
        </section>

        <hr className="ll-divider" />

        {/* ── Step 2: Cascading Location ── */}
        <section>
          <SectionHeading icon={FiMapPin} title="2. Location Details (Cascading)" />
          <p className="text-xs text-gray-500 mb-4 mt-1">Select State to filter Districts, and District to filter Cities/Talukas.</p>

          <div className="grid gap-5 sm:grid-cols-3">
            {/* State */}
            <SearchableSelect
              id="state"
              label="State *"
              value={form.state}
              options={STATES_LIST}
              placeholder="Select State..."
              onChange={(val) => updateField('state', val)}
              error={errors.state}
            />

            {/* District */}
            <SearchableSelect
              id="district"
              label="District *"
              value={form.district}
              options={districtOptions}
              disabled={!form.state}
              placeholder={!form.state ? 'Select State First' : 'Select District...'}
              onChange={(val) => updateField('district', val)}
              error={errors.district}
            />

            {/* City / Taluka */}
            <SearchableSelect
              id="city"
              label="City / Taluka *"
              value={form.city}
              options={cityOptions}
              disabled={!form.district}
              placeholder={!form.district ? 'Select District First' : 'Select City/Taluka...'}
              onChange={(val) => updateField('city', val)}
              error={errors.city}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Full Street Address / Landmark <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              type="text"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Plot No. / Revenue Block No., Near National Highway..."
              className={`ll-input ${errors.address ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/20' : 'focus:border-amber-500 focus:ring-amber-500/20'}`}
            />
            {errors.address && <p className="mt-1 text-xs text-red-500 font-medium">{errors.address}</p>}
          </div>
        </section>

        <hr className="ll-divider" />

        {/* ── Step 3: Property Info ── */}
        <section>
          <SectionHeading icon={FiFileText} title="3. Property Information" />

          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            {/* Area */}
            <div>
              <label htmlFor="area" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Area (Sq. Ft.) <span className="text-red-500">*</span>
              </label>
              <input
                id="area"
                type="number"
                min="1"
                value={form.area}
                onChange={(e) => updateField('area', e.target.value)}
                placeholder="e.g. 2400"
                className={`ll-input ${errors.area ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/20' : 'focus:border-amber-500 focus:ring-amber-500/20'}`}
              />
              {errors.area ? (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.area}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-400">Total land plot size in sq. ft.</p>
              )}
            </div>

            {/* Land Type */}
            <div>
              <label htmlFor="landType" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Land Category <span className="text-red-500">*</span>
              </label>
              <select
                id="landType"
                value={form.landType}
                onChange={(e) => updateField('landType', e.target.value)}
                className={`ll-select ${errors.landType ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/20' : 'focus:border-amber-500 focus:ring-amber-500/20'}`}
              >
                <option value="">Select Category...</option>
                {landTypes.map((type) => (
                  <option key={type} value={type}>
                    {landTypeLabels[type]}
                  </option>
                ))}
              </select>
              {errors.landType && <p className="mt-1 text-xs text-red-500 font-medium">{errors.landType}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Valuation Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="price"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="e.g. 4500000"
                  className={`ll-input ${errors.price ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/20' : 'focus:border-amber-500 focus:ring-amber-500/20'}`}
                />
              </div>
              {errors.price ? (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.price}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-400">Total property valuation in INR (₹)</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Property Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Highlight key features, connectivity, water/electricity supply..."
              className="ll-input resize-none focus:border-amber-500 focus:ring-amber-500/20"
            />
          </div>
        </section>

        <hr className="ll-divider" />

        {/* ── Step 4: Live File Previews & Uploads ── */}
        <section>
          <SectionHeading icon={FiUpload} title="4. Property Images & Documents" />
          <div className="mt-4 grid gap-6 sm:grid-cols-2">

            {/* Images Upload Box */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Property Photography
              </label>
              <label
                htmlFor="images"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-6 text-center transition-all hover:border-amber-500 hover:bg-amber-50/30"
              >
                <FiImage className="h-8 w-8 text-amber-600" />
                <p className="text-sm font-semibold text-gray-800">Click to upload photos</p>
                <p className="text-xs text-gray-500">JPG, PNG, WEBP (Max 5 photos)</p>
                <input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>

              {/* Image Thumbnail Preview List */}
              {imageFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-500">Selected Photos ({imageFiles.length}/5):</p>
                  <div className="grid grid-cols-3 gap-2">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={imagePreviews[idx]} alt={file.name} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
                          title="Remove image"
                        >
                          <FiX className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5 text-[10px] text-white truncate text-center">
                          {(file.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Documents Upload Box */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Official Ownership Documents
              </label>
              <label
                htmlFor="documents"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-6 text-center transition-all hover:border-amber-500 hover:bg-amber-50/30"
              >
                <FiFileText className="h-8 w-8 text-navy-800" />
                <p className="text-sm font-semibold text-gray-800">Click to upload deeds/maps</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (7/12 Extracts, Sale Deeds)</p>
                <input id="documents" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple onChange={handleDocumentChange} className="hidden" />
              </label>

              {/* Document Files List Preview */}
              {documentFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-500">Selected Documents ({documentFiles.length}/5):</p>
                  <div className="space-y-1.5">
                    {documentFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <FiFile className="h-4 w-4 text-blue-800 shrink-0" />
                          <span className="truncate font-medium text-gray-800">{file.name}</span>
                          <span className="text-[10px] text-gray-400 shrink-0">({(file.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(idx)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove document"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Global Submission Error Banner */}
        {submitError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700 animate-fade-in">
            {submitError}
          </div>
        )}

        {/* Submit Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            * All registered land records are cryptographically hashed and indexed.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto btn-primary text-sm px-8 py-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                <span>Registering Property...</span>
              </>
            ) : (
              <>
                <FiCheckCircle className="h-4 w-4" />
                <span>Submit for Registration</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

/** Section heading with icon */
function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-base font-bold font-serif text-gray-900">{title}</h2>
    </div>
  );
}
