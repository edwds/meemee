
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Trophy, Settings, Sparkles, Plus, List, ChevronRight, Crown, ArrowLeft, Folder, Grid, Hash, Share2, MapPin, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { ReviewRecord, Preference } from '../types';
import { getEarnedBadges, calculateLevel, calculateGourmetMBTI } from '../utils/gamification';

interface HomeProps {
  records: ReviewRecord[];
}

// Helper type for Collection
interface RecordCollection {
  id: string;
  title: string;
  subtitle: string;
  type: 'ranking' | 'category' | 'tag' | 'location';
  items: ReviewRecord[];
  coverImage?: string;
}

export const Home: React.FC<HomeProps> = ({ records }) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'lists'>('timeline');
  const [selectedCollection, setSelectedCollection] = useState<RecordCollection | null>(null);

  // Gamification Data
  const earnedBadges = useMemo(() => getEarnedBadges(records), [records]);
  const { level } = calculateLevel(records.length);
  const mbti = useMemo(() => calculateGourmetMBTI(records), [records]);
  
  // Calculate Top Keywords
  const topKeywords = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
        r.keywords.forEach(k => {
            counts[k] = (counts[k] || 0) + 1;
        });
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key]) => key);
  }, [records]);

  // --- Auto-Generate Collections ---
  const collections = useMemo(() => {
    const list: RecordCollection[] = [];

    // 1. Top Ranking Collection
    const rankedRecords = records
      .filter(r => r.preference === Preference.GOOD && r.rank)
      .sort((a, b) => (a.rank || 999) - (b.rank || 999))
      .slice(0, 20);

    if (rankedRecords.length > 0) {
      list.push({
        id: 'top-ranking',
        title: '🏆 명예의 전당',
        subtitle: 'TOP 20 맛집',
        type: 'ranking',
        items: rankedRecords,
        coverImage: rankedRecords[0].representativePhoto
      });
    }

    // 2. Category Collections
    const categories = Array.from(new Set(records.map(r => r.category).filter(Boolean)));
    categories.forEach(cat => {
      const catItems = records.filter(r => r.category === cat);
      // Add icons based on category name (simple heuristic)
      let icon = '🍽️';
      if (cat.includes('카페') || cat.includes('커피')) icon = '☕';
      else if (cat.includes('한식')) icon = '🍚';
      else if (cat.includes('일식') || cat.includes('스시')) icon = '🍣';
      else if (cat.includes('양식') || cat.includes('파스타')) icon = '🍝';
      else if (cat.includes('중식')) icon = '🥟';
      else if (cat.includes('버거')) icon = '🍔';
      else if (cat.includes('술') || cat.includes('바')) icon = '🍷';

      list.push({
        id: `cat-${cat}`,
        title: `${icon} ${cat}`,
        subtitle: `${catItems.length}개의 기록`,
        type: 'category',
        items: catItems,
        coverImage: catItems[0].representativePhoto
      });
    });

    // 3. Tag Collections (Only if > 2 items)
    const allTags = Array.from(new Set(records.flatMap(r => r.keywords)));
    allTags.forEach(tag => {
        const tagItems = records.filter(r => r.keywords.includes(tag));
        if (tagItems.length >= 2) {
            list.push({
                id: `tag-${tag}`,
                title: `#${tag}`,
                subtitle: `${tagItems.length}개의 기록`,
                type: 'tag',
                items: tagItems,
                coverImage: tagItems[0].representativePhoto
            });
        }
    });

    // Sort collections: Ranking first, then by item count
    return list.sort((a, b) => {
        if (a.type === 'ranking') return -1;
        if (b.type === 'ranking') return 1;
        return b.items.length - a.items.length;
    });
  }, [records]);

  const formatDate = (dateString: string, timestamp: number) => {
    if (dateString) {
        const [y, m, d] = dateString.split('-');
        return `${parseInt(m)}월 ${parseInt(d)}일`;
    }
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle back from list view
  const handleBackToLists = () => {
      setSelectedCollection(null);
  };

  const handleShareCollection = () => {
      if (selectedCollection) {
          if (navigator.share) {
              navigator.share({
                  title: `meemee - ${selectedCollection.title}`,
                  text: `${selectedCollection.subtitle} 리스트를 공유합니다.`,
                  url: window.location.href
              }).catch(() => {});
          } else {
              alert("리스트 링크가 복사되었습니다!");
          }
      }
  };

  const renderTasteRow = (label: string, value: number, colorClass: string) => (
    <div className="mb-3">
        <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-bold text-gray-400">{label}</span>
            <span className="text-[10px] font-bold text-secondary">{value.toFixed(1)}</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} 
                style={{ width: `${(value / 5) * 100}%` }} 
            />
        </div>
    </div>
  );

  return (
    <Layout 
      title="meemee" 
      hasTabBar={true}
      floatingAction={
        !selectedCollection && (
            <Link 
                to="/create" 
                className="absolute bottom-24 right-5 w-14 h-14 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg shadow-gray-300 hover:scale-105 active:scale-95 transition-transform z-50 pointer-events-auto"
                aria-label="기록하기"
            >
                <Plus size={28} strokeWidth={2.5} />
            </Link>
        )
      }
    >
      <div className="pb-4 relative min-h-full">
        
        {/* Profile Section (Only visible when not in drill-down view) */}
        {!selectedCollection && (
            <Link to="/achievement" className="block active:scale-[0.99] transition-transform">
                <section className="bg-white pb-6 pt-4 rounded-b-[2rem] shadow-sm border-b border-gray-100 mb-6 relative px-5">
                    
                    {/* Unified Gourmet ID Card */}
                    <div className="w-full bg-gradient-to-br from-[#2E2E2E] to-[#1a1a1a] rounded-[1.5rem] p-5 text-white shadow-xl relative overflow-hidden mb-6">
                        {/* Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl translate-y-5 -translate-x-5"></div>
                        
                        {/* Header: Profile Info */}
                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-primary to-gray-600 shadow-lg">
                                    <img 
                                    src="https://images.unsplash.com/photo-1563237023-b1e970526dcb?auto=format&fit=crop&w=400&q=80" 
                                    alt="Edwards" 
                                    className="w-full h-full object-cover rounded-full border border-gray-900"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <h2 className="text-base font-bold leading-none">edwards</h2>
                                        <ChevronRight size={14} className="text-gray-400" />
                                    </div>
                                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-bold border border-white/10 text-gray-300 inline-block">
                                        Lv.{level} Gourmet Collector
                                    </span>
                                </div>
                            </div>
                            
                            {/* Settings Button (Inside Card) */}
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Navigate to settings
                                }}
                                className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full backdrop-blur-sm"
                            >
                                <Settings size={16} />
                            </button>
                        </div>

                        {/* Content: MBTI */}
                        {mbti ? (
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-2 mb-1.5">
                                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                                        {mbti.code}
                                    </h1>
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                        {mbti.title}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 leading-relaxed mb-3 font-medium border-l-2 border-white/10 pl-3">
                                    "{mbti.nuance}"
                                </p>

                                {/* Categories Tags */}
                                {mbti.favoriteCategories.length > 0 && (
                                    <div className="flex gap-1.5 mt-1">
                                        {mbti.favoriteCategories.map(cat => (
                                            <span key={cat} className="text-[9px] bg-black/30 px-2 py-1 rounded-lg border border-white/5 text-gray-300">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                                <div className="py-4 text-center text-gray-500 text-xs">
                                    기록을 남기고 미식 유형을 분석해보세요
                                </div>
                        )}
                    </div>

                    {/* Taste DNA Stats */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-orange-50 rounded-lg text-primary">
                                <TrendingUp size={16} />
                            </div>
                            <h3 className="font-bold text-secondary text-sm">입맛 DNA</h3>
                        </div>

                        {mbti ? (
                             <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                {renderTasteRow('맵기 (Kick)', mbti.scores.spiciness, 'bg-red-400')}
                                {renderTasteRow('단맛 (Main)', mbti.scores.sweetness, 'bg-pink-400')}
                                {renderTasteRow('짠맛 (Main)', mbti.scores.saltiness, 'bg-blue-400')}
                                {renderTasteRow('풍미 (Body)', mbti.scores.richness, 'bg-orange-400')}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-xs text-gray-400">
                                데이터가 충분하지 않습니다.
                            </div>
                        )}

                        {/* Top Keywords */}
                        {topKeywords.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Hash size={14} className="text-gray-400" />
                                    <span className="text-xs font-bold text-gray-400">자주 쓰는 표현</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {topKeywords.map(k => (
                                        <span key={k} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold border border-gray-200">
                                            #{k}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Earned Badges Row */}
                    {earnedBadges.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 mb-2 pl-1">획득한 뱃지</h3>
                        <div className="w-full overflow-x-auto no-scrollbar flex gap-2 pb-2">
                            {earnedBadges.map(badge => (
                            <div key={badge.id} className={`flex-shrink-0 flex items-center px-3 py-1.5 rounded-lg border border-white shadow-sm ${badge.color}`}>
                                <span className="mr-1.5">{badge.icon}</span>
                                <span className="text-[10px] font-bold">{badge.label}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                    )}
                </section>
            </Link>
        )}

        {/* View Toggle (Only visible when not in drill-down view) */}
        {!selectedCollection && (
            <div className="px-6 mb-4">
                <div className="bg-gray-100 p-1 rounded-xl flex font-bold text-xs">
                    <button 
                        onClick={() => setViewMode('timeline')}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            viewMode === 'timeline' ? 'bg-white text-secondary shadow-sm' : 'text-gray-400'
                        }`}
                    >
                        <List size={14} />
                        전체 기록
                    </button>
                    <button 
                        onClick={() => setViewMode('lists')}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            viewMode === 'lists' ? 'bg-white text-secondary shadow-sm' : 'text-gray-400'
                        }`}
                    >
                        <Grid size={14} />
                        내 리스트
                    </button>
                </div>
            </div>
        )}

        {/* Content Area */}
        <section className="px-4 mb-4 min-h-[300px]">
          {selectedCollection ? (
            // --- DRILL DOWN VIEW (Inside a list) ---
            <div className="animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <button onClick={handleBackToLists} className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors">
                            <ArrowLeft size={22} className="text-secondary" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-secondary">{selectedCollection.title}</h2>
                            <p className="text-xs text-gray-500">{selectedCollection.subtitle}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleShareCollection}
                        className="p-2.5 bg-orange-50 text-primary rounded-full hover:bg-orange-100 active:scale-95 transition-all shadow-sm border border-orange-100"
                    >
                        <Share2 size={18} />
                    </button>
                </div>

                {/* MAP VIEW (With Real Coordinates support) */}
                <div className="w-full aspect-[16/9] bg-[#f0f4f8] rounded-2xl mb-6 relative overflow-hidden border border-gray-200 shadow-inner group">
                    {/* Grid pattern to simulate map */}
                    <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}></div>
                    
                    {/* Map decorations */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[9px] text-gray-500 font-bold border border-gray-100 shadow-sm z-10">
                         MAP VIEW
                    </div>

                    {/* Pins Logic */}
                    {(() => {
                         // Calculate bounding box if locations exist
                         const points = selectedCollection.items.filter(i => i.location?.lat && i.location?.lng);
                         let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
                         
                         if (points.length > 0) {
                             points.forEach(p => {
                                 if (p.location) {
                                    minLat = Math.min(minLat, p.location.lat);
                                    maxLat = Math.max(maxLat, p.location.lat);
                                    minLng = Math.min(minLng, p.location.lng);
                                    maxLng = Math.max(maxLng, p.location.lng);
                                 }
                             });
                         }

                         // Padding factor
                         const latPadding = (maxLat - minLat) * 0.2 || 0.002;
                         const lngPadding = (maxLng - minLng) * 0.2 || 0.002;

                         return selectedCollection.items.map((item) => {
                             let top, left;

                             if (item.location && points.length > 0) {
                                 // Map lat/lng to % position relative to bounding box
                                 const latRange = (maxLat + latPadding) - (minLat - latPadding);
                                 const lngRange = (maxLng + lngPadding) - (minLng - lngPadding);
                                 
                                 // Latitude is inverted (Top is +)
                                 top = 100 - ((item.location.lat - (minLat - latPadding)) / latRange * 100);
                                 left = (item.location.lng - (minLng - lngPadding)) / lngRange * 100;
                             } else {
                                 // Fallback to Deterministic Random
                                 const pseudoRandom = (seed: string) => {
                                    let hash = 0;
                                    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
                                    return (Math.abs(hash) % 70) + 15; 
                                 };
                                 top = pseudoRandom(item.id + 'lat');
                                 left = pseudoRandom(item.id + 'lng');
                             }

                             return (
                                 <Link 
                                    key={item.id} 
                                    to={`/record/${item.id}`}
                                    className="absolute transform -translate-x-1/2 -translate-y-full flex flex-col items-center transition-all hover:z-50" 
                                    style={{ top: `${top}%`, left: `${left}%` }}
                                 >
                                    {/* Tooltip */}
                                    <div className="bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-lg mb-1 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg relative pointer-events-none">
                                        {item.title}
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-secondary"></div>
                                    </div>
                                    
                                    {/* Pin */}
                                    <div className="relative hover:scale-110 transition-transform">
                                        <MapPin className="text-primary drop-shadow-md" size={28} fill="#fff" strokeWidth={2.5} />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-secondary rounded-full"></div>
                                    </div>
                                    
                                    {/* Shadow */}
                                    <div className="w-4 h-1.5 bg-black/20 rounded-full blur-[2px] mt-[-4px]"></div>
                                 </Link>
                             )
                        });
                    })()}
                </div>

                {selectedCollection.type === 'ranking' ? (
                    // Ranking Style List
                    <div className="space-y-3">
                         {selectedCollection.items.map((record, index) => {
                            const isGold = index === 0;
                            const isSilver = index === 1;
                            const isBronze = index === 2;
                            
                            return (
                                <Link key={record.id} to={`/record/${record.id}`} className="block active:scale-[0.98] transition-transform">
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
                                        {/* Rank Number */}
                                        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full font-black text-lg mr-4 relative z-10 ${
                                            isGold ? 'bg-yellow-100 text-yellow-600' :
                                            isSilver ? 'bg-gray-100 text-gray-600' :
                                            isBronze ? 'bg-orange-50 text-orange-700' :
                                            'bg-white text-gray-300 border border-gray-100'
                                        }`}>
                                            {record.rank || index + 1}
                                            {isGold && <Crown size={14} className="absolute -top-2 text-yellow-500 transform rotate-12" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-secondary text-base truncate">{record.title}</h4>
                                            <p className="text-xs text-gray-500 truncate">{record.menu}</p>
                                        </div>

                                        <div className="w-12 h-12 rounded-lg overflow-hidden ml-4 flex-shrink-0 bg-gray-100">
                                            <img src={record.representativePhoto} className="w-full h-full object-cover" alt="" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    // Standard Grid List
                    <div className="grid grid-cols-2 gap-4">
                         {selectedCollection.items.map((record) => (
                             <Link key={record.id} to={`/record/${record.id}`} className="block active:scale-[0.98] transition-transform">
                                 <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                     <div className="aspect-square bg-gray-100">
                                         <img src={record.representativePhoto} className="w-full h-full object-cover" alt={record.title} />
                                     </div>
                                     <div className="p-3">
                                         <h4 className="font-bold text-secondary text-sm truncate mb-1">{record.title}</h4>
                                         <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400 truncate flex-1 mr-2">{record.menu.split(',')[0]}</span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                                record.preference === '좋아요' ? 'bg-orange-50 text-primary' : 'bg-gray-100 text-gray-500'
                                            }`}>{record.preference}</span>
                                         </div>
                                     </div>
                                 </div>
                             </Link>
                         ))}
                    </div>
                )}
            </div>
          ) : viewMode === 'timeline' ? (
            // --- TIMELINE VIEW (Premium Gourmet Log Card Style) ---
            records.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 mx-2">
                    <Utensils className="mx-auto mb-3 opacity-40" size={32} />
                    <p className="text-sm font-medium">아직 기록된 미식이 없습니다.<br/>첫 번째 맛을 기록해보세요!</p>
                </div>
            ) : (
                <div className="space-y-6">
                {records.map((record) => (
                    <Link key={record.id} to={`/record/${record.id}`} className="block group active:scale-[0.99] transition-transform">
                    <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        {/* Card Header: Full width Image */}
                        <div className="h-48 relative">
                            <img 
                            src={record.representativePhoto} 
                            alt={record.title} 
                            className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            
                            {/* Overlay Content */}
                            <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                                <div className="flex items-center gap-2 text-[10px] opacity-90 mb-1">
                                    {record.category && (
                                        <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">{record.category}</span>
                                    )}
                                    <span className="flex items-center"><MapPin size={10} className="mr-1"/> {record.location?.address || record.title}</span>
                                </div>
                                <h4 className="font-bold text-xl leading-none shadow-sm">{record.title}</h4>
                            </div>

                            {/* Preference Badge */}
                            <span className={`absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full font-bold shadow-sm backdrop-blur-md ${
                                record.preference === Preference.GOOD ? 'bg-white/90 text-primary' : 
                                record.preference === Preference.NORMAL ? 'bg-gray-900/50 text-white' : 'bg-gray-900/50 text-gray-300'
                            }`}>
                                {record.preference}
                            </span>

                            {/* Rank Badge */}
                            {record.rank && (
                                <div className="absolute top-3 left-3 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center border border-yellow-300">
                                    <Trophy size={10} className="mr-1" />
                                    #{record.rank}
                                </div>
                            )}
                        </div>
                        
                        {/* Card Body */}
                        <div className="p-4">
                            {/* Tasting Note */}
                            <div className="flex items-start gap-3 mb-4">
                                <Sparkles size={16} className="text-primary flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-600 font-serif leading-relaxed italic line-clamp-2">
                                    "{record.aiGeneratedText}"
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500">{record.menu}</span>
                                    {record.keywords && record.keywords.length > 0 && (
                                        <span className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100">#{record.keywords[0]}</span>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-300">
                                {formatDate(record.visitDate, record.createdAt)}
                                </span>
                            </div>
                        </div>
                    </article>
                    </Link>
                ))}
                </div>
            )
          ) : (
            // --- LISTS VIEW (Collections Grid) ---
            collections.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                    <Folder className="mx-auto mb-3 text-gray-200" size={40} />
                    <p className="text-sm font-bold text-gray-400">생성된 리스트가 없어요</p>
                    <p className="text-xs text-gray-400 mt-1">기록이 쌓이면 자동으로 리스트가 만들어집니다!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {collections.map((collection) => (
                        <button 
                            key={collection.id} 
                            onClick={() => setSelectedCollection(collection)}
                            className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-transform group flex flex-col h-40 relative overflow-hidden"
                        >
                            {/* Background Image (Blurred) */}
                            <div className="absolute inset-0">
                                <img src={collection.coverImage} className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-xl mb-2">
                                    {collection.type === 'ranking' ? <Trophy size={20} className="text-yellow-500" /> : 
                                     collection.type === 'tag' ? <Hash size={18} className="text-primary" /> :
                                     collection.title.split(' ')[0]} {/* Emoji Icon */}
                                </div>
                                <div>
                                    <h3 className="font-bold text-secondary text-base leading-tight mb-1">
                                        {collection.type === 'ranking' ? '명예의 전당' : collection.title.split(' ').slice(1).join(' ')}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">{collection.subtitle}</p>
                                </div>
                            </div>
                            
                            {/* Decoration */}
                            {collection.type === 'ranking' && (
                                <Crown className="absolute top-3 right-3 text-yellow-400/30 -rotate-12" size={40} />
                            )}
                        </button>
                    ))}
                </div>
            )
          )}
        </section>
        
        <BottomTabBar activeTab="home" />
      </div>
    </Layout>
  );
};
