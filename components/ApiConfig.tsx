'use client';

import React from 'react';
import { Key, CheckCircle2, Eye, EyeOff, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface ApiConfigProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export default function ApiConfig({ apiKey, setApiKey }: ApiConfigProps) {
  const [showKey, setShowKey] = React.useState(false);

  return (
    <div className="bg-secondary text-white p-8 rounded-xl border border-white/5 relative overflow-hidden shadow-xl h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <Key className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Configuração da API</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Provedor de Endpoint
          </label>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-white/10 flex items-center justify-between">
            <span className="text-sm font-medium">I4U AI Resume API</span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Chave de API Secreta
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Insira sua chave de API aqui..."
              className="w-full bg-slate-800/50 border-none rounded-lg py-3 px-4 text-sm font-mono text-slate-200 focus:ring-2 focus:ring-primary/40"
            />
            <button 
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button className="w-full py-3 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
            Testar Conexão
          </button>
          <button 
            onClick={() => setApiKey('')}
            className="w-full py-3 text-slate-400 font-semibold text-sm hover:text-white transition-all"
          >
            Revogar Chave de Acesso
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Latência</span>
            <span className="text-xs font-bold text-primary">124ms</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(235,93,29,0.5)]"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Janela de processamento ideal ativa.</p>
        </div>
      </div>
    </div>
  );
}
