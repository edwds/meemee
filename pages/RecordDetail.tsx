
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Share2, Quote, Calendar, Users, MapPin, ChevronRight, ArrowLeft, MoreHorizontal, Bookmark } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { ReviewRecord, Preference } from '../types';
import html2canvas from 'html2canvas';
import { MOCK_FEED_POSTS, MOCK_FRIEND_RECORDS } from '../data/dummyData';

interface RecordDetailProps {
  records: ReviewRecord[];
}

export const RecordDetail: React.FC<RecordDetailProps> = ({ records }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Unified Record Lookup (Local + Feed + Friends)
  const record = useMemo(() => {
    // 1. Check My Records
    let found = records.find(r => r.id === id);
    if (found) return found;

    // 2. Check Feed Posts
    const feedPost = MOCK_FEED_POSTS.find(p => p.record.id === id);
    if (feedPost) return feedPost.record;

    // 3. Check Friend Records
    found = MOCK_FRIEND_RECORDS.find(r => r.id === id);
    if (found) return found;

    return null;
  }, [id, records]);

  const shareRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  // Pull to close state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [pullOffset, setPullOffset] = useState(0);
  const PULL_THRESHOLD = 150; // px to trigger close

  // Filter other records for "Continuous Discovery" (Mix of all sources)
  const relatedRecords = useMemo(() => {
    if (!record) return [];
    
    // Combine all available records for discovery
    const allSources = [
        ...records, 
        ...MOCK_FEED_POSTS.map(p => p.record),
        ...MOCK_FRIEND_RECORDS
    ];

    return allSources
        .filter(r => r.id !== record.id) // Exclude current
        .sort(() => 0.5 - Math.random()) // Shuffle
        // Removed slice to show all records for continuous feed
  }, [record, records]);

  // Reset scroll on ID change
  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollTop = 0;
    }
  }, [id]);

  if (!record) return <Navigate to="/" />;

  const handleShare = async () => {
    if (!shareRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(shareRef.current, { useCORS: true, backgroundColor: '#000', scale: 2 });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'share.png', { type: 'image/png' })] })) {
            const file = new File([blob], `gourmet_log_${record.id}.png`, { type: 'image/png' });
            await navigator.share({ files: [file], title: record.title, text: record.reviewText });
        } else {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `gourmet_log_${record.title}.png`;
          link.click();
        }
        setIsSharing(false);
      });
    } catch (e) { setIsSharing(false); alert('이미지 생성에 실패했습니다.'); }
  };

  // --- Pull to Close Logic ---
  const handleTouchStart = (e: React.TouchEvent) => {
      if (containerRef.current && containerRef.current.scrollTop <= 0) {
          setTouchStart(e.touches[0].clientY);
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (touchStart === null) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStart;

      if (diff > 0 && containerRef.current?.scrollTop === 0) {
          // Prevent default pull-to-refresh if possible (though harder in React passive events)
          setPullOffset(diff);
      }
  };

  const handleTouchEnd = () => {
      if (pullOffset > PULL_THRESHOLD) {
          navigate(-1);
      } else {
          setPullOffset(0);
      }
      setTouchStart(null);
  };

  const renderTasteBar = (label: string, value: number) => {
    // 3 is balanced. 
    // If value < 3: deviation to left (Weak)
    // If value > 3: deviation to right (Bold)
    const deviation = value - 3; // -2, -1, 0, 1, 2
    
    // Width calculation: 
    // deviation 0 -> dot
    // deviation 1 or -1 -> 25% width
    // deviation 2 or -2 -> 50% width
    const widthPercent = Math.abs(deviation) * 25; 
    
    return (
      <div className="flex items-center mb-4">
        <span className="w-12 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right mr-3">Light</span>
        
        <div className="flex-1 h-8 bg-gray-800 rounded-full relative flex items-center justify-center border border-white/5">
            {/* Center Line */}
            <div className="absolute top-0 bottom-0 w-[1px] bg-white/10 left-1/2"></div>
            
            {/* Divergence Bar */}
            <div 
                className={`h-2 rounded-full absolute transition-all duration-500 ${deviation === 0 ? 'w-2 h-2 bg-white' : 'bg-primary shadow-[0_0_8px_rgba(255,107,53,0.6)]'}`}
                style={{
                    width: deviation === 0 ? '6px' : `${widthPercent}%`,
                    left: deviation < 0 ? `calc(50% - ${widthPercent}%)` : '50%',
                    borderRadius: '99px'
                }}
            ></div>
        </div>

        <span className="w-12 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left ml-3">Bold</span>
        
        {/* Label Overlay */}
        <div className="absolute left-1/2 -translate-x-1/2 -mt-8">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <Layout title="" hideHeader hasTabBar={false} scrollable={false} backgroundColor="bg-black">
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto bg-black text-white pb-20 relative transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${pullOffset * 0.4}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Floating Header */}
        <div className="fixed top-0 left-0 w-full z-50 px-4 py-4 flex justify-between items-center pointer-events-none">
             {/* Back Button */}
             <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors pointer-events-auto border border-white/10">
                 <ArrowLeft size={20} />
             </button>
             
             {/* Pull Handle (Visual Indicator) */}
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full backdrop-blur-sm"></div>

             <div className="flex gap-2 pointer-events-auto">
                 <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors border border-white/10">
                     <Bookmark size={20} />
                 </button>
                 <button onClick={handleShare} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors border border-white/10">
                     <MoreHorizontal size={20} />
                 </button>
             </div>
        </div>

        {/* 1. IMMERSIVE IMAGE SLIDER */}
        <div className="w-full aspect-[4/5] bg-gray-900 relative">
            <div className="w-full h-full overflow-x-auto flex snap-x snap-mandatory no-scrollbar">
                {record.photos.map((photo, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                        <img src={photo} alt={`photo-${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                    </div>
                ))}
            </div>
            
            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 w-full p-6 pb-8">
                 <div className="flex items-center gap-2 mb-2">
                     <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded">
                         {record.category}
                     </span>
                     {record.rank && (
                         <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-wider rounded">
                             Rank #{record.rank}
                         </span>
                     )}
                 </div>
                 <h1 className="text-3xl font-black leading-tight mb-1 drop-shadow-lg">{record.title}</h1>
                 <p className="text-gray-300 text-sm font-medium">{record.menu}</p>
            </div>
        </div>

        {/* 2. CONTENT BODY */}
        <div className="px-6 -mt-4 relative z-10">
            
            {/* TASTING NOTE */}
            <div className="mb-10">
                <Quote className="text-primary w-8 h-8 mb-4 opacity-80" />
                <p className="text-gray-200 text-lg leading-relaxed font-serif italic whitespace-pre-wrap">
                    {record.reviewText}
                </p>
                <div className="flex items-center gap-4 mt-6 text-xs text-gray-500 font-medium">
                    <span className="flex items-center"><Calendar size={14} className="mr-1.5" />{record.visitDate}</span>
                    <span className="flex items-center"><Users size={14} className="mr-1.5" />{record.companions}</span>
                </div>
            </div>

            <div className="w-full h-[1px] bg-white/10 mb-8"></div>

            {/* TASTE PROFILE (DIVERGENCE GRAPH) */}
            <div className="grid grid-cols-1 gap-8 mb-10">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center">
                        맛 프로파일 (Balance)
                    </h3>
                    {record.tasteProfile && (
                        <div className="space-y-6 bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                            {renderTasteBar('맵기', record.tasteProfile.spiciness)}
                            {renderTasteBar('단맛', record.tasteProfile.sweetness)}
                            {renderTasteBar('짠맛', record.tasteProfile.saltiness)}
                            {renderTasteBar('풍미', record.tasteProfile.richness)}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                        키워드
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {record.keywords.map((k) => (
                            <span key={k} className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-xs font-medium border border-white/5">
                                #{k}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. POI CARD (Context) */}
            <Link to={`/restaurant/${record.id}`} className="block mb-12">
                <div className="bg-[#1A1A1A] rounded-2xl p-4 flex items-center justify-between border border-white/5 active:scale-[0.98] transition-transform group">
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                             <MapPin size={20} />
                         </div>
                         <div>
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">위치 정보</p>
                             <h4 className="text-base font-bold text-white group-hover:text-primary transition-colors">{record.title}</h4>
                             <p className="text-xs text-gray-400 truncate max-w-[200px]">{record.location?.address || '위치 정보 없음'}</p>
                         </div>
                    </div>
                    <ChevronRight className="text-gray-600 group-hover:text-white transition-colors" size={20} />
                </div>
            </Link>

        </div>

        {/* 4. CONTINUOUS DISCOVERY (VERTICAL 2-COLUMN GRID) */}
        <div className="border-t border-white/10 pt-8 pb-10">
            <h3 className="px-6 text-sm font-bold text-white mb-4">더 많은 미식 기록</h3>
            <div className="grid grid-cols-2 gap-3 px-3">
                {relatedRecords.map(rel => (
                    <Link 
                        key={rel.id} 
                        to={`/record/${rel.id}`} 
                        replace={true} // IMPORTANT: Replace history to avoid deep stack
                        className="block group active:scale-[0.98] transition-transform"
                    >
                        <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-800 relative mb-2 shadow-lg">
                             <img src={rel.representativePhoto} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                             
                             <div className="absolute bottom-3 left-3 right-3">
                                 <div className="flex items-center gap-1 mb-1">
                                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded">
                                        {rel.category}
                                    </span>
                                 </div>
                                 <p className="text-white text-sm font-bold leading-tight line-clamp-2">{rel.title}</p>
                             </div>
                        </div>
                    </Link>
                ))}
            </div>
            {relatedRecords.length === 0 && (
                <div className="text-center py-10 px-6">
                    <p className="text-sm text-gray-500">더 이상의 기록이 없습니다.</p>
                </div>
            )}
        </div>

        {/* Hidden Share Canvas */}
        <div className="absolute top-[-9999px] left-[-9999px]">
          <div ref={shareRef} className="w-[375px] bg-black text-white p-8 flex flex-col items-center font-sans">
             <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6 relative">
                 <img src={record.representativePhoto} className="w-full h-full object-cover" />
                 <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                     <h2 className="text-2xl font-black">{record.title}</h2>
                 </div>
             </div>
             <div className="w-full mb-6">
                 <Quote className="text-primary w-6 h-6 mb-2" />
                 <p className="text-gray-300 text-sm leading-relaxed font-serif italic text-center px-4">"{record.reviewText}"</p>
             </div>
             <div className="w-full border-t border-white/20 pt-4 flex justify-between items-center">
                 <span className="font-bold text-primary text-xs tracking-widest">meemee</span>
                 <span className="text-[10px] text-gray-500">{record.visitDate}</span>
             </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};
