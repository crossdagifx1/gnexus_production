import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Page transitions disabled - pages now load instantly without animations
export const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
};

export default PageTransition;
