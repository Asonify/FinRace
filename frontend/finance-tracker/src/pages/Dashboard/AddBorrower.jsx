import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import {
  LuArrowLeft,
  LuSave,
  LuTrash2,
  LuCalendar,
  LuDollarSign,
  LuFileText,
  LuFile
} from 'react-icons/lu';

const AddBorrower = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [occupation, setOccupation] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null); // base64 string
  const [notes, setNotes] = useState('');

  // Loan State
  const [amountGiven, setAmountGiven] = useState('');
  const [dateGiven, setDateGiven] = useState(moment().format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('One Time');
  const [status, setStatus] = useState('Pending');
  const [documents, setDocuments] = useState([]); // array of { name, url }

  // Handle photo base64 conversion
  const handlePhotoSelect = (file) => {
    if (!file) {
      setProfilePhoto(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle document upload converting to base64
  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments(prev => [...prev, { name: file.name, url: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachedDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Borrower Full Name is required');
      return;
    }
    if (!phone.trim()) {
      toast.error('Mobile Number is required');
      return;
    }
    if (!amountGiven) {
      toast.error('Amount Given is required');
      return;
    }
    if (!dateGiven) {
      toast.error('Lending Date is required');
      return;
    }
    if (!dueDate) {
      toast.error('Repayment Due Date is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        occupation: occupation.trim(),
        profilePhoto,
        notes: notes.trim(),
        amountGiven: Number(amountGiven),
        dateGiven,
        dueDate,
        purpose: purpose.trim(),
        interestRate: interestRate ? Number(interestRate) : undefined,
        paymentFrequency,
        status,
        documents
      };

      const response = await axiosInstance.post(API_PATHS.UDHAAR.ADD, payload);
      if (response.data) {
        toast.success('Borrower and initial loan registered successfully');
        navigate('/udhaar');
      }
    } catch (error) {
      console.error('Error adding borrower:', error);
      toast.error(error.response?.data?.message || 'Failed to register borrower');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Udhaar">
      <div className="pb-16 transition-colors duration-300">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/udhaar')}
              className="p-3 bg-[var(--color-card)] hover:bg-[var(--color-input)] text-white/80 hover:text-white rounded-xl border border-[var(--color-border)] shadow-md transition-all cursor-pointer"
            >
              <LuArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
                Add Borrower Profile
              </h1>
              <p className="text-[var(--color-text)] opacity-60 text-xs sm:text-sm mt-0.5">
                Register a new borrower, configure loan parameters, and schedule smart reminders.
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Column Form Layout */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Personal Information */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card border border-[var(--color-border)] p-6 rounded-2xl bg-[var(--color-card)] flex flex-col gap-6">
              <h3 className="text-base font-bold text-white border-b border-[var(--color-border)] pb-3 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-xs font-bold">1</span>
                Personal Details
              </h3>

              {/* Profile Photo selector */}
              <ProfilePhotoSelector image={profilePhoto} setImage={handlePhotoSelect} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  placeholder="Enter legal name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  label="Mobile Number *"
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address (Optional)"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Occupation / Business (Optional)"
                  placeholder="e.g. Freelancer, Shopkeeper"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Input
                  label="Street Address (Optional)"
                  placeholder="House No, Apartment, Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City (Optional)"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    label="State (Optional)"
                    placeholder="Enter state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                  <Input
                    label="Pincode (Optional)"
                    placeholder="6-digit ZIP code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="card border border-[var(--color-border)] p-6 rounded-2xl bg-[var(--color-card)] flex flex-col gap-4">
              <h3 className="text-base font-bold text-white border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-xs font-bold">2</span>
                Notes & Context
              </h3>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-2">
                  Additional Details
                </label>
                <textarea
                  placeholder="Enter context, reference person, business transactions history..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[120px] bg-[var(--color-input)] border border-[var(--color-border)] rounded-xl p-4 text-sm text-[var(--color-text)] outline-none focus:border-[#D4AF37] transition duration-200"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Loan details & Attachments */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card border border-[var(--color-border)] p-6 rounded-2xl bg-[var(--color-card)] flex flex-col gap-6">
              <h3 className="text-base font-bold text-white border-b border-[var(--color-border)] pb-3 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-xs font-bold">3</span>
                Loan Configuration
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="Amount Lent (₹) *"
                    type="number"
                    placeholder="Enter loan principal amount"
                    value={amountGiven}
                    onChange={(e) => setAmountGiven(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                      Date Lent *
                    </label>
                    <input
                      type="date"
                      value={dateGiven}
                      onChange={(e) => setDateGiven(e.target.value)}
                      className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-sm text-[var(--color-text)] outline-none focus:border-[#D4AF37] transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-sm text-[var(--color-text)] outline-none focus:border-[#D4AF37] transition duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Interest Rate per Annum % (Optional)"
                    type="number"
                    placeholder="e.g. 12%"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                      Payment Frequency
                    </label>
                    <select
                      value={paymentFrequency}
                      onChange={(e) => setPaymentFrequency(e.target.value)}
                      className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-sm text-[var(--color-text)] outline-none focus:border-[#D4AF37] transition duration-200"
                    >
                      <option value="One Time">One Time</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Purpose of Loan"
                    placeholder="e.g. Business expand, car"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                      Initial Loan Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-sm text-[var(--color-text)] outline-none focus:border-[#D4AF37] transition duration-200"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Paid">Fully Paid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Supporting Documents section */}
            <div className="card border border-[var(--color-border)] p-6 rounded-2xl bg-[var(--color-card)] flex flex-col gap-4">
              <h3 className="text-base font-bold text-white border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-xs font-bold">4</span>
                Supporting Documents
              </h3>
              
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-2">
                  Attach PDF receipts, agreement papers, bills, or photo proof
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  id="documentUpload"
                  onChange={handleDocumentChange}
                  className="hidden"
                />
                <label
                  htmlFor="documentUpload"
                  className="w-full border border-dashed border-[var(--color-border)] bg-[var(--color-input)]/20 p-6 rounded-xl text-center cursor-pointer block hover:bg-[var(--color-input)]/45 transition duration-200"
                >
                  <LuFileText className="text-3xl text-gray-400 mx-auto mb-2 opacity-50" />
                  <span className="text-xs text-white/60 block font-semibold">Click to choose files</span>
                  <span className="text-[10px] text-white/30 block mt-1">Images or PDFs up to 10MB</span>
                </label>

                {documents.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1">
                    {documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-xs font-semibold text-white/80"
                      >
                        <span className="truncate max-w-[200px] flex items-center gap-2">
                          <LuFile className="text-[#D4AF37]" size={14} />
                          {doc.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachedDocument(idx)}
                          className="p-1 hover:text-[#EF4444] text-white/40 transition cursor-pointer"
                        >
                          <LuTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/udhaar')}
                disabled={saving}
                className="w-1/2 px-5 py-4 border border-[var(--color-border)] text-white hover:text-white/80 rounded-xl font-bold transition text-sm cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-1/2 px-5 py-4 bg-[#D4AF37] hover:bg-[#B8962E] disabled:bg-[#D4AF37]/50 text-black font-extrabold rounded-xl shadow-lg transition transform active:scale-[0.98] text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <LuSave size={16} />
                <span>{saving ? 'Registering...' : 'Save Borrower'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddBorrower;
