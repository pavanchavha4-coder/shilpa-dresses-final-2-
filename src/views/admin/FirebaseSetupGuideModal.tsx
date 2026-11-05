import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Cloud, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Database,
  Terminal
} from 'lucide-react';

interface FirebaseSetupGuideModalProps {
  onClose: () => void;
}

export const FirebaseSetupGuideModal: React.FC<FirebaseSetupGuideModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const envSnippet = `# Shilpa Dresses Firebase Environment Configuration
VITE_FIREBASE_API_KEY="AIzaSyYourApiKeyHere"
VITE_FIREBASE_AUTH_DOMAIN="shilpa-dresses.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="shilpa-dresses"
VITE_FIREBASE_STORAGE_BUCKET="shilpa-dresses.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"`;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-[#FDFBF7] text-[#241315] w-full max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-[#D4AF37]/50">
        
        {/* Header */}
        <div className="bg-[#4A0E17] text-[#FDFBF7] px-4 py-3 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-brand font-bold text-sm tracking-wider uppercase">
              Google Firebase Cloud Setup Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#FDFBF7]/80 hover:text-[#FDFBF7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4 text-xs text-[#4A3C38] leading-relaxed no-scrollbar">
          <div className="p-3.5 bg-[#FAF6EE] rounded-2xl border border-[#EADBCA] space-y-1.5">
            <div className="font-bold text-[#4A0E17] flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              Enterprise Zero-Trust Security Architecture
            </div>
            <p className="text-[11px] text-[#6B5A51]">
              Shilpa Dresses is architected for seamless operation across both Cloud Firestore and an offline-first local boutique engine. No mock data is used; changes are stored with mathematical validation.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <h4 className="font-brand font-bold text-xs uppercase tracking-wider text-[#380B12]">
              3-Step Firebase Connection Instructions:
            </h4>

            {/* Step 1 */}
            <div className="p-3 bg-white rounded-xl border border-[#E0D5C3] space-y-1">
              <div className="font-bold text-[#380B12] flex items-center justify-between">
                <span>1. Create Firebase Project & Enable Firestore</span>
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-[#4A0E17] font-semibold flex items-center gap-1 underline"
                >
                  <span>Firebase Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-[#7A6458]">
                Go to the Firebase console, create a new project, navigate to <strong>Build &gt; Firestore Database</strong>, and click <strong>Create Database</strong> in Production mode.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-white rounded-xl border border-[#E0D5C3] space-y-1">
              <div className="font-bold text-[#380B12]">
                <span>2. Deploy Security Rules</span>
              </div>
              <p className="text-[11px] text-[#7A6458]">
                Deploy the pre-written zero-trust security rules located in <code className="bg-[#FAF6EE] px-1 py-0.5 rounded border border-[#E0D5C3]">/firestore.rules</code>. Customers can create Pending trials without touching stock or private admin records.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-white rounded-xl border border-[#E0D5C3] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#380B12]">3. Environment Variables (.env)</span>
                <button
                  onClick={() => copyToClipboard(envSnippet, 'env')}
                  className="text-[10px] font-bold text-[#4A0E17] flex items-center gap-1 bg-[#FAF6EE] px-2 py-1 rounded border border-[#E0D5C3] hover:bg-[#F3E5AB]/40"
                >
                  {copiedKey === 'env' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'env' ? 'Copied' : 'Copy Template'}</span>
                </button>
              </div>

              <pre className="bg-[#1C1618] text-[#F3E5AB] p-2.5 rounded-lg text-[10px] font-mono overflow-x-auto">
                {envSnippet}
              </pre>
            </div>
          </div>

          {/* Android Standalone APK info */}
          <div className="p-3.5 bg-[#FAF6EE] rounded-2xl border border-[#EADBCA] space-y-1.5">
            <div className="font-bold text-[#4A0E17] flex items-center gap-1.5 text-xs">
              <Terminal className="w-4 h-4 text-[#D4AF37]" />
              Android Standalone APK Credentials
            </div>
            <p className="text-[11px] text-[#6B5A51]">
              When compiling into the standalone APK via Capacitor (<code className="font-mono">com.nexora.shilpadresses</code>), you can also bundle <code className="font-mono">google-services.json</code> inside <code className="font-mono">android/app/</code> for native Google Play and Firebase services.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FDFBF7] border-t border-[#EADBCA]">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#4A0E17] text-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-xl shadow hover:bg-[#380B12] transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
