'use client';

import React from 'react';
import { Search, Bell, Settings, CheckCircle2, Menu } from 'lucide-react';

interface TopBarProps {
  apiKey?: string;
  supabaseStatus?: 'connected' | 'disconnected' | 'not-configured';
  onMenuClick?: () => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  setActiveTab?: (tab: string) => void;
  activeTab?: string;
}

export default function TopBar({ 
  apiKey, 
  supabaseStatus, 
  onMenuClick, 
  searchTerm = '', 
  setSearchTerm, 
  setActiveTab,
  activeTab = 'dashboard'
}: TopBarProps) {
  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 z-40 bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 border-b border-slate-100 transition-all duration-300">
      <div className="flex items-center gap-4 md:gap-8">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative hidden xl:block w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar candidatos, vagas ou logs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm?.(e.target.value);
              if (e.target.value && setActiveTab && activeTab !== 'candidates' && activeTab !== 'dashboard') {
                // If searching from a tab that isn't the list or dashboard, maybe switch to list
                 setActiveTab('candidates');
              }
              // Even better: if they start typing, just make sure they go to where the list is eventually
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 transition-all outline-none"
          />
        </div>
        <nav className="hidden md:flex items-center gap-6 font-medium text-sm">
          <button 
            onClick={() => setActiveTab?.('batch')}
            className="text-slate-500 hover:text-primary transition-all whitespace-nowrap cursor-pointer"
          >
            Recrutamento Direto
          </button>
          <button 
            onClick={() => setActiveTab?.('candidates')}
            className="text-slate-500 hover:text-primary transition-all whitespace-nowrap cursor-pointer"
          >
            Banco de Talentos
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {supabaseStatus === 'connected' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            DB Conectado
          </div>
        )}
        {supabaseStatus === 'disconnected' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            DB Erro
          </div>
        )}
        {supabaseStatus === 'not-configured' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            DB Offline
          </div>
        )}
        
        {apiKey ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            API Conectada
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            API Desconectada
          </div>
        )}
        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-all">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
