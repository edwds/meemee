
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Users, Utensils, ArrowRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { ReviewRecord, TasteProfile } from '../types';
import { DUMMY_DISCOVER_DATA } from '../data/dummyData';

interface DiscoverProps {
  userRecords: ReviewRecord[];
}

export const Discover: React.FC<DiscoverProps> = ({ userRecords }) => {
  const location = useLocation();

  // Calculate User's Average Taste Profile
  const userAvgProfile = useMemo(() => {
    if (userRecords.length === 0) return null;

    const sums = userRecords.reduce((acc, r) => ({
      spiciness: acc.spiciness + r.tasteProfile.spiciness,
      sweetness: acc.sweetness + r.tasteProfile.sweetness,
      saltiness: acc.saltiness + r.tasteProfile.saltiness,
      acidity: acc.acidity + r.tasteProfile.acidity,
      richness: acc.richness + r.tasteProfile.richness,
    }), { spiciness: 0, sweetness: 0, saltiness: 0, acidity: 0, richness: 0 });

    const count = userRecords.length;
    return {
      spiciness: sums.spiciness / count,
      sweetness: sums.sweetness / count,
      saltiness: sums.saltiness / count,
      acidity: sums.acidity / count,
      richness: sums.richness / count,
    };
  }, [userRecords]);

  // Calculate Match Score
  const calculateMatchScore = (restProfile: TasteProfile): number => {
    if (!userAvgProfile) return 80; // Default if no user data

    // Calculate distance (Max distance per attribute is 4: |5-1|)
    // Total Max Distance = 4 * 5 attributes = 20
    const totalDistance = 
      Math.abs(userAvgProfile.spiciness - restProfile.spiciness) +
      Math.abs(userAvgProfile.sweetness - restProfile.sweetness) +
      Math.abs(userAvgProfile.saltiness - restProfile.saltiness) +
      Math.abs(userAvgProfile.acidity - restProfile.acidity) +
      Math.abs(userAvgProfile.richness - restProfile.richness);

    // Normalize to percentage: 0 distance = 100%, 20 distance = 0%
    const score = 100 - (totalDistance / 20 * 100);
    
    // Add a little randomness/bias to make it feel more natural (not just math)
    return Math.round(Math.max(10, Math.min(99, score)));
  };

  // Sort restaurants by match score
  const sortedRestaurants = useMemo(() => {
    return [...DUMMY_DISCOVER_DATA].map(rest => ({
      ...rest,
      matchScore: calculateMatchScore(rest.tasteProfile)
    })).sort((a, b) => b.matchScore - a.matchScore);
  }, [userAvgProfile]);

  return (
    <Layout title="디스커버" hasTabBar={true}>
      <div className="pb-4 px-4">
        <div className="py-4">
          <h2 className="text-xl font-bold text-secondary mb-1">취향 저격 맛집</h2>
          <p className="text-xs text-gray-500">내 입맛 데이터와 친구들의 방문 기록을 분석했어요.</p>
        </div>

        <div className="space-y-5">
          {sortedRestaurants.map((rest) => (
            <Link to={`/restaurant/${rest.id}`} key={rest.id} className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform">
              <div className="relative h-40">
                <img src={rest.photo} alt={rest.name} className="w-full h-full object-cover" />
                
                {/* Match Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <div className="relative w-4 h-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className={rest.matchScore >= 85 ? "text-primary" : rest.matchScore >= 60 ? "text-yellow-500" : "text-gray-400"}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${rest.matchScore}, 100`}
                      />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold ${rest.matchScore >= 85 ? "text-primary" : "text-secondary"}`}>
                    {rest.matchScore}% 매칭
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-secondary">{rest.name}</h3>
                    <p className="text-xs text-gray-400 font-medium">{rest.category}</p>
                  </div>
                  <div className="bg-gray-50 px-2 py-1 rounded-lg">
                    <ArrowRight size={14} className="text-gray-300" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Utensils size={14} className="text-gray-400" />
                  <span className="truncate">{rest.menu}</span>
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {rest.keywords.map(k => (
                    <span key={k} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100">
                      #{k}
                    </span>
                  ))}
                </div>

                {/* Friends */}
                {rest.visitedFriends.length > 0 && (
                  <div className="flex items-center border-t border-gray-50 pt-3">
                    <div className="flex -space-x-2 mr-2">
                      {rest.visitedFriends.map((friend, idx) => (
                        <div key={idx} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500">
                          {friend[0]}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      <span className="font-bold text-secondary">{rest.visitedFriends[0]}</span>님 외 {rest.visitedFriends.length - 1}명이 방문함
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <BottomTabBar activeTab="discover" />
    </Layout>
  );
};
