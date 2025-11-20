
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Trophy, Settings, Sparkles, Plus, List, ChevronRight, Crown, ArrowLeft, Folder, Grid, Hash, Share2, MapPin } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { ReviewRecord, Preference } from '../types';
import { analyzeUserTaste } from '../services/geminiService';
import { getEarnedBadges, calculateLevel } from '../utils/gamification';

interface HomeProps {
  records: ReviewRecord[];
}

const CACHE_KEY_IDENTITY = 'meemee_taste_identity';
const CACHE_KEY_COUNT = 'meemee_record_count_at_analysis';

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
  const [tasteIdentity, setTasteIdentity] = useState<string>('나만의 미식 취향을 찾는 중...');
  const [viewMode, setViewMode] = useState<'timeline' | 'lists'>('timeline');
  const [selectedCollection, setSelectedCollection] = useState<RecordCollection | null>(null);

  useEffect(() => {
    const loadIdentity = async () => {
      const cachedIdentity = localStorage.getItem(CACHE_KEY_IDENTITY);
      const lastCount = localStorage.getItem(CACHE_KEY_COUNT);
      const currentCount = records.length.toString();

      if (cachedIdentity && lastCount === currentCount) {
        setTasteIdentity(cachedIdentity);
        return;
      }

      if (records.length > 0) {
        if (!cachedIdentity) {
             setTasteIdentity("미식 데이터 분석 중...");
        }
        
        const identity = await analyzeUserTaste(records);
        setTasteIdentity(identity);
        
        localStorage.setItem(CACHE_KEY_IDENTITY, identity);
        localStorage.setItem(CACHE_KEY_COUNT, currentCount);
      } else {
        setTasteIdentity("첫 번째 미식을 기록해보세요!");
      }
    };

    loadIdentity();
  }, [records]);

  // Gamification Data
  const earnedBadges = useMemo(() => getEarnedBadges(records), [records]);
  const { level } = calculateLevel(records.length);
  
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

  return (
    <Layout title="meemee" hasTabBar={true}>
      <div className="pb-4 relative min-h-full">
        
        {/* Profile Section (Only visible when not in drill-down view) */}
        {!selectedCollection && (
            <Link to="/achievement" className="block active:opacity-90 transition-opacity">
                <section className="bg-white pb-6 pt-6 rounded-b-[2rem] shadow-sm border-b border-gray-100 mb-6 relative">
                    <div className="flex flex-col items-center">
                        {/* Profile Image */}
                        <div className="relative mb-3 group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md relative z-10">
                                <img 
                                src="https://images.unsplash.com/photo-1563237023-b1e970526dcb?auto=format&fit=crop&w=400&q=80" 
                                alt="Edwards" 
                                className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 border border-white">
                                Lv.{level}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-1 mt-1">
                            <h2 className="text-xl font-bold text-secondary">edwards</h2>
                            <ChevronRight size={18} className="text-gray-400" />
                        </div>
                        
                        {/* Taste MBTI Badge */}
                        <div className="mt-2 px-4 py-1 bg-orange-50 rounded-full border border-orange-100 flex items-center animate-fade-in">
                            <Sparkles size={12} className="text-primary mr-1.5" />
                            <p className="text-xs text-primary font-bold tracking-tight">{tasteIdentity}</p>
                        </div>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6 w-full px-8">
                            <div className="text-center">
                                <span className="block font-bold text-lg text-secondary">{records.length}</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Records</span>
                            </div>
                            <div className="text-center border-l border-r border-gray-100">
                                <span className="block font-bold text-lg text-secondary">
                                {records.filter(r => r.preference === '좋아요').length}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Loved</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-lg text-secondary">
                                {new Set(records.map(r => r.menu.split(',')[0].trim())).size}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Menus</span>
                            </div>
                        </div>

                        {/* Earned Badges Row */}
                        {earnedBadges.length > 0 && (
                        <div className="mt-6 w-full overflow-x-auto no-scrollbar px-6 flex gap-2 pb-2">
                            {earnedBadges.map(badge => (
                            <div key={badge.id} className={`flex-shrink-0 flex items-center px-3 py-1.5 rounded-lg border border-white shadow-sm ${badge.color}`}>
                                <span className="mr-1.5">{badge.icon}</span>
                                <span className="text-[10px] font-bold">{badge.label}</span>
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                    
                    {/* Settings Icon */}
                    <div className="absolute top-4 right-4">
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                            }}
                            className="p-2 text-gray-300 hover:text-gray-500"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
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
                    <button className="p-2.5 bg-orange-50 text-primary rounded-full hover:bg-orange-100 active:scale-95 transition-all shadow-sm border border-orange-100">
                        <Share2 size={18} />
                    </button>
                </div>

                {/* MOCK MAP VIEW */}
                <div className="w-full aspect-[16/9] bg-[#f0f4f8] rounded-2xl mb-6 relative overflow-hidden border border-gray-200 shadow-inner">
                    {/* Grid pattern to simulate map */}
                    <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}></div>
                    
                    {/* Map decorations */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[9px] text-gray-500 font-bold border border-gray-100 shadow-sm">
                         MAP VIEW
                    </div>

                    {/* Pins */}
                    {selectedCollection.items.map((item) => {
                         // Generate deterministic random position based on ID to keep pins static
                         const pseudoRandom = (seed: string) => {
                            let hash = 0;
                            for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
                            return (Math.abs(hash) % 70) + 15; // Keep within 15% - 85% to avoid edge clipping
                         };
                         const top = pseudoRandom(item.id + 'lat');
                         const left = pseudoRandom(item.id + 'lng');

                         return (
                             <Link 
                                key={item.id} 
                                to={`/record/${item.id}`}
                                className="absolute transform -translate-x-1/2 -translate-y-full flex flex-col items-center group hover:z-50 transition-all" 
                                style={{ top: `${top}%`, left: `${left}%` }}
                             >
                                {/* Tooltip */}
                                <div className="bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-lg mb-1 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all whitespace-nowrap shadow-lg relative">
                                    {item.title}
                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-secondary"></div>
                                </div>
                                
                                {/* Pin */}
                                <div className="relative">
                                    <MapPin className="text-primary drop-shadow-md transition-transform group-hover:scale-110 group-active:scale-95" size={28} fill="#fff" strokeWidth={2.5} />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-secondary rounded-full"></div>
                                </div>
                                
                                {/* Shadow */}
                                <div className="w-4 h-1.5 bg-black/20 rounded-full blur-[2px] mt-[-4px]"></div>
                             </Link>
                         )
                    })}
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
            // --- TIMELINE VIEW ---
            records.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 mx-2">
                    <Utensils className="mx-auto mb-3 opacity-40" size={32} />
                    <p className="text-sm font-medium">아직 기록된 미식이 없습니다.<br/>첫 번째 맛을 기록해보세요!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                {records.map((record) => (
                    <Link key={record.id} to={`/record/${record.id}`} className="block group active:scale-[0.99] transition-transform">
                    <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex h-32 relative">
                        {/* Rank Badge */}
                        {record.rank && (
                        <div className="absolute top-0 left-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10 flex items-center shadow-sm">
                            <Trophy size={8} className="mr-1" />
                            #{record.rank}
                        </div>
                        )}

                        {/* Image */}
                        <div className="w-32 h-32 flex-shrink-0 bg-gray-100">
                        {record.representativePhoto ? (
                            <img 
                            src={record.representativePhoto} 
                            alt={record.title} 
                            className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Img
                            </div>
                        )}
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-secondary truncate pr-2 text-base">{record.title}</h4>
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-1">{record.menu}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block ${
                                record.preference === '좋아요' ? 'bg-orange-50 text-primary' : 
                                record.preference === '보통' ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                            }`}>
                                {record.preference}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1 overflow-hidden">
                            {record.keywords?.slice(0, 2).map(k => (
                                    <span key={k} className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100 truncate max-w-[60px]">#{k}</span>
                                ))}
                            </div>
                            <span className="text-[10px] text-gray-300 flex-shrink-0 ml-2">
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

        {/* Floating Action Button for Create Record (Hide in drill-down) */}
        {!selectedCollection && (
            <Link 
                to="/create" 
                className="fixed bottom-24 right-5 w-14 h-14 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg shadow-gray-300 hover:scale-105 active:scale-95 transition-transform z-50"
                aria-label="기록하기"
            >
                <Plus size={28} strokeWidth={2.5} />
            </Link>
        )}

        <BottomTabBar activeTab="home" />
      </div>
    </Layout>
  );
};
