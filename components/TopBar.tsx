'use client';

import React from 'react';
import { Search, Bell, Settings, CheckCircle2, Menu } from 'lucide-react';

interface TopBarProps {
  apiKey?: string;
  onMenuClick?: () => void;
}

export default function TopBar({ apiKey, onMenuClick }: TopBarProps) {
  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 z-40 bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 border-b border-slate-100 transition-all duration-300">
      <div className="flex items-center gap-4 md:gap-8">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative hidden md:block w-64 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar candidatos, vagas ou logs..."
            className="w-full bg-slate-50 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 transition-all"
          />
        </div>
        <nav className="flex items-center gap-6 font-medium text-sm">
          <a href="#" className="text-slate-500 hover:text-primary transition-all">Recrutamento Direto</a>
          <a href="#" className="text-slate-500 hover:text-primary transition-all">Banco de Talentos</a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
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
