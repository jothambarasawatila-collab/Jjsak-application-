import React from 'react';
import { ArrowRight, BarChart3, GraduationCap, Trophy, BookOpen, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface SplashScreenProps {
  onGetStarted: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col justify-between overflow-hidden select-none">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-48 h-48 opacity-15 pointer-events-none">
        {/* Soft Dot Pattern */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#C51E28" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>

      <div className="absolute top-12 right-6 w-20 h-20 rounded-full bg-red-100/50 blur-xl pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 z-10 text-center max-w-md mx-auto">
        <BrandLogo size="xl" showText={true} />

        <div className="mt-8 px-4">
          <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
            Smart. Simple. Accurate.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Assessment reporting made easy for schools.
          </p>
        </div>
      </div>

      {/* Bottom Red Wave Container with Action Button */}
      <div className="relative w-full bg-gradient-to-b from-[#C51E28] to-[#A3161F] text-white pt-10 pb-8 px-6 overflow-hidden">
        {/* Curved Wave Top */}
        <div className="absolute -top-10 left-0 right-0 h-12 text-[#C51E28] pointer-events-none">
          <svg
            viewBox="0 0 500 150"
            preserveAspectRatio="none"
            className="w-full h-full fill-current"
          >
            <path d="M0,80 C150,140 350,20 500,80 L500,150 L0,150 Z"></path>
          </svg>
        </div>

        {/* Decorative Watermark Background Icons */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-around pointer-events-none px-4">
          <BarChart3 className="w-8 h-8" />
          <GraduationCap className="w-9 h-9" />
          <BookOpen className="w-8 h-8" />
          <Trophy className="w-9 h-9" />
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="relative z-10 max-w-sm mx-auto flex flex-col items-center gap-4">
          {/* White Pill Get Started Button */}
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full py-3.5 px-6 rounded-full bg-white text-[#C51E28] hover:bg-red-50 active:scale-[0.98] font-bold text-sm sm:text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 text-[#C51E28]" />
          </button>

          {/* Secure Tagline & Copyright */}
          <div className="flex flex-col items-center gap-1.5 mt-2">
            <span className="text-[11px] font-semibold tracking-wider text-red-100 opacity-90">
              Secure • Reliable • Efficient
            </span>
            <span className="text-[10px] font-medium text-red-200/80">
              JJSAK © 2024
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
