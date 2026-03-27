'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Dashboard from '@/components/Dashboard';
import ApiConfig from '@/components/ApiConfig';
import BatchUpload from '@/components/BatchUpload';
import CandidateList, { Candidate } from '@/components/CandidateList';
import CandidateProfile from '@/components/CandidateProfile';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [apiKey, setApiKey] = React.useState('');
  const [prompt, setPrompt] = React.useState('Analise para vaga de cientista de dados');
  const [results, setResults] = React.useState<Candidate[]>([]);
  const [viewingCandidate, setViewingCandidate] = React.useState<Candidate | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Load data from localStorage on mount
  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('i4u_api_key');
    const savedPrompt = localStorage.getItem('i4u_last_prompt');
    const savedResults = localStorage.getItem('i4u_results');

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedPrompt) setPrompt(savedPrompt);
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error('Error parsing saved results', e);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  React.useEffect(() => {
    if (apiKey) localStorage.setItem('i4u_api_key', apiKey);
  }, [apiKey]);

  React.useEffect(() => {
    if (prompt) localStorage.setItem('i4u_last_prompt', prompt);
  }, [prompt]);

  React.useEffect(() => {
    if (results.length > 0) localStorage.setItem('i4u_results', JSON.stringify(results));
  }, [results]);

  const handleBatchComplete = (newResults: any[]) => {
    const resultsWithJob = newResults.map(r => ({
      ...r,
      jobDescription: prompt, // Use the current prompt as the job description
      status: 'Em Análise' // Initial status
    }));
    setResults(prev => [...resultsWithJob, ...prev]);
  };

  const handleDeleteCandidate = (id: string) => {
    setResults(prev => prev.filter(c => c.id !== id));
    if (viewingCandidate?.id === id) setViewingCandidate(null);
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setResults(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="flex min-h-screen bg-surface overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col relative w-full">
        <TopBar apiKey={apiKey} onMenuClick={() => setIsSidebarOpen(true)} />
        
        <div className="pt-24 px-4 md:px-10 pb-12 max-w-7xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="max-w-5xl">
                  <Dashboard results={results} onNavigate={setActiveTab} />
                </div>
              )}

              {activeTab === 'candidates' && (
                <div className="space-y-6">
                  {viewingCandidate ? (
                    <CandidateProfile 
                      candidate={viewingCandidate} 
                      onClose={() => setViewingCandidate(null)} 
                      onDelete={handleDeleteCandidate}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ) : (
                    <CandidateList 
                      candidates={results} 
                      onViewProfile={(c) => setViewingCandidate(c)}
                      onDelete={handleDeleteCandidate}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  )}
                </div>
              )}

              {activeTab === 'batch' && (
                <div className="max-w-5xl">
                  <section className="mb-8">
                    <h2 className="text-3xl font-headline font-bold text-slate-900">Envio em Lote</h2>
                    <p className="text-slate-500">Faça o upload de múltiplos currículos para análise simultânea.</p>
                  </section>
                  <BatchUpload 
                    apiKey={apiKey} 
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onComplete={handleBatchComplete} 
                  />
                </div>
              )}

              {activeTab === 'api' && (
                <div className="max-w-2xl">
                  <section className="mb-8">
                    <h2 className="text-3xl font-headline font-bold text-slate-900">Configurações</h2>
                    <p className="text-slate-500">Gerencie suas chaves de API e conexões de serviço.</p>
                  </section>
                  <ApiConfig apiKey={apiKey} onApiKeyChange={setApiKey} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="px-10 py-8 border-t border-slate-100 mt-auto bg-white">
          <div className="flex items-center justify-between">
            <div className="flex gap-12">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status da Rede</p>
                <p className="text-sm font-bold text-green-600">Ideal (99,9% Uptime)</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Rank Global</p>
                <p className="text-sm font-bold">Top 1% de Precisão</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_4px_rgba(235,93,29,0.8)]"></div>
              <span className="text-xs font-medium text-slate-400 italic">Motor I4U Resume v2.4.0 Online</span>
            </div>
          </div>
        </footer>
      </main>

    </div>
  );
}
