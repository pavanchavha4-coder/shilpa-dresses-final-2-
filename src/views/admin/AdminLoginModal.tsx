import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminLoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onClose,
  onLoginSuccess
}) => {
  const { loginAdmin } = useStore();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const result = await loginAdmin(usernameOrEmail, password);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setErrorMsg(result.error || 'Invalid credentials');
    }
  };

  const autofillDemoCredentials = () => {
    setUsernameOrEmail('admin@shilpadresses.com');
    setPassword('Nexora@Shilpa2026');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#FDFBF7] text-[#241315] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/50">
        
        {/* Header */}
        <div className="bg-[#4A0E17] text-[#FDFBF7] p-5 text-center relative border-b border-[#D4AF37]/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-[#FDFBF7]/80 hover:text-[#FDFBF7] hover:bg-[#380B12]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-full bg-[#380B12] border border-[#D4AF37] flex items-center justify-center mb-2 shadow">
            <Lock className="w-6 h-6 text-[#D4AF37]" />
          </div>

          <h3 className="font-brand font-bold text-base tracking-wider uppercase text-[#FDFBF7]">
            Boutique Staff & Owner Access
          </h3>
          <p className="text-[11px] text-[#D4AF37] uppercase tracking-widest mt-0.5">
            SHILPA DRESSES • NEXORA
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-[#4A0E17] uppercase tracking-wider mb-1">
              Admin ID / Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8F7E75] absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. admin@shilpadresses.com"
                value={usernameOrEmail}
                onChange={e => setUsernameOrEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E0D5C3] text-[#241315] focus:outline-none focus:border-[#4A0E17]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#4A0E17] uppercase tracking-wider mb-1">
              Security Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8F7E75] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Enter owner password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E0D5C3] text-[#241315] focus:outline-none focus:border-[#4A0E17]"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Autofill Hint */}
          <div className="bg-[#FAF6EE] p-2.5 rounded-xl border border-[#EADBCA] text-[11px] text-[#543D32] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#4A0E17]">Demo Credentials:</span>
              <div className="text-[10px] text-[#7A6458]">admin@shilpadresses.com / Nexora@Shilpa2026</div>
            </div>
            <button
              type="button"
              onClick={autofillDemoCredentials}
              className="px-2 py-1 bg-[#4A0E17] text-[#D4AF37] rounded-lg text-[10px] font-bold tracking-wider uppercase hover:bg-[#380B12]"
            >
              Autofill
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#4A0E17] text-[#D4AF37] text-xs font-bold uppercase tracking-wider rounded-xl shadow hover:bg-[#380B12] transition-colors flex items-center justify-center gap-1.5 border border-[#D4AF37]/40 active:scale-98"
          >
            {isLoading ? <span>Verifying Security Key...</span> : (
              <>
                <span>Sign In to Owner Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
