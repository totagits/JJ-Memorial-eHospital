import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { ClinicFacility } from '../../types';
import { useTranslation } from '../../services/i18n';
import { MapPin, Phone, Clock, Mail, CheckCircle2, Navigation, Compass, Search } from 'lucide-react';

export const FacilityLocator: React.FC = () => {
  const { t } = useTranslation();
  const facilities = dbStore.getFacilities();
  const [selectedId, setSelectedId] = useState<string>(facilities[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredFacilities = facilities.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.services.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeFacility = facilities.find((f) => f.id === selectedId) || facilities[0];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Campus & Branch Network</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-hospital-navy tracking-tight">
            {t('facilityLocator')}
          </h2>
          <p className="text-slate-600 text-base">
            Find the nearest J & J Memorial clinic branch, emergency room, or specialist outpatient facility across Montserrado and regional counties.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto pt-4 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by branch name, county, or clinical service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Interactive Grid & Map View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Branch List (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Available Branches ({filteredFacilities.length})
              </span>
              <span className="text-xs text-teal-600 font-semibold">24/7 Ambulance Dispatch Available</span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredFacilities.map((facility) => {
                const isSelected = facility.id === activeFacility.id;
                return (
                  <div
                    key={facility.id}
                    onClick={() => setSelectedId(facility.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50/60 border-teal-500 ring-1 ring-teal-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {facility.name}
                          </h4>
                          {facility.isMainCampus && (
                            <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-hospital-navy text-white rounded">
                              Main Campus
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{facility.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-medium text-emerald-600">
                        <Clock className="w-3 h-3" />
                        {facility.operatingHours}
                      </span>
                      <span className="text-teal-700 font-bold">{facility.county}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Map & Active Facility Detail (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Interactive Map Card */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-64 sm:h-80 shadow-inner flex items-center justify-center">
              {/* Simulated high-tech GPS grid map of Montserrado / Liberia */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
              
              {/* Decorative Liberia coastal shoreline representation */}
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 600 300">
                <path
                  d="M0,200 Q150,180 300,230 T600,260 L600,300 L0,300 Z"
                  fill="#0d9488"
                />
                <text x="40" y="270" fill="#94a3b8" fontSize="12" fontFamily="monospace">ATLANTIC OCEAN (MONROVIA COASTLINE)</text>
              </svg>

              {/* Facility Markers */}
              {facilities.map((f, idx) => {
                const isSelected = f.id === activeFacility.id;
                // Position markers dynamically across Monrovia map space
                const positions = [
                  { top: '40%', left: '48%' }, // Congo Town Main
                  { top: '35%', left: '38%' }, // Sinkor
                  { top: '48%', left: '60%' }, // Paynesville
                  { top: '22%', left: '75%' }, // Kakata
                ];
                const pos = positions[idx % positions.length];

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    style={{ top: pos.top, left: pos.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    <div className="relative flex items-center justify-center">
                      {isSelected && (
                        <span className="absolute w-8 h-8 rounded-full bg-teal-400 animate-ping opacity-75" />
                      )}
                      <div className={`p-2 rounded-full shadow-lg transition-transform group-hover:scale-125 ${
                        isSelected ? 'bg-teal-500 text-slate-950 ring-4 ring-teal-400/30' : 'bg-hospital-navy text-white border border-slate-600'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 rounded bg-slate-950/90 text-white text-[10px] font-semibold whitespace-nowrap border border-slate-700 shadow-md">
                      {f.name.split(' ')[2] || f.name}
                    </div>
                  </div>
                );
              })}

              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-md text-[11px] text-slate-300 border border-slate-800 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-teal-400" />
                <span>Interactive Geo-Grid (Lat {activeFacility.coordinates.lat}, Lng {activeFacility.coordinates.lng})</span>
              </div>
            </div>

            {/* Detailed Info Card for Selected Branch */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-hospital-navy">
                    {activeFacility.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {activeFacility.address} &bull; {activeFacility.county}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeFacility.emergencyHotline.split(' ')[0]}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Hotline</span>
                  </a>
                </div>
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Operating Hours
                  </span>
                  <div className="font-bold text-slate-800">{activeFacility.operatingHours}</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    Front Desk
                  </span>
                  <div className="font-bold text-slate-800">{activeFacility.phone}</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    Branch Email
                  </span>
                  <div className="font-bold text-slate-800 truncate">{activeFacility.email}</div>
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Available Clinical & Diagnostic Services
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeFacility.services.map((srv, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
