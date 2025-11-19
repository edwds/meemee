
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateRecord } from './pages/CreateRecord';
import { RecordDetail } from './pages/RecordDetail';
import { ReviewRecord } from './types';

const LOCAL_STORAGE_KEY = 'gourmet_log_records_v1';

const App: React.FC = () => {
  const [records, setRecords] = useState<ReviewRecord[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load records", e);
      }
    }
  }, []);

  // Save to localStorage whenever records change
  useEffect(() => {
    if (records.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
      } catch (error) {
        console.error("Failed to save records to localStorage:", error);
        if (error instanceof DOMException && 
           (error.name === 'QuotaExceededError' || 
            error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
           alert("저장 공간이 부족합니다. 사진 용량을 줄이거나 이전 기록을 정리해주세요.");
        }
      }
    }
  }, [records]);

  const handleSaveRecord = (newRecord: ReviewRecord, updatedRecords?: ReviewRecord[]) => {
    setRecords(prev => {
        // If updatedRecords are provided (e.g. from ranking shift), 
        // we use them to update existing items in the list.
        let nextState = [...prev];

        if (updatedRecords && updatedRecords.length > 0) {
           const updatedMap = new Map(updatedRecords.map(r => [r.id, r]));
           nextState = nextState.map(r => updatedMap.get(r.id) || r);
        }

        // Add new record to the top (it's the most recently created, chronological order usually for feed)
        // Note: For the Ranking Badge display, we rely on the 'rank' property, not array order.
        return [newRecord, ...nextState];
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home records={records} />} />
        <Route path="/create" element={<CreateRecord onSave={handleSaveRecord} existingRecords={records} />} />
        <Route path="/record/:id" element={<RecordDetail records={records} />} />
      </Routes>
    </Router>
  );
};

export default App;
