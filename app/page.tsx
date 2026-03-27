'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Dashboard from '@/components/Dashboard';
import ApiConfig from '@/components/ApiConfig';
import BatchUpload from '@/components/BatchUpload';
import CandidateList from '@/components/CandidateList';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [apiKey, setApiKey] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);

  const handleBatchComplete = (newResults: any[]) => {
    setResults(prev => [...newResults, ...prev]);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
        <TopBar />
        
        <div className="pt-24 px-10 pb-12 max-w-7xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-8">
                    <Dashboard />
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    <ApiConfig apiKey={apiKey} setApiKey={setApiKey} />
                  </div>
                </div>
              )}

              {activeTab === 'candidates' && (
                <div className="space-y-6">
                  <section>
                    <h2 className="text-3xl font-headline font-bold text-slate-900">Banco de Talentos</h2>
                    <p className="text-slate-500">Visualize e filtre os candidatos analisados pela IA.</p>
                  </section>
                  <CandidateList />
                </div>
              )}

              {activeTab === 'batch' && (
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-8">
                    <section className="mb-8">
                      <h2 className="text-3xl font-headline font-bold text-slate-900">Envio em Lote</h2>
                      <p className="text-slate-500">Faça o upload de múltiplos currículos para análise simultânea.</p>
                    </section>
                    <BatchUpload apiKey={apiKey} onComplete={handleBatchComplete} />
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    <ApiConfig apiKey={apiKey} setApiKey={setApiKey} />
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="max-w-2xl">
                  <section className="mb-8">
                    <h2 className="text-3xl font-headline font-bold text-slate-900">Configurações</h2>
                    <p className="text-slate-500">Gerencie suas chaves de API e conexões de serviço.</p>
                  </section>
                  <ApiConfig apiKey={apiKey} setApiKey={setApiKey} />
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
