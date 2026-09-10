import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'lg',
  showText = true,
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Education & Open Book Vector Icon */}
      <div className={`${iconDimensions} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Graduation Cap */}
          <path
            d="M80 20L116 38L80 56L44 38L80 20Z"
            fill="#C51E28"
          />
          <path
            d="M80 56V66C80 72 90 76 96 76"
            stroke="#C51E28"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="96" cy="78" r="2.5" fill="#C51E28" />

          {/* Emerging Star / Student Head */}
          <circle cx="80" cy="50" r="5" fill="#C51E28" />

          {/* Student Arms / Victory Joy Figure */}
          <path
            d="M66 68C72 60 76 56 80 56C84 56 88 60 94 68C98 74 102 78 104 80"
            stroke="#C51E28"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M56 80C58 78 62 74 66 68"
            stroke="#C51E28"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Student Torso */}
          <path
            d="M74 72C77 82 78 94 80 102C82 94 83 82 86 72"
            fill="#C51E28"
          />

          {/* Open Book Wings - Left Page Layers */}
          <path
            d="M76 106C56 100 36 104 26 112V80C38 72 58 70 76 76V106Z"
            stroke="#C51E28"
            strokeWidth="5"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M76 116C54 110 32 114 20 122V90C34 82 56 80 76 86"
            stroke="#C51E28"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Open Book Wings - Right Page Layers */}
          <path
            d="M84 106C104 100 124 104 134 112V80C122 72 102 70 84 76V106Z"
            stroke="#C51E28"
            strokeWidth="5"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M84 116C106 110 128 114 140 122V90C126 82 104 80 84 86"
            stroke="#C51E28"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Spine Base Center */}
          <path
            d="M80 80V120"
            stroke="#C51E28"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="text-center mt-3">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#C51E28] leading-none font-sans">
            JJSAK
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-800 tracking-wide mt-1.5">
            School Assessment Reports
          </p>
        </div>
      )}
    </div>
  );
};
