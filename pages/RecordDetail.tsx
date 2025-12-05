import React, { useRef, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Share2, Quote, Calendar, Users } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { ReviewRecord } from '../types';
import html2canvas from 'html2canvas';

interface RecordDetailProps {
  records: ReviewRecord[];
}

export const RecordDetail: React.FC<RecordDetailProps> = ({ records }) => {
  const { id } = useParams<{ id: string }>();
  const record = records.find(r => r.id === id);
  const shareRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!record) return <Navigate to="/" />;

  const handleShare = async () => {
    if (!shareRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(shareRef.current, { useCORS: true, backgroundColor: '#FFF', scale: 2 });
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

  const renderTasteBar = (label: string, value: number) => (
    <div className="flex items-center mb-3">
      <span className="w-16 text-sm font-medium text-gray-500">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden mx-3">
        <div className="h-full bg-primary rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-sm font-bold text-secondary w-5 text-right">{value}</span>
    </div>
  );

  return (
    <Layout title={record.title} showBack hasTabBar={false} scrollable={true}>
      <div className="pb-8">
        <div className="w-full aspect-square bg-gray-100 overflow-x-auto flex snap-x snap-mandatory no-scrollbar">
          {record.photos.map((photo, idx) => (
            <div key={idx} className="w-full flex-shrink-0 snap-center relative h-full">
              <img src={photo} alt={`photo-${idx}`} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">{idx + 1} / {record.photos.length}</div>
            </div>
          ))}
        </div>
        <div className="px-5 -mt-6 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col min-w-0 flex-1 pr-2">
                {record.category && <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{record.category}</span>}
                <span className="text-2xl font-bold text-secondary truncate">{record.title}</span>
              </div>
              <span className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${record.preference === '좋아요' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{record.preference}</span>
            </div>
            <div className="flex items-center space-x-6 mb-6 text-sm text-gray-500 border-b border-gray-100 pb-6">
              {record.visitDate && <div className="flex items-center"><Calendar size={18} className="mr-2 text-gray-400" />{record.visitDate}</div>}
              {record.companions && <div className="flex items-center"><Users size={18} className="mr-2 text-gray-400" />{record.companions}</div>}
            </div>
            <p className="text-secondary text-lg mb-6 font-medium"><span className="text-primary text-xs font-bold uppercase tracking-wider block mb-1">MENU</span> {record.menu}</p>
            <div className="relative mb-8 bg-gray-50 p-6 rounded-2xl">
              <Quote className="absolute top-4 left-4 text-gray-200 w-8 h-8 rotate-180" />
              <p className="text-gray-700 leading-loose whitespace-pre-wrap relative z-10 text-base font-serif pt-2 italic">{record.reviewText}</p>
            </div>
            {record.tasteProfile && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Taste Profile</h3>
                {renderTasteBar('매운맛', record.tasteProfile.spiciness)}
                {renderTasteBar('단맛', record.tasteProfile.sweetness)}
                {renderTasteBar('짠맛', record.tasteProfile.saltiness)}
                {renderTasteBar('풍미', record.tasteProfile.richness)}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {record.keywords.map((k) => <span key={k} className="bg-white text-gray-600 px-3.5 py-2 rounded-xl text-sm font-medium border border-gray-200">#{k}</span>)}
            </div>
          </div>
        </div>
        <div className="px-6 mt-10 pb-safe">
          <Button variant="secondary" fullWidth size="lg" onClick={handleShare} isLoading={isSharing}><Share2 size={22} className="mr-2" />카드 이미지 저장</Button>
        </div>
        {/* Hidden Share Card */}
        <div className="absolute top-[-9999px] left-[-9999px]">
          <div ref={shareRef} className="w-[375px] bg-[#F8F7F4] p-8 flex flex-col items-center font-sans">
             <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-md"><img src={record.representativePhoto} className="w-full h-full object-cover" /></div>
             <h2 className="text-2xl font-bold text-[#2E2E2E] mb-1">{record.title}</h2>
             <p className="text-[#2E2E2E] text-center leading-relaxed mb-6 text-sm px-4">{record.reviewText}</p>
             <div className="w-full border-t border-gray-200 pt-4 flex justify-between items-center"><span className="font-bold text-[#FF6B35] text-xs tracking-widest">GOURMET LOG</span></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
