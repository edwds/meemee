
import React, { useRef, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Share2, Quote, Calendar, Users } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { ReviewRecord, TasteProfile } from '../types';
import html2canvas from 'html2canvas';

interface RecordDetailProps {
  records: ReviewRecord[];
}

export const RecordDetail: React.FC<RecordDetailProps> = ({ records }) => {
  const { id } = useParams<{ id: string }>();
  const record = records.find(r => r.id === id);
  const shareRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!record) {
    return <Navigate to="/" />;
  }

  const handleShare = async () => {
    if (!shareRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(shareRef.current, {
        useCORS: true,
        backgroundColor: '#FFF',
        scale: 2
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'share.png', { type: 'image/png' })] })) {
          try {
            const file = new File([blob], `gourmet_log_${record.id}.png`, { type: 'image/png' });
            await navigator.share({
              files: [file],
              title: record.title,
              text: record.aiGeneratedText
            });
          } catch (err) {
            console.log("Share failed", err);
          }
        } else {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `gourmet_log_${record.title}.png`;
          link.click();
          alert('이미지가 저장되었습니다. 갤러리에서 공유해주세요!');
        }
        setIsSharing(false);
      });
    } catch (e) {
      console.error(e);
      setIsSharing(false);
      alert('이미지 생성에 실패했습니다.');
    }
  };

  // Helper to render taste bars
  const renderTasteBar = (label: string, value: number) => (
    <div className="flex items-center mb-3">
      <span className="w-16 text-xs font-medium text-gray-500">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-3">
        <div 
          className="h-full bg-primary rounded-full" 
          style={{ width: `${(value / 5) * 100}%` }} 
        />
      </div>
      <span className="text-xs font-bold text-secondary w-4 text-right">{value}</span>
    </div>
  );

  return (
    <Layout title={record.title} showBack hasTabBar={false} scrollable={true}>
      <div className="pb-8">
        {/* Images Carousel */}
        <div className="w-full aspect-square bg-gray-100 overflow-x-auto flex snap-x snap-mandatory no-scrollbar">
          {record.photos.map((photo, idx) => (
            <div key={idx} className="w-full flex-shrink-0 snap-center relative h-full">
              <img src={photo} alt={`photo-${idx}`} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
                {idx + 1} / {record.photos.length}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 -mt-6 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col min-w-0 flex-1 pr-2">
                {record.category && (
                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                     {record.category}
                   </span>
                )}
                <span className="text-2xl font-bold text-secondary truncate">{record.title}</span>
              </div>
              <span className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
                record.preference === '좋아요' ? 'bg-green-100 text-green-700' :
                record.preference === '보통' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {record.preference}
              </span>
            </div>

            {/* Info Row */}
            <div className="flex items-center space-x-5 mb-6 text-sm text-gray-500 border-b border-gray-100 pb-6">
              {record.visitDate && (
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1.5 text-gray-400" />
                  {record.visitDate}
                </div>
              )}
              {record.companions && (
                <div className="flex items-center">
                  <Users size={16} className="mr-1.5 text-gray-400" />
                  {record.companions}
                </div>
              )}
            </div>
            
            <p className="text-secondary text-base mb-6 font-medium">
              <span className="text-primary text-xs font-bold uppercase tracking-wider block mb-1">MENU</span> 
              {record.menu}
            </p>

            <div className="relative mb-8 bg-gray-50 p-5 rounded-2xl">
              <Quote className="absolute top-4 left-4 text-gray-200 w-6 h-6 rotate-180" />
              <p className="text-gray-700 leading-loose whitespace-pre-wrap relative z-10 text-sm font-serif pt-2">
                {record.aiGeneratedText}
              </p>
            </div>

            {/* Taste Profile Visualization */}
            {record.tasteProfile && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Taste Profile</h3>
                {renderTasteBar('매운맛', record.tasteProfile.spiciness)}
                {renderTasteBar('단맛', record.tasteProfile.sweetness)}
                {renderTasteBar('짠맛', record.tasteProfile.saltiness)}
                {renderTasteBar('신맛', record.tasteProfile.acidity)}
                {renderTasteBar('풍미', record.tasteProfile.richness)}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {record.keywords.map((k) => (
                <span key={k} className="bg-white text-gray-600 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200">
                  #{k}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 mt-10 pb-safe">
          <Button variant="secondary" fullWidth size="lg" onClick={handleShare} isLoading={isSharing}>
            <Share2 size={20} className="mr-2" />
            카드 이미지 저장
          </Button>
        </div>

        {/* Hidden Share Card Template */}
        <div className="absolute top-[-9999px] left-[-9999px]">
          <div ref={shareRef} className="w-[375px] bg-[#F8F7F4] p-8 flex flex-col items-center font-sans">
             <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-md">
               <img src={record.representativePhoto} className="w-full h-full object-cover" />
             </div>
             <h2 className="text-2xl font-bold text-[#2E2E2E] mb-1">{record.title}</h2>
             <p className="text-xs text-gray-400 mb-3">{record.visitDate} | with {record.companions || 'Me'}</p>
             <div className="flex gap-2 mb-4">
                {record.category && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{record.category}</span>
                )}
                <span className="text-xs bg-[#FF6B35] text-white px-2 py-1 rounded">{record.preference}</span>
             </div>
             <p className="text-[#2E2E2E] text-center leading-relaxed mb-6 text-sm px-4">
               {record.aiGeneratedText.length > 100 ? record.aiGeneratedText.substring(0, 100) + '...' : record.aiGeneratedText}
             </p>
             <div className="flex flex-wrap gap-1.5 justify-center mb-8">
               {record.keywords.slice(0, 4).map(k => (
                 <span key={k} className="text-[10px] border border-gray-300 text-gray-500 px-2 py-0.5 rounded-full">#{k}</span>
               ))}
             </div>
             {/* Taste Small Viz for Share Card */}
             {record.tasteProfile && (
                 <div className="flex gap-2 mb-6 text-[9px] text-gray-400">
                   <span>Spicy {record.tasteProfile.spiciness}</span>
                   <span>Sweet {record.tasteProfile.sweetness}</span>
                   <span>Salty {record.tasteProfile.saltiness}</span>
                 </div>
             )}
             <div className="w-full border-t border-gray-200 pt-4 flex justify-between items-center">
               <span className="font-bold text-[#FF6B35] text-xs tracking-widest">GOURMET LOG</span>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
