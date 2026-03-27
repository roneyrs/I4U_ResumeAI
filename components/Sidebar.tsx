'use client';

import React from 'react';
import { LayoutDashboard, Users, CloudUpload, Settings, Plus, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'candidates', label: 'Banco de Talentos', icon: Users },
    { id: 'batch', label: 'Upload em Lote', icon: CloudUpload },
    { id: 'profile', label: 'Perfil do Usuário', icon: User },
    { id: 'api', label: 'Configurações API', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "h-screen w-64 fixed left-0 top-0 bg-secondary text-white flex flex-col p-4 gap-2 antialiased text-sm z-[70] transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
             <span className="text-primary font-bold text-xl">I4U</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">I4U Resume</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">A Camada de Inteligência</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out",
              activeTab === item.id
                ? "text-white font-semibold bg-primary shadow-sm"
                : "text-slate-300 hover:text-primary hover:bg-white/5"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-700">
        <button 
          onClick={() => setActiveTab('batch')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium shadow-md transition-all hover:brightness-110 active:scale-95 mb-4"
        >
          <Plus className="w-4 h-4" />
          Nova Triagem
        </button>

        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600 relative">
            <Image
              src="https://picsum.photos/seed/admin/100/100"
              alt="User"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Usuário Admin</p>
            <p className="text-xs text-slate-400 truncate">Plano Enterprise</p>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
