
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MapPin, Sparkles, Zap, Bookmark, MoreHorizontal, Share2, Music } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { FeedPost, Preference, ReviewRecord, DetailedEvaluation } from '../types';

// Mock Data Pools
const MOCK_AUTHORS = [
  { name: '강민지', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
  { name: '박철수', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80' },
  { name: '김지현', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
  { name: '최준호', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=150&q=80' },
  { name: '이수진', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { name: '정우성', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' }
];

const MOCK_CONTENTS = [
  {
    title: '미드나잇 라멘', menu: '돈코츠 라멘', category: '일식',
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    text: '국물의 깊이가 남다르다. 자가제면의 식감도 훌륭하고, 차슈의 불향이 국물과 완벽하게 어우러진다. 해장이 필요할 때 무조건 생각날 맛.'
  },
  {
    title: '카페 레이어드', menu: '스콘 & 커피', category: '카페',
    photo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
    text: '버터 풍미 가득한 스콘과 산미 있는 아메리카노의 조화. 채광 좋은 창가 자리는 덤이다. 주말에는 웨이팅이 필수지만 그럴 가치가 충분하다.'
  },
  {
    title: '도산 분식', menu: '육회 김밥', category: '한식',
    photo: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=800&q=80',
    text: '레트로한 분위기 속에서 즐기는 육회 김밥의 고소함. 분식의 고급화란 이런 것일까. 친구들과 가볍게 들르기 좋은 힙한 공간.'
  },
  {
    title: '타코 튜즈데이', menu: '비리아 타코', category: '멕시칸',
    photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    text: '한 입 베어 물자마자 터지는 육즙과 고수의 향. 멕시코 현지의 맛을 그대로 재현했다. 라임즙을 듬뿍 뿌려 먹으면 풍미가 배가된다.'
  },
  {
    title: '한남 솥밥', menu: '스테이크 솥밥', category: '한식',
    photo: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    text: '갓 지은 밥의 고슬고슬함과 부드러운 스테이크. 마지막 누룽지까지 완벽한 한 끼. 부모님을 모시고 와도 좋을 정갈한 식사.'
  }
];

// Updated Gourmet Keywords
const KEYWORD_POOLS = {
  texture: ['쫄깃한', '부드러운', '바삭한', '녹진한', '탱글한', '꾸덕한', '촉촉한', '몽글몽글', '야들야들'],
  flavor: ['불향', '버터미', '고소한', '감칠맛', '산뜻한', '육향가득', '트러플향', '스모키한', '알싸한'],
  note: ['본연의 맛', '이색적인', '중독성 있는', '술을 부르는', '밥도둑', '깔끔한', '현지의 맛', '해장되는'],
  atmosphere: ['힙한', '차분한', '활기찬', '로맨틱', '노포 감성', '인스타감성', '모던한', '이국적인'],
  service: ['친절한', '전문적인', '빠른 응대', '주차가능', '예약 필수', '프라이빗']
};

const getRandomItems = (arr: string[], count: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const GENERATE_DUMMY_DATA = (): FeedPost[] => {
  return Array.from({ length: 20 }).map((_, i) => {
    const content = MOCK_CONTENTS[i % MOCK_CONTENTS.length];
    const author = MOCK_AUTHORS[i % MOCK_AUTHORS.length];
    
    // Generate Random Detailed Evaluation
    const detailedEval: DetailedEvaluation = {
      menu: {
        texture: getRandomItems(KEYWORD_POOLS.texture, 1),
        flavor: getRandomItems(KEYWORD_POOLS.flavor, 1),
        note: getRandomItems(KEYWORD_POOLS.note, 1)
      },
      venue: {
        atmosphere: getRandomItems(KEYWORD_POOLS.atmosphere, 1),
        service: getRandomItems(KEYWORD_POOLS.service, 1)
      }
    };

    // Flatten keywords for display
    const allKeywords = [
      ...detailedEval.menu.texture,
      ...detailedEval.menu.flavor,
      ...detailedEval.menu.note,
      ...detailedEval.venue.atmosphere
    ];

    // Duplicate photos to test carousel
    const dummyPhotos = [content.photo, content.photo, content.photo];

    const record: ReviewRecord = {
      id: `rec-${i}`,
      title: content.title,
      category: content.category,
      photos: dummyPhotos,
      representativePhoto: content.photo,
      preference: Math.random() > 0.3 ? Preference.GOOD : Preference.NORMAL,
      menu: content.menu,
      visitDate: '2024-05-22',
      companions: '친구',
      tasteProfile: { 
        spiciness: Math.ceil(Math.random() * 5), 
        sweetness: Math.ceil(Math.random() * 5), 
        saltiness: Math.ceil(Math.random() * 5), 
        acidity: Math.ceil(Math.random() * 5), 
        richness: Math.ceil(Math.random() * 5) 
      },
      detailedEvaluation: detailedEval,
      keywords: allKeywords,
      reviewText: content.text,
      createdAt: Date.now() - Math.floor(Math.random() * 100000000),
      rank: Math.random() > 0.8 ? Math.ceil(Math.random() * 10) : undefined,
      location: { lat: 37.5 + Math.random() * 0.1, lng: 127.0 + Math.random() * 0.1, address: '서울' }
    };
    
    return {
      id: `feed-${i}`,
      author: author,
      timeAgo: `${Math.floor(Math.random() * 23) + 1}시간 전`,
      likeCount: 10 + Math.floor(Math.random() * 100),
      isLiked: Math.random() > 0.7,
      record: record
    };
  });
};

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>(useMemo(() => GENERATE_DUMMY_DATA(), []));
  const [activePhotoIndices, setActivePhotoIndices] = useState<Record<string, number>>({});
  
  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(post => post.id === id ? { ...post, isLiked: !post.isLiked, likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 } : post));
  };

  const getMatchScore = (name: string) => {
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 70 + (sum % 30); // 70-99 range
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, postId: string) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActivePhotoIndices(prev => ({ ...prev, [postId]: index }));
  };

  return (
    <Layout hideHeader hasTabBar={true}>
      <div className="bg-black min-h-full">
        
        {/* Full Screen Vertical Snap Feed */}
        <div className="snap-y snap-mandatory h-[100dvh] overflow-y-scroll no-scrollbar pb-safe pt-safe">
            {posts.map((post) => {
                const matchScore = getMatchScore(post.author.name);
                const currentPhotoIndex = activePhotoIndices[post.id] || 0;
                
                return (
                    <article key={post.id} className="snap-center h-full w-full relative bg-gray-900 flex-shrink-0 overflow-hidden border-b border-white/5">
                        
                        {/* Horizontal Photo Carousel */}
                        <div 
                            className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                            onScroll={(e) => handleScroll(e, post.id)}
                        >
                            {post.record.photos.map((photo, idx) => (
                                <Link to={`/restaurant/d-1`} key={idx} className="w-full h-full flex-shrink-0 snap-center relative block">
                                    <img src={photo} className="w-full h-full object-cover opacity-90" alt={post.record.title} />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
                                </Link>
                            ))}
                        </div>

                        {/* Photo Indicators */}
                        {post.record.photos.length > 1 && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                {post.record.photos.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                            idx === currentPhotoIndex ? 'bg-white w-3' : 'bg-white/40'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Right Side Actions (Floating) - Redesigned */}
                        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-20">
                            
                            {/* Prominent Scrap Button */}
                            <button className="p-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-primary active:scale-90 transition-transform mb-2 shadow-lg">
                                <Bookmark size={28} className="fill-current" />
                            </button>

                            {/* Smaller Actions */}
                            <div className="flex flex-col items-center gap-1 opacity-90 scale-90">
                                <button onClick={() => toggleLike(post.id)} className="p-2 rounded-full active:scale-75 transition-transform">
                                    <Heart size={30} className={post.isLiked ? "fill-red-500 text-red-500" : "text-white"} strokeWidth={post.isLiked ? 0 : 2} />
                                </button>
                                <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">{post.likeCount}</span>
                            </div>
                            
                            <div className="flex flex-col items-center gap-1 opacity-90 scale-90">
                                <button className="p-2 rounded-full active:scale-75 transition-transform">
                                    <MessageCircle size={28} className="text-white" />
                                </button>
                                <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">24</span>
                            </div>

                            <button className="p-2 rounded-full active:scale-75 transition-transform opacity-90 scale-90">
                                <Share2 size={26} className="text-white" />
                            </button>
                        </div>

                        {/* Bottom Content Overlay */}
                        <div className="absolute bottom-0 left-0 w-full p-5 pb-20 pr-16 z-10 flex flex-col items-start text-left pointer-events-none">
                            
                            {/* Author & Match */}
                            <Link to={`/profile/${post.author.name}`} className="flex items-center gap-2 mb-3 bg-black/40 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 pointer-events-auto active:scale-95 transition-transform">
                                <img src={post.author.avatar} className="w-6 h-6 rounded-full object-cover border border-white/20" alt={post.author.name} />
                                <span className="text-sm font-bold text-white">{post.author.name}</span>
                                <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                <span className="text-xs font-bold text-primary">{matchScore}% Match</span>
                            </Link>

                            {/* Title & Preference */}
                            <div className="flex items-center gap-2 mb-2 w-full">
                                <h2 className="text-2xl font-black text-white leading-tight drop-shadow-lg truncate">{post.record.title}</h2>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    post.record.preference === Preference.GOOD ? 'bg-primary text-white' : 'bg-white/20 text-white'
                                }`}>
                                    {post.record.preference === Preference.GOOD ? 'Delicious' : 'Normal'}
                                </span>
                            </div>

                            {/* Menu & Location */}
                            <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                                <div className="flex items-center gap-1">
                                    <Utensils size={12} />
                                    <span>{post.record.category}</span>
                                </div>
                                <span className="opacity-50">|</span>
                                <div className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    <span>{post.record.location?.address || '서울'}</span>
                                </div>
                            </div>

                            {/* Short Text (Less Important) */}
                            <p className="text-white/70 text-sm line-clamp-2 font-serif leading-relaxed italic pr-4 mb-2">
                                "{post.record.reviewText}"
                            </p>

                            {/* Tags */}
                            <div className="flex gap-2 overflow-hidden w-full mask-linear-fade">
                                {post.record.keywords.slice(0, 3).map(k => (
                                    <span key={k} className="text-[10px] text-white/90 bg-white/10 px-2 py-1 rounded backdrop-blur-sm border border-white/5 whitespace-nowrap">
                                        #{k}
                                    </span>
                                ))}
                            </div>

                        </div>
                    </article>
                );
            })}
        </div>
      </div>
      <BottomTabBar activeTab="feed" />
    </Layout>
  );
};

// Missing Icon Imports shim
function Utensils(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg> }
