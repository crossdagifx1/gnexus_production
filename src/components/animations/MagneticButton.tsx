import { ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
}

// MagneticButton disabled - no magnetic animations
export const MagneticButton = ({
  children,
  className = '',
  onClick,
}: MagneticButtonProps) => {
  return (
    <div
      onClick={onClick}
      className={`relative inline-block ${className}`}
    >
      <span className="block">
        {children}
      </span>
    </div>
  );
};

// GlowButton disabled - no glow animations
interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlowButton = ({
  children,
  className = '',
  onClick,
}: GlowButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

// RippleButton disabled - no ripple animations
interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const RippleButton = ({
  children,
  className = '',
  onClick,
}: RippleButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
    </button>
  );
};
