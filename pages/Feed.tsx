
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MapPin, Sparkles, Zap, Bookmark, MoreHorizontal, Share2, Music, ChevronRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { FeedPost, Preference } from '../types';
import { MOCK_FEED_POSTS } from '../data/dummyData';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>(MOCK_FEED_POSTS);
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
    <Layout hideHeader hasTabBar={true} scrollable={false}>
      <div className="bg-black min-h-full">
        
        {/* Full Screen Vertical Snap Feed */}
        <div className="snap-y snap-mandatory h-[100dvh] overflow-y-scroll no-scrollbar pb-safe pt-safe">
            {posts.map((post) => {
                const matchScore = getMatchScore(post.author.name);
                const currentPhotoIndex = activePhotoIndices[post.id] || 0;
                
                return (
                    <article key={post.id} className="snap-center h-full w-full relative bg-gray-900 flex-shrink-0 overflow-hidden border-b border-white/5">
                        
                        {/* 1. CONTENT LAYER (Background Image Carousel) -> Links to RecordDetail */}
                        <div className="absolute inset-0">
                            <Link to={`/record/${post.record.id}`} className="block w-full h-full relative z-0">
                                <div 
                                    className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar pointer-events-auto"
                                    onScroll={(e) => handleScroll(e, post.id)}
                                >
                                    {post.record.photos.map((photo, idx) => (
                                        <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative block">
                                            <img src={photo} className="w-full h-full object-cover opacity-90" alt={post.record.title} />
                                            {/* Gradients for readability */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none"></div>
                                        </div>
                                    ))}
                                </div>
                            </Link>
                        </div>

                        {/* Photo Indicators */}
                        {post.record.photos.length > 1 && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
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

                        {/* Right Side Actions (Floating) - Raised for Tab Bar Safety */}
                        <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-30 pointer-events-auto">
                            
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
                        <div className="absolute bottom-0 left-0 w-full p-5 pb-32 pr-16 z-20 flex flex-col items-start text-left pointer-events-none">
                            
                            {/* 2. PROFILE LINK (Top Left of content area) -> Links to UserProfile */}
                            <Link 
                                to={`/profile/${post.author.name}`} 
                                className="flex items-center gap-2 mb-3 bg-black/40 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 pointer-events-auto active:scale-95 transition-transform"
                            >
                                <img src={post.author.avatar} className="w-6 h-6 rounded-full object-cover border border-white/20" alt={post.author.name} />
                                <span className="text-sm font-bold text-white">{post.author.name}</span>
                                <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                <span className="text-xs font-bold text-primary">{matchScore}% Match</span>
                            </Link>

                            {/* 3. POI LINK (Location Badge) -> Links to RestaurantDetail */}
                            <Link 
                                to={`/restaurant/${post.record.id}`} 
                                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 mb-2 pointer-events-auto active:scale-95 transition-all"
                            >
                                <MapPin size={14} className="text-primary" />
                                <span className="text-xs font-bold text-white tracking-wide">{post.record.title}</span>
                                <span className="w-0.5 h-3 bg-white/20"></span>
                                <span className="text-[10px] text-gray-300">{post.record.location?.address || '서울'}</span>
                                <ChevronRight size={12} className="text-white/40" />
                            </Link>

                            {/* 4. CONTENT NOTE LINK -> Links to RecordDetail */}
                            <Link 
                                to={`/record/${post.record.id}`} 
                                className="block w-full pointer-events-auto active:opacity-80 transition-opacity"
                            >
                                {/* Title & Preference */}
                                <div className="flex items-center gap-2 mb-1 w-full">
                                    <h2 className="text-2xl font-black text-white leading-tight drop-shadow-lg truncate">{post.record.menu}</h2>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                        post.record.preference === Preference.GOOD ? 'bg-primary text-white' : 'bg-white/20 text-white'
                                    }`}>
                                        {post.record.preference === Preference.GOOD ? 'Delicious' : 'Normal'}
                                    </span>
                                </div>

                                {/* Short Text */}
                                <p className="text-white/80 text-sm line-clamp-2 font-serif leading-relaxed italic pr-4 mb-2">
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
                            </Link>

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
