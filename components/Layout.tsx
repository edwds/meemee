import React, { useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  hasTabBar?: boolean;
  scrollable?: boolean;
  floatingAction?: React.ReactNode;
  hideHeader?: boolean;
  backgroundColor?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBack = false,
  hasTabBar = false,
  scrollable = true,
  floatingAction,
  hideHeader = false,
  backgroundColor = 'bg-background'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  const handleBack = () => {
    navigate(-1);
  };

  // Scroll to top whenever the path changes (e.g. clicking a related record in RecordDetail)
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="h-[100dvh] bg-gray-50 flex justify-center overflow-hidden">
      <div className={`w-full max-w-md ${backgroundColor} h-full shadow-2xl relative flex flex-col`}>
        {/* Header - Conditionally Rendered */}
        {!hideHeader && (
          <header className="h-14 px-4 flex items-center justify-between bg-surface/90 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 flex-shrink-0">
            <div className="w-10 flex items-center">
              {showBack && (
                <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors">
                  <ArrowLeft size={24} />
                </button>
              )}
            </div>
            
            <h1 className="font-bold text-[17px] text-secondary truncate max-w-[200px]">{title || 'meemee'}</h1>
            
            <div className="w-10" /> {/* Spacer for alignment */}
          </header>
        )}

        {/* Content */}
        {/* min-h-0 is crucial for nested flex scrolling */}
        <main 
          ref={mainRef}
          className={`flex-1 flex flex-col min-h-0 relative ${scrollable ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'} ${hasTabBar && scrollable ? 'pb-[100px]' : ''}`}
        >
          {children}
        </main>

        {/* Floating Action Button Container (Absolute relative to the max-w-md frame) */}
        {floatingAction && (
          <div className="z-50 pointer-events-none">
            {floatingAction}
          </div>
        )}
      </div>
    </div>
  );
};