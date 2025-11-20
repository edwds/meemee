
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MapPin, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { FeedPost, Preference, TasteProfile } from '../types';

const DUMMY_FEED_DATA: FeedPost[] = [
  {
    id: 'f-1',
    author: {
      name: '강민지',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80'
    },
    timeAgo: '2시간 전',
    likeCount: 12,
    isLiked: false,
    record: {
      id: 'r-101',
      title: '블루보틀 성수',
      category: '카페',
      photos: ['https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=800&q=80'],
      representativePhoto: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=800&q=80',
      preference: Preference.GOOD,
      menu: '뉴올리언스 아이스',
      visitDate: '2024-05-22',
      companions: '친구',
      tasteProfile: { spiciness: 1, sweetness: 4, saltiness: 1, acidity: 2, richness: 4 },
      keywords: ['감성적', '데이트용', '힙한'],
      aiGeneratedText: '부드러운 우유와 거친 커피 텍스처의 조화가 훌륭하다. 공간이 주는 힙한 바이브가 커피 맛의 깊이를 더해주며, 끝맛에 남는 은은한 단맛이 기분 좋은 여운을 선사한다.',
      createdAt: Date.now()
    }
  },
  {
    id: 'f-2',
    author: {
      name: '박철수',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80'
    },
    timeAgo: '5시간 전',
    likeCount: 28,
    isLiked: true,
    record: {
      id: 'r-102',
      title: '다운타우너',
      category: '버거',
      photos: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80'],
      representativePhoto: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80',
      preference: Preference.GOOD,
      menu: '아보카도 버거',
      visitDate: '2024-05-22',
      companions: '혼자',
      tasteProfile: { spiciness: 2, sweetness: 2, saltiness: 4, acidity: 2, richness: 5 },
      keywords: ['묵직한', '웨이팅필수', '인생버거'],
      aiGeneratedText: '아보카도의 크리미함이 패티의 육즙과 환상적으로 어우러진다. 한 입 베어 무는 순간 느껴지는 꽉 찬 행복감과 묵직한 바디감이 일품이다.',
      createdAt: Date.now()
    }
  },
  {
    id: 'f-3',
    author: {
      name: '이수진',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80'
    },
    timeAgo: '1일 전',
    likeCount: 5,
    isLiked: false,
    record: {
      id: 'r-103',
      title: '을지면옥',
      category: '한식',
      photos: ['https://images.unsplash.com/photo-1626804475297-411d8b6601df?auto=format&fit=crop&w=800&q=80'],
      representativePhoto: 'https://images.unsplash.com/photo-1626804475297-411d8b6601df?auto=format&fit=crop&w=800&q=80',
      preference: Preference.NORMAL,
      menu: '평양냉면',
      visitDate: '2024-05-21',
      companions: '부모님',
      tasteProfile: { spiciness: 1, sweetness: 1, saltiness: 2, acidity: 1, richness: 1 },
      keywords: ['담백한', '전통적인', '호불호'],
      aiGeneratedText: '처음엔 슴슴하지만 먹을수록 올라오는 육향이 매력적이다. 메밀 면발의 툭툭 끊기는 식감이 평양냉면의 정석을 보여준다.',
      createdAt: Date.now()
    }
  }
];

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>(DUMMY_FEED_DATA);

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
        };
      }
      return post;
    }));
  };

  const renderTasteMiniBar = (label: string, value: number) => (
    <div className="flex flex-col items-center space-y-1">
      <div className="h-12 w-1.5 bg-gray-100 rounded-full relative flex items-end overflow-hidden">
        <div 
            className="w-full bg-primary rounded-full"
            style={{ height: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-[9px] text-gray-400 font-medium">{label}</span>
    </div>
  );

  return (
    <Layout title="친구들의 미식" hasTabBar={true}>
      <div className="pb-4 px-4 space-y-6 pt-4">
        {posts.map((post) => (
          <article key={post.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            
            {/* 1. Header: Author & Date */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50 bg-white">
                <Link to={`/profile/${post.author.name}`} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100">
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-secondary leading-none mb-1">{post.author.name}</h3>
                        <p className="text-[10px] text-gray-400 font-medium">{post.timeAgo}</p>
                    </div>
                </Link>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    post.record.preference === Preference.GOOD ? 'bg-orange-50 text-primary' : 
                    post.record.preference === Preference.NORMAL ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                }`}>
                    {post.record.preference}
                </div>
            </div>

            {/* 2. Main Photo & Basic Info */}
            <div className="relative w-full aspect-[4/3]">
                <img src={post.record.representativePhoto} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-5 pt-12">
                    <div className="flex items-center text-white/80 text-xs font-medium mb-1">
                        <MapPin size={12} className="mr-1" />
                        {post.record.category}
                    </div>
                    <h2 className="text-white text-xl font-bold leading-tight mb-0.5 shadow-sm">{post.record.title}</h2>
                    <p className="text-white/90 text-sm font-medium">{post.record.menu}</p>
                </div>
            </div>

            {/* 3. Gourmet Report Content */}
            <div className="p-6">
                {/* Taste Profile Visualization */}
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex justify-between px-2">
                        {renderTasteMiniBar('매운', post.record.tasteProfile.spiciness)}
                        {renderTasteMiniBar('단맛', post.record.tasteProfile.sweetness)}
                        {renderTasteMiniBar('짠맛', post.record.tasteProfile.saltiness)}
                        {renderTasteMiniBar('신맛', post.record.tasteProfile.acidity)}
                        {renderTasteMiniBar('풍미', post.record.tasteProfile.richness)}
                    </div>
                </div>

                {/* Tasting Note (The Review) */}
                <div className="relative pl-4 border-l-2 border-primary/30 mb-5">
                    <p className="text-sm text-gray-700 leading-relaxed font-serif italic">
                        "{post.record.aiGeneratedText}"
                    </p>
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                    {post.record.keywords.map(k => (
                        <span key={k} className="text-[10px] bg-white text-gray-500 px-2 py-1 rounded border border-gray-200">
                            #{k}
                        </span>
                    ))}
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => toggleLike(post.id)}
                            className="flex items-center gap-1.5 text-secondary active:scale-95 transition-transform"
                        >
                            <Heart 
                                size={20} 
                                className={post.isLiked ? "fill-red-500 text-red-500" : "text-gray-400"} 
                            />
                            <span className="text-xs font-bold text-gray-600">{post.likeCount}</span>
                        </button>
                        
                        <button className="flex items-center gap-1.5 text-secondary active:scale-95 transition-transform">
                            <MessageCircle size={20} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-600">댓글</span>
                        </button>
                    </div>
                    <button className="text-gray-400 hover:text-primary transition-colors">
                        <Sparkles size={18} />
                    </button>
                </div>
            </div>
          </article>
        ))}
        
        <div className="h-10"></div>
      </div>

      <BottomTabBar activeTab="feed" />
    </Layout>
  );
};
