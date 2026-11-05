import React, { useState } from 'react';
import { 
  Settings, 
  Calendar, 
  Clock, 
  Store, 
  Cloud, 
  ShieldCheck, 
  Check, 
  RotateCcw, 
  LogOut, 
  ExternalLink, 
  HelpCircle,
  AlertTriangle,
  Save,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { STANDARD_TIME_SLOTS } from '../../data/initialData';
import { FirebaseSetupGuideModal } from './FirebaseSetupGuideModal';

interface AdminSettingsViewProps {
  onLogout: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ onLogout }) => {
  const { 
    settings, 
    updateSettings, 
    availability, 
    toggleSlotBlock, 
    toggleEntireDayBlock, 
    firebaseStatus, 
    refreshFirebaseConnection,
    resetToInitialCatalog 
  } = useStore();

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeDate, setActiveDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // Store profile editable state
  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [openingTime, setOpeningTime] = useState(settings.openingTime);
  const [closingTime, setClosingTime] = useState(settings.closingTime);
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  // Custom Firebase configuration inputs
  const [customApiKey, setCustomApiKey] = useState('');
  const [customProjectId, setCustomProjectId] = useState('');
  const [isConfiguringFirebase, setIsConfiguringFirebase] = useState(false);
  const [firebaseSuccessMsg, setFirebaseSuccessMsg] = useState(false);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Available dates (next 7 days)
  const nextDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const isoDate = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { isoDate, dayLabel };
  });

  const currentDateConfig = availability.find(a => a.date === activeDate);
  const isEntireDayBlocked = !!currentDateConfig?.isEntireDayBlocked;
  const blockedSlots = currentDateConfig?.blockedSlots || [];

  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      storeName,
      phone,
      address,
      city,
      openingTime,
      closingTime
    });
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 2500);
  };

  const handleSaveCustomFirebase = () => {
    if (!customApiKey.trim() || !customProjectId.trim()) return;

    const config = {
      apiKey: customApiKey.trim(),
      authDomain: `${customProjectId.trim()}.firebaseapp.com`,
      projectId: customProjectId.trim(),
      storageBucket: `${customProjectId.trim()}.firebasestorage.app`,
      messagingSenderId: '123456789012',
      appId: '1:123456789012:web:shilpa',
      firestoreDatabaseId: '(default)'
    };

    localStorage.setItem('shilpa_firebase_custom_config', JSON.stringify(config));
    refreshFirebaseConnection();
    setFirebaseSuccessMsg(true);
    setIsConfiguringFirebase(false);
    setTimeout(() => setFirebaseSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-4 px-3 pb-24 pt-2">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-brand font-bold text-base tracking-wider uppercase text-[#380B12]">
            Boutique Settings & Systems
          </h2>
          <p className="text-[11px] text-[#7A6458]">Configure salon timings, VIP slots, and database sync</p>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* 1. Trial Slot Availability & Date Blocking Manager */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DEC8] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-[#380B12]">
              VIP Trial Schedule & Slot Blocker
            </h3>
          </div>
          <span className="text-[10px] text-[#8F7E75]">Max 1 VIP Fitting / Slot</span>
        </div>

        {/* Date Selector Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {nextDates.map(d => {
            const isSelected = activeDate === d.isoDate;
            const hasBlock = availability.find(a => a.date === d.isoDate);
            const isBlocked = hasBlock?.isEntireDayBlocked || (hasBlock?.blockedSlots && hasBlock.blockedSlots.length > 0);

            return (
              <button
                key={d.isoDate}
                onClick={() => setActiveDate(d.isoDate)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#4A0E17] text-[#D4AF37] border-[#D4AF37] shadow'
                    : isBlocked
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-[#FAF6EE] text-[#4A3C38] border-[#E0D5C3]'
                }`}
              >
                <span>{d.dayLabel}</span>
                {isBlocked && <span className="ml-1 text-[9px] text-amber-600">●</span>}
              </button>
            );
          })}
        </div>

        {/* Entire Day Block Toggle */}
        <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#EADBCA] flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-[#380B12] block">
              Block Entire Day ({activeDate})
            </span>
            <span className="text-[10px] text-[#7A6458]">
              {isEntireDayBlocked ? 'Boutique is marked closed for trials' : 'All standard slots open'}
            </span>
          </div>

          <button
            onClick={() => toggleEntireDayBlock(activeDate, 'Boutique Closed / Private Event')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isEntireDayBlocked
                ? 'bg-red-600 text-white'
                : 'bg-white border border-[#E0D5C3] text-[#4A0E17]'
            }`}
          >
            {isEntireDayBlocked ? 'Unblock Day' : 'Block Day'}
          </button>
        </div>

        {/* Individual Slots Grid */}
        {!isEntireDayBlocked && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#4A0E17] block">
              Toggle Individual Slots for {activeDate}:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {STANDARD_TIME_SLOTS.map(slot => {
                const isBlocked = blockedSlots.includes(slot.time);
                return (
                  <button
                    key={slot.time}
                    onClick={() => toggleSlotBlock(activeDate, slot.time)}
                    className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-between transition-colors ${
                      isBlocked
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    <span>{slot.time}</span>
                    <span className="text-[10px] font-bold">
                      {isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Cloud & Firebase Integration Center */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DEC8] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-[#4A0E17]" />
            <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-[#380B12]">
              Firebase & Database Architecture
            </h3>
          </div>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="text-[11px] text-[#4A0E17] font-bold underline flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Setup Guide</span>
          </button>
        </div>

        {/* Real Status Badge (Do NOT pretend Firebase is connected if credentials missing) */}
        <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
          firebaseStatus.isConnected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-[#FAF6EE] border-[#EADBCA] text-[#543D32]'
        }`}>
          {firebaseStatus.isConnected ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          )}

          <div className="space-y-0.5">
            <div className="font-bold">
              {firebaseStatus.isConnected
                ? `Connected to Firebase Cloud Firestore (${firebaseStatus.projectId})`
                : 'Local High-Reliability Boutique Database (Active)'}
            </div>
            <p className="text-[10px] text-[#7A6458]">
              {firebaseStatus.isConnected
                ? 'Real-time synchronization enabled across devices and Android APK.'
                : 'Operating in self-contained offline storage. Zero mock data; all products, bookings, and sales are preserved reliably.'}
            </p>
          </div>
        </div>

        {firebaseSuccessMsg && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
            Custom Firebase credentials saved and connection refreshed!
          </div>
        )}

        {/* Connect / Update Firebase Key button */}
        {!isConfiguringFirebase ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsConfiguringFirebase(true)}
              className="flex-1 py-2 rounded-xl bg-[#4A0E17] text-[#D4AF37] text-xs font-bold uppercase tracking-wider shadow hover:bg-[#380B12]"
            >
              Configure Live Firebase Credentials
            </button>
            <button
              onClick={refreshFirebaseConnection}
              className="px-3 py-2 rounded-xl border border-[#E0D5C3] text-xs font-semibold hover:bg-[#FAF6EE]"
              title="Test Connection"
            >
              Test Ping
            </button>
          </div>
        ) : (
          <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#EADBCA] space-y-2.5 text-xs">
            <div className="font-bold text-[#380B12]">Enter Firebase Web App Keys:</div>
            <div>
              <label className="block text-[10px] text-[#7A6458] mb-1 font-semibold">Firebase API Key</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={customApiKey}
                onChange={e => setCustomApiKey(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-[#E0D5C3] text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#7A6458] mb-1 font-semibold">Project ID</label>
              <input
                type="text"
                placeholder="e.g. shilpa-dresses"
                value={customProjectId}
                onChange={e => setCustomProjectId(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-[#E0D5C3] text-xs"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfiguringFirebase(false)}
                className="flex-1 py-1.5 rounded-lg border text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomFirebase}
                className="flex-1 py-1.5 rounded-lg bg-[#4A0E17] text-[#D4AF37] text-xs font-bold"
              >
                Save & Connect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Boutique Information Settings */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DEC8] shadow-sm space-y-3">
        <div className="flex items-center gap-1.5">
          <Store className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-[#380B12]">
            Store Details & Contact
          </h3>
        </div>

        <form onSubmit={handleSaveStoreProfile} className="space-y-2.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#4A0E17] mb-1">Boutique Name</label>
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              className="w-full p-2 rounded-xl bg-[#FAF6EE] border border-[#E0D5C3] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-[#4A0E17] mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2 rounded-xl bg-[#FAF6EE] border border-[#E0D5C3] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#4A0E17] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-2 rounded-xl bg-[#FAF6EE] border border-[#E0D5C3] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#4A0E17] mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full p-2 rounded-xl bg-[#FAF6EE] border border-[#E0D5C3] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-[#4A0E17] mb-1">Opens At</label>
              <input
                type="text"
                value={openingTime}
                onChange={e => setOpeningTime(e.target.value)}
                className="w-full p-2 rounded-xl bg-[#FAF6EE] border border-[#E0D5C3] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#4A0E17] mb-1">Closes At</label>
              <input
                type="text"
                value={closingTime}
                onChange={e => setClosingTime(e.target.value)}
                className="w-full p-2 rounded-xl bg-[#FAF6EE] border border-[#E0D5C3] text-xs"
              />
            </div>
          </div>

          {savedSettingsMsg && (
            <div className="p-2 bg-emerald-50 text-emerald-800 text-[11px] rounded-lg">
              Settings successfully saved!
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-[#4A0E17] text-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-xl shadow hover:bg-[#380B12]"
          >
            Save Store Info
          </button>
        </form>
      </div>

      {/* 4. Reset & Maintenance */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DEC8] shadow-sm space-y-2">
        <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-[#380B12]">
          Data Maintenance
        </h3>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="w-full py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default Boutique Catalog</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full text-center space-y-3 shadow-2xl border border-red-200">
            <AlertTriangle className="w-10 h-10 mx-auto text-amber-600" />
            <h4 className="font-bold text-sm text-[#380B12]">Restore Initial Catalog?</h4>
            <p className="text-xs text-[#8F7E75]">
              This will reset products, categories, and settings to the initial boutique master database.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToInitialCatalog();
                  setIsResetConfirmOpen(false);
                }}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Firebase Setup Guide Modal */}
      {isGuideOpen && (
        <FirebaseSetupGuideModal onClose={() => setIsGuideOpen(false)} />
      )}
    </div>
  );
};
