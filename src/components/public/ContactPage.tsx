import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Clinical Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Location & Access
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact J & J Memorial e-Hospital
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Located in VOA East Community, Monrovia, Liberia with 24/7 emergency clinical access and ample secure patient parking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-base font-bold text-slate-900">Hospital Communication Hub</h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Physical Facility</span>
                    <p className="text-slate-600 mt-0.5">VOA East Community, Monrovia, Montserrado County, Liberia</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">(Main Hospital Campus & Ambulatory Center)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">24/7 Emergency & Acute Care</span>
                    <p className="text-rose-700 font-bold text-sm mt-0.5">+231 (0) 770-JJ-MEM</p>
                    <p className="text-slate-500 text-[11px]">+231 (0) 886-555-911 (Ambulance Dispatch)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-800 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Official Inquiries & Referrals</span>
                    <p className="text-slate-600 mt-0.5">info@jjmemorial.totag.network</p>
                    <p className="text-slate-500 text-[11px]">referrals@jjmemorial.totag.network</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Outpatient Clinic Hours</span>
                    <p className="text-slate-600 mt-0.5">Monday – Saturday: 8:00 AM – 5:00 PM</p>
                    <p className="text-slate-500 text-[11px]">Sunday: Emergency & Inpatient Services Only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Caution */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-xs text-rose-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-bold">Acute Trauma / Chest Pain / Labor:</span> Do not use this contact form for immediate life-threatening situations. Call the emergency line or proceed directly to our 24/7 emergency entrance.
              </p>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">Send an Administrative or Clinical Inquiry</h3>
              <p className="text-xs text-slate-500 mb-6">Our patient liaison team responds within 2-4 business hours.</p>

              {submitted ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Inquiry Dispatched Successfully</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Thank you. Your message has been received by the administrative desk at J & J Memorial e-Hospital.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-teal-800 font-semibold hover:underline mt-2"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Marie Sirleaf"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+231-770-xxx-xxx"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="patient@example.com"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Topic</label>
                      <select
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden bg-white"
                      >
                        <option value="General Clinical Inquiry">General Clinical Inquiry</option>
                        <option value="Insurance Coverage & Pricing">Insurance Coverage & Pricing</option>
                        <option value="Specialist Referral">Specialist Referral</option>
                        <option value="Billing & Official Receipt Inquiry">Billing & Official Receipt Inquiry</option>
                        <option value="Careers & Employment">Careers & Employment</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Message Details *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please write your message here..."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs px-6 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
