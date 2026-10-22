import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'navy';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  variant = 'navy',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Geometric Interlocking Connected Nodes Icon */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-br from-[#101A35] via-[#1677FF] to-[#101A35] shadow-md flex items-center justify-center p-1.5 shrink-0 transition-transform hover:scale-105`}
        title="KONEKTA - Bringing People Closer"
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Connecting bridge line */}
          <path
            d="M 32 50 C 42 35, 58 65, 68 50"
            stroke="#57D7F2"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Primary left node circle (White) */}
          <circle
            cx="32"
            cy="50"
            r="16"
            stroke="#FFFFFF"
            strokeWidth="8"
            fill="#101A35"
          />
          <circle cx="32" cy="50" r="7" fill="#57D7F2" />

          {/* Interlocking right node circle (Turquoise) */}
          <circle
            cx="68"
            cy="50"
            r="16"
            stroke="#57D7F2"
            strokeWidth="8"
            fill="#1677FF"
          />
          <circle cx="68" cy="50" r="7" fill="#FFFFFF" />

          {/* Top pulse accent dot */}
          <circle cx="50" cy="24" r="5" fill="#57D7F2" className="animate-pulse" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-wider font-display leading-tight ${textSizes[size]} ${
                isLight ? 'text-white' : 'text-[#101A35]'
              }`}
            >
              KONEKTA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#57D7F2] inline-block mb-1" />
          </div>
          {showTagline && (
            <span
              className={`text-xs font-medium tracking-wide ${
                isLight ? 'text-[#57D7F2]' : 'text-[#667085]'
              }`}
            >
              Bringing People Closer
            </span>
          )}
        </div>
      )}
    </div>
  );
};
