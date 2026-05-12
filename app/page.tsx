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
import Auth from '@/components/Auth';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const [prompt, setPrompt] = React.useState('Analise para vaga de cientista de dados');
  const [results, setResults] = React.useState<Candidate[]>([]);
  const [viewingCandidate, setViewingCandidate] = React.useState<Candidate | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [session, setSession] = React.useState<any>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [dbStatus, setDbStatus] = React.useState<'connected' | 'disconnected' | 'not-configured' | 'local'>('not-configured');
  const [isTestingConnection, setIsTestingConnection] = React.useState(false);
  const [isApiValidated, setIsApiValidated] = React.useState(false);
  const [isVisitorMode, setIsVisitorMode] = React.useState(false);
  const [missingColumns, setMissingColumns] = React.useState<string[]>([]);
  const missingColumnsRef = React.useRef<string[]>([]);

  // Update ref whenever state changes
  React.useEffect(() => {
    missingColumnsRef.current = missingColumns;
  }, [missingColumns]);

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

  // Auth Listener
  React.useEffect(() => {
    if (!supabase || !supabase.auth) {
      setAuthLoading(false);
      return;
    }

    let isMounted = true;

    const setupAuth = async () => {
      const client = supabase;
      if (!client || !client.auth) return null;
      try {
        const { data: { session } } = await client.auth.getSession();
        if (isMounted) {
          setSession(session);
          setAuthLoading(false);
        }

        if (typeof client.auth.onAuthStateChange === 'function') {
          const { data } = client.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
              setSession(session);
              // If user logs in, we probably want to try to fetch from DB
              if (session) setIsVisitorMode(false);
            }
          });
          
          return data?.subscription;
        }
      } catch (err) {
        console.error('Auth setup error:', err);
        if (isMounted) setAuthLoading(false);
      }
      return null;
    };

    const subPromise = setupAuth();

    return () => {
      isMounted = false;
      subPromise.then(sub => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
    };
  }, []);

  // Load data from Supabase on mount
  React.useEffect(() => {
    if (authLoading) return;

    if (session || isVisitorMode) {
      if (session) localStorage.setItem('i4u_session_active', 'true');
      
      const savedApiKey = localStorage.getItem('i4u_api_key');
      const savedPrompt = localStorage.getItem('i4u_last_prompt');
      const localResults = localStorage.getItem('i4u_results');

      if (savedApiKey) setApiKey(savedApiKey);
      if (savedPrompt) setPrompt(savedPrompt);
      if (localResults) {
        try {
          const parsed = JSON.parse(localResults);
          if (parsed.length > 0) setResults(parsed);
        } catch (e) {
          console.error('Error parsing local results', e);
        }
      }
    }

    const fetchCandidates = async () => {
      const client = supabase;
      if (!client || !session) {
        if (!client) console.warn('Supabase not configured. Loading from localStorage.');
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

      console.log('Attempting to fetch candidates from Supabase for user:', session?.user?.id);
      const { data, error } = await client
        .from('candidates')
        .select('*')
        .eq('user_id', session?.user?.id) // Filter by user_id
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
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
        console.log('Successfully fetched candidates:', data.length);
        // Map database fields to Candidate interface if necessary
        const mappedData = data.map(c => ({
          ...c,
          jobDescription: c.job_description, // Map snake_case to camelCase
          experienceYears: c.experience_years,
          fileName: c.file_name,
          attentionAreas: c.attention_areas || [],
          skills: c.skills || [],
          strengths: c.strengths || [],
          tags: c.tags || [],
        }));
        setResults(mappedData);
      }
    };

    fetchCandidates();

    // Test connection and check schema
    const testConnection = async () => {
      const client = supabase;
      if (!client) {
        setDbStatus('local');
        return;
      }
      
      setIsTestingConnection(true);
      try {
        console.log('Testing connection and schema...');
        // Check for specific columns that might be missing
        const requiredColumns = ['attention_areas', 'tags', 'experience_years', 'job_description', 'skills', 'strengths', 'file_name'];
        const missing: string[] = [];

        // Lightweight connection test first
        const { error: connError } = await client.from('candidates').select('id').limit(1);
        if (connError) {
          console.error('Supabase connection test failed:', connError.message);
          setDbStatus('disconnected');
          setIsTestingConnection(false);
          return;
        }

        for (const col of requiredColumns) {
          try {
            const { error } = await client.from('candidates').select(col).limit(0);
            if (error) {
              if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('not found')) {
                missing.push(col);
              }
            }
          } catch (e) {
            missing.push(col);
          }
        }

        if (missing.length > 0) {
          console.warn('Missing columns detected:', missing);
          setMissingColumns(missing);
        } else {
          setMissingColumns([]);
        }
        
        setDbStatus('connected');
      } catch (err) {
        console.error('Connection test exception:', err);
        setDbStatus('disconnected');
      } finally {
        setIsTestingConnection(false);
      }
    };
    
    testConnection();
    
    // Set up periodic check every 30 seconds
    const interval = setInterval(testConnection, 30000);
    return () => clearInterval(interval);
  }, [session, isVisitorMode, authLoading]);

  // Save data to localStorage whenever it changes
  React.useEffect(() => {
    if (apiKey) localStorage.setItem('i4u_api_key', apiKey);
  }, [apiKey]);

  React.useEffect(() => {
    if (prompt) localStorage.setItem('i4u_last_prompt', prompt);
  }, [prompt]);

  React.useEffect(() => {
    localStorage.setItem('i4u_results', JSON.stringify(results));
  }, [results]);

  const handleBatchComplete = async (newResults: any[]) => {
    console.log('Batch processing complete, preparing to save results:', newResults.length);
    
    // Prepare full data for local state
    const allData = newResults.map(r => ({
      user_id: session?.user?.id,
      name: r.name,
      score: Math.min(99.99, r.score || 0),
      status: 'Em Análise',
      date: r.date,
      analysis: r.analysis,
      email: r.email,
      phone: r.phone,
      role: r.role,
      file_name: r.fileName,
      skills: r.skills || [],
      strengths: r.strengths || [],
      experience_years: r.experienceYears,
      attention_areas: r.attentionAreas || [],
      tags: r.tags || [],
      job_description: prompt
    }));

    const getSupabaseData = (data: any[], missing: string[]) => {
      return data.map(item => {
        const filtered = { ...item };
        missing.forEach(col => delete filtered[col]);
        return filtered;
      });
    };

    let currentMissing = [...missingColumnsRef.current];
    let resultsForSupabase = getSupabaseData(allData, currentMissing);

    console.log('Final object to insert into Supabase:', JSON.stringify(resultsForSupabase, null, 2));

    const client = supabase;
    if (!client || !session || isVisitorMode) {
      console.warn('Supabase not configured or no session. Saving to local state only.');
      const localResults = allData.map((r, i) => ({
        ...r,
        id: `temp-${Date.now()}-${i}`,
        jobDescription: r.job_description,
        experienceYears: r.experience_years,
        attentionAreas: r.attention_areas,
        // Ensure these match Candidate interface
        skills: r.skills || [],
        strengths: r.strengths || [],
        tags: r.tags || []
      }));
      setResults(prev => {
        const next = [...localResults, ...prev];
        localStorage.setItem('i4u_results', JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      console.log('Inserting candidates into Supabase:', resultsForSupabase.length);
      let data, error;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        const result = await client
          .from('candidates')
          .insert(resultsForSupabase)
          .select();
        
        data = result.data;
        error = result.error;

        if (error && error.code === 'PGRST204') {
          console.warn(`Insertion attempt ${attempts + 1} failed due to missing column. Attempting to identify and retry...`);
          // Match 'name' column or column 'name' or column "name"
          const match = error.message.match(/column ['"]([^'"]+)['"]/) || 
                        error.message.match(/['"]([^'"]+)['"] column/);
          const missingCol = match ? match[1] : null;
          
          if (missingCol && !currentMissing.includes(missingCol)) {
            console.log(`Identified missing column: ${missingCol}. Retrying without it.`);
            currentMissing.push(missingCol);
            // Update both state and ref
            setMissingColumns(prev => {
              const next = [...new Set([...prev, missingCol])];
              missingColumnsRef.current = next;
              return next;
            });
            
            resultsForSupabase = getSupabaseData(allData, currentMissing);
            attempts++;
            continue;
          }
        }
        break;
      }

      if (error) {
        const errorMsg = `Supabase insertion error: ${error.message} (Code: ${error.code})`;
        console.error(errorMsg, {
          details: error.details,
          hint: error.hint
        });
        throw new Error(errorMsg);
      }

      if (data) {
        console.log('Successfully saved candidates to Supabase:', data.length);
        const mappedData = data.map(c => ({
          ...c,
          jobDescription: c.job_description,
          experienceYears: c.experience_years,
          fileName: c.file_name,
          attentionAreas: c.attention_areas || [],
          skills: c.skills || [],
          strengths: c.strengths || [],
          tags: c.tags || []
        }));
        setResults(prev => {
          const next = [...mappedData, ...prev];
          localStorage.setItem('i4u_results', JSON.stringify(next));
          return next;
        });
      }

      // Also save the job to the jobs table
      console.log('Saving job context to Supabase...');
      await client
        .from('jobs')
        .insert({ title: prompt, description: prompt });
        
    } catch (err) {
      console.error('Failed to save to Supabase, falling back to local state:', err);
      const localResults = allData.map((r, i) => ({
        ...r,
        id: `temp-${Date.now()}-${i}`,
        jobDescription: r.job_description,
        experienceYears: r.experience_years,
        attentionAreas: r.attention_areas
      }));
      setResults(prev => {
        const next = [...localResults, ...prev];
        localStorage.setItem('i4u_results', JSON.stringify(next));
        return next;
      });
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    const client = supabase;
    if (!client) {
      setResults(prev => prev.filter(c => c.id !== id));
      if (viewingCandidate?.id === id) setViewingCandidate(null);
      return;
    }

    const { error } = await client
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
    console.log(`Updating status for candidate ${id} to ${newStatus}`);
    
    const client = supabase;
    if (!client || id.startsWith('temp-')) {
      console.log('Updating local state only (no Supabase or temporary ID)');
      setResults(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      return;
    }

    const { error } = await client
      .from('candidates')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status in Supabase:', error);
      // Still update local state so UI is responsive
      setResults(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } else {
      console.log('Successfully updated status in Supabase');
      setResults(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    }
  };

  const handleUpdateTags = async (id: string, newTags: string[]) => {
    console.log(`Updating tags for candidate ${id} to`, newTags);
    
    const client = supabase;
    if (!client || id.startsWith('temp-')) {
      console.log('Updating local state only (no Supabase or temporary ID)');
      setResults(prev => prev.map(c => c.id === id ? { ...c, tags: newTags } : c));
      
      // Update viewing candidate if it's the one being updated
      if (viewingCandidate?.id === id) {
        setViewingCandidate({ ...viewingCandidate, tags: newTags });
      }
      return;
    }

    const { error } = await client
      .from('candidates')
      .update({ tags: newTags })
      .eq('id', id);

    if (error) {
      console.error('Error updating tags in Supabase:', error);
      // Still update local state so UI is responsive
      setResults(prev => prev.map(c => c.id === id ? { ...c, tags: newTags } : c));
    } else {
      console.log('Successfully updated tags in Supabase');
      setResults(prev => prev.map(c => c.id === id ? { ...c, tags: newTags } : c));
      
      // Update viewing candidate if it's the one being updated
      if (viewingCandidate?.id === id) {
        setViewingCandidate({ ...viewingCandidate, tags: newTags });
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-2">
            <span className="text-primary font-bold text-2xl animate-pulse">I4U</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando Camada...
          </div>
        </div>
      </div>
    );
  }

  if (!session && !isVisitorMode) {
    return <Auth onVisitorMode={() => setIsVisitorMode(true)} />;
  }

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
        user={session?.user}
      />
      
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col relative w-full overflow-x-hidden">
        <TopBar 
          apiKey={apiKey} 
          isApiValidated={isApiValidated}
          dbStatus={dbStatus}
          isTestingConnection={isTestingConnection}
          onMenuClick={() => setIsSidebarOpen(true)} 
          searchTerm={globalSearch}
          setSearchTerm={setGlobalSearch}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
        
        {/* Global Top Scrollbar */}
        <div 
          ref={topScrollRef}
          className="fixed top-20 left-0 lg:left-64 right-0 z-40 overflow-x-auto h-2 bg-white/80 backdrop-blur-sm border-b border-slate-100"
        >
          <div className="w-[1400px] xl:w-full h-1"></div>
        </div>

        <div 
          ref={tableContainerRef} 
          className="flex-1 overflow-x-auto pt-24"
        >
          <div className="px-4 md:px-10 pb-12 w-full flex-1">
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
                    <Dashboard 
                      results={results} 
                      onNavigate={setActiveTab} 
                      onViewCandidate={(c) => setViewingCandidate(c)}
                    />
                  </div>
                )}

                {activeTab === 'candidates' && (
                  <div className="space-y-6 relative">
                    <CandidateList 
                      candidates={results} 
                      externalSearchTerm={globalSearch}
                      onViewProfile={(c) => setViewingCandidate(c)}
                      onDelete={handleDeleteCandidate}
                      onUpdateStatus={handleUpdateStatus}
                      onUpdateTags={handleUpdateTags}
                    />
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
                      onViewDetails={(c) => setViewingCandidate(c)}
                    />
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="max-w-5xl">
                    <UserProfile user={session?.user} />
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="max-w-2xl">
                    <section className="mb-8">
                      <h2 className="text-3xl font-headline font-bold text-slate-900">Configurações</h2>
                      <p className="text-slate-500">Gerencie suas chaves de API e conexões de serviço.</p>
                    </section>
                    <ApiConfig 
                      apiKey={apiKey} 
                      onApiKeyChange={(key) => {
                        setApiKey(key);
                        setIsApiValidated(false);
                      }} 
                      onValidationSuccess={() => setIsApiValidated(true)}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {viewingCandidate && (
                <CandidateProfile 
                  candidate={viewingCandidate} 
                  onClose={() => setViewingCandidate(null)} 
                  onDelete={handleDeleteCandidate}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdateTags={handleUpdateTags}
                />
              )}
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
