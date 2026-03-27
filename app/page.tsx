'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Dashboard from '@/components/Dashboard';
import ApiConfig from '@/components/ApiConfig';
import BatchUpload from '@/components/BatchUpload';
import CandidateList, { Candidate } from '@/components/CandidateList';
import CandidateProfile from '@/components/CandidateProfile';
import UserProfile from '@/components/UserProfile';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [apiKey, setApiKey] = React.useState('');
  const [prompt, setPrompt] = React.useState('Analise para vaga de cientista de dados');
  const [results, setResults] = React.useState<Candidate[]>([]);
  const [viewingCandidate, setViewingCandidate] = React.useState<Candidate | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const topScrollRef = React.useRef<HTMLDivElement>(null);

  // Sync scrollbars globally
  React.useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const topScroll = topScrollRef.current;

    if (!tableContainer || !topScroll) return;

    const handleTableScroll = () => {
      if (topScroll.scrollLeft !== tableContainer.scrollLeft) {
        topScroll.scrollLeft = tableContainer.scrollLeft;
      }
    };

    const handleTopScroll = () => {
      if (tableContainer.scrollLeft !== topScroll.scrollLeft) {
        tableContainer.scrollLeft = topScroll.scrollLeft;
      }
    };

    tableContainer.addEventListener('scroll', handleTableScroll);
    topScroll.addEventListener('scroll', handleTopScroll);

    return () => {
      tableContainer.removeEventListener('scroll', handleTableScroll);
      topScroll.removeEventListener('scroll', handleTopScroll);
    };
  }, [activeTab]); // Re-sync when tab changes

  // Load data from Supabase on mount
  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('i4u_api_key');
    const savedPrompt = localStorage.getItem('i4u_last_prompt');

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedPrompt) setPrompt(savedPrompt);

    const fetchCandidates = async () => {
      if (!supabase) {
        console.warn('Supabase not configured. Loading from localStorage.');
        const savedResults = localStorage.getItem('i4u_results');
        if (savedResults) {
          try {
            setResults(JSON.parse(savedResults));
          } catch (e) {
            console.error('Error parsing saved results', e);
          }
        }
        return;
      }

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching candidates from Supabase:', error);
        // Fallback to localStorage if Supabase fails
        const savedResults = localStorage.getItem('i4u_results');
        if (savedResults) {
          try {
            setResults(JSON.parse(savedResults));
          } catch (e) {
            console.error('Error parsing saved results', e);
          }
        }
      } else if (data) {
        // Map database fields to Candidate interface if necessary
        const mappedData = data.map(c => ({
          ...c,
          jobDescription: c.job_description // Map snake_case to camelCase
        }));
        setResults(mappedData);
      }
    };

    fetchCandidates();
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

  const handleBatchComplete = async (newResults: any[]) => {
    const resultsWithJob = newResults.map(r => ({
      name: r.name,
      score: r.score,
      status: 'Em Análise',
      date: r.date,
      analysis: r.analysis,
      email: r.email,
      phone: r.phone,
      role: r.role,
      job_description: prompt
    }));

    if (!supabase) {
      console.warn('Supabase not configured. Saving to local state only.');
      const localResults = resultsWithJob.map((r, i) => ({
        ...r,
        id: `temp-${Date.now()}-${i}`,
        jobDescription: r.job_description
      }));
      setResults(prev => [...localResults, ...prev]);
      return;
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert(resultsWithJob)
      .select();

    if (error) {
      console.error('Error saving candidates to Supabase:', error);
      // Fallback to local state if Supabase fails
      const localResults = resultsWithJob.map((r, i) => ({
        ...r,
        id: `temp-${Date.now()}-${i}`,
        jobDescription: r.job_description
      }));
      setResults(prev => [...localResults, ...prev]);
    } else if (data) {
      const mappedData = data.map(c => ({
        ...c,
        jobDescription: c.job_description
      }));
      setResults(prev => [...mappedData, ...prev]);
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!supabase) {
      setResults(prev => prev.filter(c => c.id !== id));
      if (viewingCandidate?.id === id) setViewingCandidate(null);
      return;
    }

    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting candidate from Supabase:', error);
    } else {
      setResults(prev => prev.filter(c => c.id !== id));
      if (viewingCandidate?.id === id) setViewingCandidate(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!supabase) {
      setResults(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      return;
    }

    const { error } = await supabase
      .from('candidates')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status in Supabase:', error);
    } else {
      setResults(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    }
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
      
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col relative w-full overflow-x-hidden">
        <TopBar apiKey={apiKey} onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Global Top Scrollbar */}
        <div 
          ref={topScrollRef}
          className="fixed top-20 left-0 lg:left-64 right-0 z-40 overflow-x-auto h-2 bg-white/80 backdrop-blur-sm border-b border-slate-100"
        >
          <div style={{ width: '1400px', height: '1px' }}></div>
        </div>

        <div 
          ref={tableContainerRef} 
          className="flex-1 overflow-x-auto pt-24"
        >
          <div className="px-4 md:px-10 pb-12 min-w-[1400px] w-full flex-1">
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
                  <div className="space-y-6 relative">
                    <CandidateList 
                      candidates={results} 
                      onViewProfile={(c) => setViewingCandidate(c)}
                      onDelete={handleDeleteCandidate}
                      onUpdateStatus={handleUpdateStatus}
                    />
                    
                    <AnimatePresence>
                      {viewingCandidate && (
                        <CandidateProfile 
                          candidate={viewingCandidate} 
                          onClose={() => setViewingCandidate(null)} 
                          onDelete={handleDeleteCandidate}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      )}
                    </AnimatePresence>
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

                {activeTab === 'profile' && (
                  <div className="max-w-5xl">
                    <UserProfile />
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

          <footer className="px-10 py-8 border-t border-slate-100 mt-auto bg-white min-w-[1400px]">
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
        </div>
      </main>

    </div>
  );
}
