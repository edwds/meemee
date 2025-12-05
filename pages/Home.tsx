
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Settings, Plus, ChevronRight, Share2, MapPin, Utensils, LayoutGrid, AlignJustify, Hash, Grid, List } from 'lucide-react';
import { Layout } from '../components/Layout';
import { BottomTabBar } from '../components/BottomTabBar';
import { ReviewRecord, Preference } from '../types';
import { getEarnedBadges, calculateLevel, calculateGourmetMBTI, BADGES } from '../utils/gamification';

interface HomeProps {
  records: ReviewRecord[];
}

interface RecordCollection {
  id: string;
  title: string;
  subtitle: string;
  type: 'ranking' | 'category' | 'tag' | 'location';
  items: ReviewRecord[];
  coverImage?: string;
}

export const Home: React.FC<HomeProps> = ({ records }) => {
  const [viewMode, setViewMode] = useState<'album' | 'lists'>('album');
  const [selectedCollection, setSelectedCollection] = useState<RecordCollection | null>(null);
  
  const earnedBadges = useMemo(() => getEarnedBadges(records), [records]);
  const { level } = calculateLevel(records.length);
  const mbti = useMemo(() => calculateGourmetMBTI(records), [records]);
  
  const collections = useMemo(() => {
    const list: RecordCollection[] = [];
    const rankedRecords = records
      .filter(r => r.preference === Preference.GOOD && r.rank)
      .sort((a, b) => (a.rank || 999) - (b.rank || 999))
      .slice(0, 20);

    if (rankedRecords.length > 0) {
      list.push({
        id: 'top-ranking',
        title: 'Hall of Fame',
        subtitle: 'TOP 20 맛집',
        type: 'ranking',
        items: rankedRecords,
        coverImage: rankedRecords[0].representativePhoto
      });
    }

    const categories = Array.from(new Set(records.map(r => r.category).filter((c): c is string => !!c)));
    categories.forEach((cat: string) => {
      const catItems = records.filter(r => r.category === cat);
      list.push({
        id: `cat-${cat}`,
        title: cat,
        subtitle: `${catItems.length} Records`,
        type: 'category',
        items: catItems,
        coverImage: catItems[0].representativePhoto
      });
    });

    return list.sort((a, b) => {
        if (a.type === 'ranking') return -1;
        if (b.type === 'ranking') return 1;
        return b.items.length - a.items.length;
    });
  }, [records]);

  const handleShareCollection = () => {
      if (selectedCollection) {
          alert("리스트 링크가 복사되었습니다!");
      }
  };

  return (
    <Layout 
      title="meemee" 
      hasTabBar={true}
      hideHeader={true}
      backgroundColor="bg-black"
      floatingAction={
        !selectedCollection && (
            <Link 
                to="/create" 
                className="absolute bottom-32 right-5 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg shadow-gray-900/50 hover:scale-105 active:scale-95 transition-transform z-50 pointer-events-auto"
            >
                <Plus size={28} strokeWidth={2.5} />
            </Link>
        )
      }
    >
      <div className="relative min-h-full pb-32 bg-black text-white">
        
        {/* Floating Premium Profile Card */}
        {!selectedCollection && (
            <div className="mx-4 mt-6 mb-8 bg-[#1A1A1A] rounded-[2.5rem] p-6 shadow-2xl border border-white/5 relative overflow-hidden z-10">
                {/* Background Deco */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <Link to="/achievement" className="group flex items-center gap-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-primary to-gray-800 group-active:scale-95 transition-transform shadow-xl">
                                    <img 
                                    src="https://images.unsplash.com/photo-1563237023-b1e970526dcb?auto=format&fit=crop&w=400&q=80" 
                                    alt="Edwards" 
                                    className="w-full h-full object-cover rounded-full border-4 border-[#1A1A1A]"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white text-black text-xs font-black px-2 py-0.5 rounded-lg border-2 border-[#1A1A1A] shadow-lg">
                                    Lv.{level}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black leading-none tracking-tight mb-2 group-active:text-gray-300 transition-colors">edwards</h2>
                                {mbti ? (
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-primary font-black text-xl leading-none">{mbti.code}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded">{mbti.title}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">Start your journey.</p>
                                )}
                            </div>
                        </Link>
                        
                        {/* Minimalist Top Actions */}
                        <div className="flex flex-col items-end gap-3">
                            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                                <Settings size={16} strokeWidth={2} />
                            </button>
                            
                            {/* Minimalist View Toggle */}
                            <div className="flex bg-black/40 rounded-lg p-1 backdrop-blur-md border border-white/5">
                                <button 
                                    onClick={() => setViewMode('album')} 
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'album' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
                                >
                                    <Grid size={14} strokeWidth={2.5} />
                                </button>
                                <button 
                                    onClick={() => setViewMode('lists')} 
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'lists' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
                                >
                                    <List size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Stats Row */}
                    <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white leading-none">{records.length}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Logs</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white leading-none">{earnedBadges.length}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Badges</span>
                        </div>
                        {/* Nuance Text */}
                        {mbti && (
                            <div className="flex-1 text-right">
                                <p className="text-[10px] text-gray-500 font-medium italic">"{mbti.nuance}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Content Section */}
        <section className="px-1 min-h-[500px]">
          {selectedCollection ? (
            // Drill-down Collection View
            <div className="animate-fade-in-up px-3 pt-4">
                 {/* Header */}
                 <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setSelectedCollection(null)} className="flex items-center text-white/80 hover:text-white">
                        <ChevronRight size={24} className="rotate-180 mr-1" />
                        <span className="font-bold text-lg">{selectedCollection.title}</span>
                    </button>
                    <button onClick={handleShareCollection}>
                        <Share2 size={20} className="text-white/60 hover:text-white" />
                    </button>
                </div>

                {/* Map Visualization */}
                <div className="mb-6 w-full h-56 bg-[#1A1A1A] rounded-3xl relative overflow-hidden border border-white/5 shadow-inner">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    {(() => {
                        const validLocs = selectedCollection.items.filter(r => r.location);
                        if (validLocs.length === 0) return <div className="flex items-center justify-center h-full text-gray-600 text-xs">No Location Data</div>;
                        
                        // Simple normalization for relative plotting
                        const lats = validLocs.map(r => r.location!.lat);
                        const lngs = validLocs.map(r => r.location!.lng);
                        const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
                        const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs);
                        
                        return validLocs.map(r => {
                            const latRange = maxLat - minLat || 0.01;
                            const lngRange = maxLng - minLng || 0.01;
                            // Invert Lat for top positioning (higher lat = lower top%)
                            const top = 90 - ((r.location!.lat - minLat) / latRange) * 80;
                            const left = 10 + ((r.location!.lng - minLng) / lngRange) * 80;

                            return (
                                <Link to={`/record/${r.id}`} key={r.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10 hover:z-20" style={{ top: `${top}%`, left: `${left}%` }}>
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] ring-4 ring-black/20"></div>
                                        <div className="absolute bottom-4 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none">
                                            {r.title}
                                        </div>
                                    </div>
                                </Link>
                            );
                        });
                    })()}
                </div>
                
                {/* List Items */}
                <div className="space-y-4">
                    {selectedCollection.items.map((record) => (
                        <Link key={record.id} to={`/record/${record.id}`} className="flex items-center gap-4 group bg-[#1A1A1A] p-3 rounded-2xl active:scale-[0.98] transition-transform border border-white/5">
                             <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                                <img src={record.representativePhoto} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white text-base truncate mb-0.5">{record.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>{record.category}</span>
                                    <span className="w-0.5 h-0.5 bg-gray-500 rounded-full"></span>
                                    <span>{record.menu}</span>
                                </div>
                             </div>
                             <div className="text-gray-600 pr-2">
                                <ChevronRight size={18} />
                             </div>
                        </Link>
                    ))}
                </div>
            </div>
          ) : viewMode === 'album' ? (
            // ALBUM GRID VIEW (Magazine Style)
            <div className="animate-fade-in">
                {!selectedCollection && records.length > 0 && (
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-4 mt-2">My Archive</h3>
                )}
                
                {records.length === 0 ? (
                    <div className="text-center py-32 text-gray-700">
                        <Utensils className="mx-auto mb-4 opacity-30" size={48} />
                        <p className="text-sm">Start your gourmet journey</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-6 px-3 pb-20">
                        {records.map((record) => (
                            <Link key={record.id} to={`/record/${record.id}`} className="block group active:scale-[0.98] transition-transform">
                                <article className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#1A1A1A] shadow-lg mb-2">
                                    <img src={record.representativePhoto} alt={record.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                    
                                    {/* Minimalist Badge Overlay */}
                                    {record.rank && (
                                        <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full">
                                            <span className="text-[10px] font-black text-yellow-400">#{record.rank}</span>
                                        </div>
                                    )}
                                </article>
                                {/* Magazine Style Caption Below Image */}
                                <div className="px-2">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                            {record.keywords[0] || 'Gourmet'}
                                        </span>
                                        <span className="text-[10px] text-gray-600 font-medium">{record.visitDate.slice(5).replace('-','.')}</span>
                                    </div>
                                    <h4 className="font-bold text-base text-white leading-tight line-clamp-1 group-hover:text-gray-300 transition-colors">
                                        {record.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 font-medium">{record.menu}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
          ) : (
            // COLLECTIONS GRID (Dark Cards)
            <div className="grid grid-cols-2 gap-3 pb-20 px-3 pt-2 animate-fade-in">
                {collections.map((collection) => (
                    <button key={collection.id} onClick={() => setSelectedCollection(collection)} className="aspect-square bg-[#1A1A1A] rounded-[2rem] p-6 text-left active:scale-[0.98] transition-transform group relative overflow-hidden border border-white/5 shadow-lg">
                        <img src={collection.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700 mix-blend-overlay" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                                {collection.type === 'ranking' ? <Trophy size={18} className="text-yellow-400" /> : <Hash size={18} className="text-white" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl leading-none mb-1">{collection.title}</h3>
                                <p className="text-xs text-gray-400 font-medium tracking-wide">{collection.subtitle}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
          )}
        </section>
        <BottomTabBar activeTab="home" />
      </div>
    </Layout>
  );
};
