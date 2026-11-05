import React from 'react';
import { 
  Crown, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Scissors, 
  MessageCircle, 
  Shield, 
  ExternalLink 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ProfileViewProps {
  onOpenOwnerPortal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenOwnerPortal }) => {
  const { settings } = useStore();

  return (
    <div className="space-y-4 px-3 pb-24 pt-2">
      {/* Boutique Crest Card */}
      <div className="p-5 rounded-2xl bg-[#4A0E17] text-[#FDFBF7] text-center space-y-3 border border-[#D4AF37]/40 shadow-lg relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#380B12] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <Crown className="w-8 h-8 text-[#D4AF37]" />
        </div>

        <div>
          <h2 className="text-xl font-bold font-brand tracking-wider text-[#FDFBF7]">
            {settings.storeName}
          </h2>
          <p className="text-xs uppercase tracking-widest text-[#D4AF37] mt-0.5">
            {settings.tagline}
          </p>
        </div>

        <p className="text-xs text-[#FDFBF7]/80 max-w-xs mx-auto leading-relaxed">
          Fine handloom fabrics, bespoke embroidery artisans, and luxury bridal couture since 1998.
        </p>

        {/* Action buttons */}
        <div className="flex justify-center gap-2 pt-1">
          <a
            href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
            className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] text-[#4A0E17] font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Store</span>
          </a>
          <a
            href={`https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DEC8] shadow-sm space-y-3 text-xs text-[#4A3C38]">
        <h3 className="font-brand font-bold text-xs uppercase tracking-wider text-[#380B12]">
          Salon Location & Hours
        </h3>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#380B12] block">Boutique Address</span>
              <span>{settings.address}, {settings.city}, {settings.state}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#380B12] block">Visiting Hours</span>
              <span>Monday to Sunday: {settings.openingTime} – {settings.closingTime}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#380B12] block">Boutique Desk</span>
              <span>{settings.phone} {settings.alternatePhone ? `• ${settings.alternatePhone}` : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Etiquette & Salon Policies */}
      <div className="bg-[#FAF6EE] rounded-2xl p-4 border border-[#EADBCA] space-y-2 text-xs text-[#543D32]">
        <div className="font-bold text-[#4A0E17] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          VIP In-Store Trial Guidelines
        </div>
        <ul className="space-y-1.5 text-[11px] list-disc list-inside text-[#6B5A51]">
          <li>Please arrive 5–10 minutes prior to your reserved slot time.</li>
          <li>Each session is reserved exclusively for you with our senior stylist.</li>
          <li>You are welcome to bring up to 2 family members or guests.</li>
          <li>Garments are thoroughly sanitized before and after every trial.</li>
        </ul>
      </div>

      {/* Discreet Owner / Staff Portal Shortcut */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#E0D5C3] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border border-[#D4AF37] flex items-center justify-center text-[#4A0E17]">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#380B12]">Owner & Staff Access</div>
            <div className="text-[10px] text-[#8F7E75]">Manage inventory, bookings, POS billing</div>
          </div>
        </div>
        <button
          onClick={onOpenOwnerPortal}
          className="px-3 py-1.5 bg-[#4A0E17] text-[#D4AF37] rounded-xl text-xs font-bold hover:bg-[#380B12] transition-colors"
        >
          Staff Login
        </button>
      </div>

      {/* Developer Branding */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#25060B] to-[#380B12] text-[#FDFBF7] border border-[#D4AF37]/30 text-center space-y-1.5 shadow">
        <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
          Application Architecture & Design
        </div>
        <div className="text-sm font-extrabold tracking-wider text-[#FDFBF7]">
          NEXORA TECHNOLOGIES
        </div>
        <div className="text-[10px] text-[#FDFBF7]/70 italic tracking-wider">
          "Ideas to Impact"
        </div>
        <p className="text-[10px] text-[#FDFBF7]/60 pt-1 max-w-xs mx-auto">
          Android-first standalone hybrid architecture with Capacitor, React, Vite and Three.js 3D PBR rendering engine.
        </p>
      </div>
    </div>
  );
};
