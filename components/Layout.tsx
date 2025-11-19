import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  hasTabBar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBack = false,
  hasTabBar = false 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-screen shadow-xl relative flex flex-col">
        {/* Header */}
        <header className="h-14 px-4 flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 flex items-center">
            {showBack && (
              <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                <ArrowLeft size={24} />
              </button>
            )}
          </div>
          
          <h1 className="font-bold text-lg text-secondary truncate max-w-[200px]">{title || 'meemee'}</h1>
          
          <div className="w-10" /> {/* Spacer for alignment */}
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-y-auto no-scrollbar ${hasTabBar ? 'pb-24' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};