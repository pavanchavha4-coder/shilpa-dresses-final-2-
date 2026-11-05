import React, { useEffect, useState } from 'react';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#380B12] via-[#4A0E17] to-[#25060B] text-[#FDFBF7] p-8 select-none">
      {/* Top subtle badge */}
      <div className="pt-8 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#D4AF37]/90 font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Boutique Couture & VIP Trial Studio</span>
      </div>

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
        {/* Shilpa Regal Crest */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37] flex items-center justify-center bg-[#4A0E17] shadow-[0_0_35px_rgba(212,175,55,0.35)]">
            <Crown className="w-12 h-12 text-[#D4AF37]" />
          </div>
          <div className="absolute -inset-2 rounded-full border border-[#D4AF37]/30 border-dashed animate-spin [animation-duration:18s]" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-[0.15em] text-[#FDFBF7] font-brand drop-shadow-sm">
            SHILPA DRESSES
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">
            Royalty in Every Thread
          </p>
        </div>

        <p className="text-xs text-[#FDFBF7]/75 max-w-xs leading-relaxed pt-2">
          Experience bespoke Indian couture, luxury fabrics, and private salon fitting sessions.
        </p>
      </div>

      {/* Bottom Developer Branding & Progress */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-4 pb-6">
        {/* Progress Bar */}
        <div className="w-full bg-[#25060B] h-1.5 rounded-full overflow-hidden border border-[#D4AF37]/30">
          <div
            className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] h-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* NEXORA Technologies Branding */}
        <div className="text-center space-y-1 pt-2">
          <div className="text-[11px] text-[#FDFBF7]/60 tracking-wider">
            Developed & Branded by
          </div>
          <div className="flex items-center justify-center gap-1.5 text-sm font-bold tracking-widest text-[#D4AF37]">
            <span>NEXORA TECHNOLOGIES</span>
          </div>
          <div className="text-[10px] text-[#FDFBF7]/70 italic tracking-wider">
            "Ideas to Impact"
          </div>
        </div>

        {/* Skip button for instant responsiveness */}
        <button
          onClick={onFinish}
          className="text-xs text-[#FDFBF7]/60 hover:text-[#D4AF37] flex items-center gap-1 transition-colors pt-1"
        >
          <span>Tap to enter boutique</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
