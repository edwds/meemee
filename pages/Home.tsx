import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Utensils, Trophy, Settings, Home as HomeIcon, Library } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ReviewRecord } from '../types';

interface HomeProps {
  records: ReviewRecord[];
}

export const Home: React.FC<HomeProps> = ({ records }) => {
  // Format date helper
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

  return (
    <Layout title="meemee" hasTabBar={true}>
      <div className="pb-4">
        
        {/* Profile Section (My Page Style) */}
        <section className="bg-white pb-8 pt-6 rounded-b-3xl shadow-sm border-b border-gray-100 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-white shadow-md relative">
              😋
              <div className="absolute bottom-0 right-0 bg-secondary p-1.5 rounded-full border-2 border-white">
                <Settings size={12} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-secondary">meemee</h2>
            <p className="text-sm text-gray-400 mt-1 font-medium">나의 미식 수집가</p>
            
            <div className="grid grid-cols-3 gap-8 mt-6 w-full px-12">
              <div className="text-center">
                <span className="block font-bold text-xl text-secondary">{records.length}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Records</span>
              </div>
              <div className="text-center border-l border-r border-gray-100">
                <span className="block font-bold text-xl text-secondary">
                  {records.filter(r => r.preference === '좋아요').length}
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Loved</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-xl text-secondary">
                   {new Set(records.map(r => r.menu.split(',')[0].trim())).size}
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Menus</span>
              </div>
            </div>
          </div>
        </section>

        {/* Records Feed */}
        <section className="px-4 mb-20">
          <h3 className="text-lg font-bold text-secondary mb-4 flex items-center">
             <Utensils size={18} className="mr-2 text-primary" />
             미식 로그
          </h3>
          
          {records.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <Utensils className="mx-auto mb-3 opacity-50" size={32} />
              <p className="text-sm">아직 기록된 미식이 없습니다.<br/>첫 번째 맛을 기록해보세요!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {records.map((record) => (
                <Link key={record.id} to={`/record/${record.id}`} className="block group">
                  <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-200 flex h-28 relative">
                    {/* Rank Badge */}
                    {record.rank && (
                      <div className="absolute top-0 left-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10 flex items-center shadow-sm">
                        <Trophy size={8} className="mr-1" />
                        #{record.rank}
                      </div>
                    )}

                    {/* Image */}
                    <div className="w-28 h-28 flex-shrink-0 bg-gray-100">
                      {record.representativePhoto ? (
                        <img 
                          src={record.representativePhoto} 
                          alt={record.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Img
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-3 flex flex-col justify-center flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-secondary truncate pr-2 text-sm">{record.title}</h4>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
                             record.preference === '좋아요' ? 'bg-orange-50 text-primary' : 
                             record.preference === '보통' ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                          }`}>
                            {record.preference}
                          </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-2">{record.menu}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex gap-1">
                           {record.keywords?.slice(0, 2).map(k => (
                                <span key={k} className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">#{k}</span>
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-300 flex items-center">
                          {formatDate(record.visitDate, record.createdAt)}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Apple Style Tab Bar */}
        <div className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe z-50">
            <div className="flex justify-between items-center px-6 h-[80px] pb-4">
                {/* Tab 1: Home */}
                <div className="flex-1 flex justify-center">
                    <button className="flex flex-col items-center space-y-1 text-secondary">
                        <HomeIcon strokeWidth={2.5} size={24} />
                        <span className="text-[10px] font-medium">홈</span>
                    </button>
                </div>

                {/* Tab 2: Record (Center Action) */}
                <div className="flex-1 flex justify-center -mt-6">
                    <Link to="/create">
                        <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-white shadow-lg shadow-gray-300 hover:scale-105 transition-transform border-4 border-[#F8F7F4]">
                            <Plus strokeWidth={3} size={24} />
                        </div>
                    </Link>
                </div>

                {/* Tab 3: Archive (Dummy) */}
                <div className="flex-1 flex justify-center">
                    <button className="flex flex-col items-center space-y-1 text-gray-300 hover:text-gray-500 transition-colors">
                        <Library strokeWidth={2.5} size={24} />
                        <span className="text-[10px] font-medium">보관함</span>
                    </button>
                </div>
            </div>
        </div>

      </div>
    </Layout>
  );
};