import React, { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { MapPin, Users, Utensils, Star, Crown, CalendarCheck, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ReviewRecord, Preference } from '../types';
import { DUMMY_DISCOVER_DATA } from '../data/dummyData';

interface RestaurantDetailProps { userRecords: ReviewRecord[]; }

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ userRecords }) => {
  const { id } = useParams<{ id: string }>();
  const restaurant = DUMMY_DISCOVER_DATA.find(r => r.id === id);
  if (!restaurant) return <Navigate to="/discover" />;
  const myReviews = userRecords.filter(r => r.title === restaurant.name);
  const visitCount = myReviews.length;
  
  const communityRecords = [{ id: 'cr-1', author: '미식탐험가', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', date: '3일 전', preference: Preference.GOOD, photo: restaurant.photo, tasteProfile: restaurant.tasteProfile, keywords: restaurant.keywords, reviewText: `전반적으로 ${restaurant.keywords[0]} 느낌이 강해서 좋았습니다.` }];

  return (
    <Layout title={restaurant.name} showBack hasTabBar={false}>
      <div className="pb-safe min-h-full bg-white">
        <div className="relative h-64 w-full"><img src={restaurant.photo} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><div className="absolute bottom-0 left-0 w-full p-6 text-white"><h1 className="text-3xl font-bold">{restaurant.name}</h1></div></div>
        <div className="px-5 -mt-4 relative z-10">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-50 p-5 mb-6">
                <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-secondary flex items-center"><Crown size={18} className="mr-2 text-yellow-500 fill-yellow-500" />이 구역의 마스터</h3></div>
                <div className="text-center py-4 bg-gray-50 rounded-xl mb-4 text-xs text-gray-400">아직 마스터가 없어요. 첫 번째 마스터가 되어보세요!</div>
                <div><div className="flex justify-between items-end mb-2"><span className="text-xs font-bold text-gray-500">나의 방문 기록</span><span className="text-sm font-bold text-primary">{visitCount}회</span></div></div>
            </div>
            <a href="https://app.catchtable.co.kr/" target="_blank" rel="noopener noreferrer" className="block w-full bg-[#FE3D3D] text-white font-bold text-center py-4 rounded-2xl shadow-lg mb-8 flex items-center justify-center gap-2"><CalendarCheck size={20} />캐치테이블에서 예약하기</a>
            <div className="mb-8"><h3 className="font-bold text-secondary mb-3 flex items-center"><Utensils size={18} className="mr-2 text-gray-400" />대표 메뉴 & 키워드</h3><p className="text-sm text-gray-600 mb-3">{restaurant.menu}</p></div>
            {visitCount > 0 && (
                <div className="mb-8">
                    <h3 className="font-bold text-primary flex items-center mb-3"><Star size={18} className="mr-2 fill-primary" />나의 기록 모아보기</h3>
                    <div className="space-y-5">
                        {myReviews.map(review => (
                            <Link key={review.id} to={`/record/${review.id}`} className="block"><div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-200"><div className="h-40 relative"><img src={review.representativePhoto} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div><div className="absolute bottom-3 left-4 text-white"><h4 className="font-bold text-lg">{review.menu}</h4></div></div><div className="p-4"><p className="text-sm text-gray-700 font-serif italic">"{review.reviewText}"</p></div></div></Link>
                        ))}
                    </div>
                </div>
            )}
            <div className="pb-8"><h3 className="font-bold text-secondary mb-4 flex items-center"><Users size={18} className="mr-2 text-gray-400" />Community Logs</h3><div className="space-y-6">{communityRecords.map(record => (<div key={record.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"><div className="h-48 relative"><img src={record.photo} className="w-full h-full object-cover" /><div className="absolute bottom-0 left-0 w-full p-4 text-white"><div className="flex items-center gap-1.5"><Sparkles size={14} /><span className="text-xs font-bold">Tasting Note</span></div></div></div><div className="p-4"><p className="text-sm text-gray-700 font-serif italic">"{record.reviewText}"</p></div></div>))}</div></div>
        </div>
      </div>
    </Layout>
  );
};
