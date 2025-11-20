import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Compass } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: 'home' | 'feed' | 'discover';
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab }) => {
  const getTabClass = (tabName: string) => 
    activeTab === tabName 
      ? "text-secondary scale-100 font-bold" 
      : "text-gray-300 hover:text-gray-500 active:scale-90 font-medium";

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe z-40 left-1/2 transform -translate-x-1/2">
      <div className="grid grid-cols-3 items-center h-[60px] px-6">
        
        {/* Tab 1: My Records */}
        <Link to="/" className={`flex flex-col items-center space-y-1 transition-all duration-200 ${getTabClass('home')}`}>
          <BookOpen strokeWidth={activeTab === 'home' ? 2.5 : 2} size={24} />
          <span className="text-[10px]">내 기록</span>
        </Link>

        {/* Tab 2: Feed */}
        <Link to="/feed" className={`flex flex-col items-center space-y-1 transition-all duration-200 ${getTabClass('feed')}`}>
          <Users strokeWidth={activeTab === 'feed' ? 2.5 : 2} size={24} />
          <span className="text-[10px]">친구들</span>
        </Link>

        {/* Tab 3: Discover */}
        <Link to="/discover" className={`flex flex-col items-center space-y-1 transition-all duration-200 ${getTabClass('discover')}`}>
          <Compass strokeWidth={activeTab === 'discover' ? 2.5 : 2} size={24} />
          <span className="text-[10px]">디스커버</span>
        </Link>
        
      </div>
    </div>
  );
};